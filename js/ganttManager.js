import { Timestamp, updateDoc, doc, writeBatch } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { GanttSortManager } from "./ganttSortManager.js";
import { PomodoroGridGenerator } from "./PomodoroGridGenerator.js";
import { GanttScheduleGenerator } from "./ganttScheduleGenerator.js";
import { GanttUIManager } from "./GanttUI.js";

class GanttBreakManager {
    constructor(db, showNotificationCallback, getLocalQuestsCallback) {
        this.db = db;
        this.showNotification = showNotificationCallback;
        this.getLocalQuests = getLocalQuestsCallback;
        this.isAutoBreakCooldown = false;
    }

    /**
     * UI-DESIGN: Fügt automatisch generierte Pausen zwischen Quests hinzu.
     * Diese Methode modifiziert die Quest-Daten, was direkt zu neuen visuellen Pausenbalken im Gantt-Chart führt.
     */
    async addAutoBreaks(breakDuration) {
        if (this.isAutoBreakCooldown) {
            this.showNotification("Bitte warte einen Moment.", "info");
            return;
        }
        this.isAutoBreakCooldown = true;
        setTimeout(() => { this.isAutoBreakCooldown = false; }, 1000);

        let scheduledQuests = this.getLocalQuests()
            .filter(q => q.ganttScheduledAt)
            .sort((a, b) => a.ganttScheduledAt.toMillis() - b.ganttScheduledAt.toMillis());
    
        if (scheduledQuests.length === 0) {
            this.showNotification("Nicht genügend Aufgaben für automatische Pausen.", "info");
            return;
        }
    
        const batch = writeBatch(this.db);
    
        // Create a clean version of breaks for each quest, without auto-breaks
        const questsWithCleanedBreaks = scheduledQuests.map(quest => {
            const nonAutoBreaks = (quest.breaks || []).filter(b => !b.isAuto);
            return { ...quest, breaks: nonAutoBreaks };
        });

        // Update all quests that had auto-breaks to remove them
        scheduledQuests.forEach(quest => {
            if ((quest.breaks || []).some(b => b.isAuto)) {
                const questRef = doc(this.db, 'todos', quest.id);
                const cleanedBreaks = (quest.breaks || []).filter(b => !b.isAuto);
                batch.update(questRef, { breaks: cleanedBreaks });
            }
        });

        // Now, working with the cleaned local data, add the new breaks
        questsWithCleanedBreaks.forEach(quest => {
            const questEndTime = quest.ganttScheduledAt.toMillis() + quest.durationMinutes * 60000;
            const newBreak = { id: `auto_break_${quest.id}_${Date.now()}`, scheduledAt: Timestamp.fromMillis(questEndTime), durationMinutes: breakDuration, isAuto: true };
            const updatedBreaks = [...quest.breaks, newBreak];
            const questRef = doc(this.db, 'todos', quest.id);
            batch.update(questRef, { breaks: updatedBreaks });
        });
    
        await batch.commit();
        this.showNotification(`${breakDuration} Minuten Pausen visuell eingefügt.`, "success");
    }

    /**
     * UI-DESIGN: Fügt eine manuelle Pause zu einer Quest hinzu.
     * Das Ergebnis ist ein neuer, manuell platzierter Pausenbalken innerhalb eines Quest-Balkens.
     */
    async addManualBreak(questId, breakMinutes, workMinutes) {
        const quest = this.getLocalQuests().find(q => q.id === questId);
        if (!quest || !quest.ganttScheduledAt) return;

        // Use the synchronized logic from the warning manager
        const insertTimeMillis = this.ganttManager.uiManager.warningManager.findNextBreakInsertionPoint(quest, workMinutes);
        if (insertTimeMillis === null) {
            this.showNotification(`Kein Arbeitsblock > ${workMinutes} Min. für eine Pause gefunden.`, "info");
            return;
        }
        const newBreak = { id: `break_${Date.now()}`, scheduledAt: Timestamp.fromMillis(insertTimeMillis), durationMinutes: breakMinutes };
        const updatedBreaks = [...(quest.breaks || []), newBreak];
        await updateDoc(doc(this.db, 'todos', questId), { breaks: updatedBreaks });
        this.showNotification(`${breakMinutes} Min. Pause visuell hinzugefügt.`, "success");
    }

    /**
     * UI-DESIGN: Entfernt alle automatisch generierten Pausen.
     * Dies bereinigt die visuelle Darstellung im Gantt-Chart von den Auto-Pausen.
     */
    deleteAutoBreaks() {
        const batch = writeBatch(this.db);
        this.getLocalQuests().forEach(quest => {
            const autoBreaksExist = (quest.breaks || []).some(b => b.isAuto);
            if (autoBreaksExist) {
                const manualBreaks = quest.breaks.filter(b => !b.isAuto);
                const questRef = doc(this.db, 'todos', quest.id);
                batch.update(questRef, { breaks: manualBreaks });
            }
        });
        batch.commit().then(() => this.showNotification("Alle automatischen Pausen wurden entfernt.", "info"));
    }

    /**
     * UI-DESIGN: Entfernt alle Pausen (automatisch und manuell).
     * Dies setzt die visuelle Darstellung der Quest-Balken auf ihren Ursprungszustand ohne Unterbrechungen zurück.
     */
    deleteAllBreaks() {
        const batch = writeBatch(this.db);
        this.getLocalQuests().forEach(quest => {
            if ((quest.breaks || []).length > 0) {
                const questRef = doc(this.db, 'todos', quest.id);
                batch.update(questRef, { breaks: [] });
            }
        });
        batch.commit().then(() => this.showNotification("Alle Pausen wurden entfernt.", "info"));
    }

    /**
     * UI-DESIGN: Löscht einen einzelnen, spezifischen Pausenbalken.
     * Dies ermöglicht eine gezielte manuelle Korrektur der visuellen Pausenplanung.
     */
    async deleteSingleBreak(questId, breakId) {
        const quest = this.getLocalQuests().find(q => q.id === questId);
        if (!quest || !quest.breaks) return;

        const updatedBreaks = quest.breaks.filter(b => b.id !== breakId);
        await updateDoc(doc(this.db, 'todos', questId), { breaks: updatedBreaks });
        this.showNotification("Pause entfernt.", "info");
    }

}

export class GanttManager {
    constructor(db, showNotificationCallback) {
        this.db = db;
        this.showNotification = showNotificationCallback;


        this._initializeDOMElements();

        // State
        this.localQuests = [];
        this.pomodoroModeActive = false; // State to control rendering of pomodoro elements
        this.pomodoroSchedule = []; // Array for the generated work/break schedule
        this.pomodoroBreaks = []; // Array für die neuen, visualisierten Pausen
        this.currentGanttDate = new Date(); // The date currently being viewed in the Gantt chart
        this.pendingChanges = new Map(); // Sammelt ungespeicherte Änderungen
        this.logQuestPositioning = true; // Default logging state

        // Sub-Managers
        this.breakManager = new GanttBreakManager(this.db, this.showNotification, () => this.localQuests);
        this.breakManager.ganttManager = this;
        this.uiManager = new GanttUIManager(this);
        this.scheduleGenerator = new GanttScheduleGenerator(this); // Initialize the new ScheduleGenerator
        this.pomodoroGridGenerator = new PomodoroGridGenerator();
        this.sortManager = new GanttSortManager(this); // Initialize the new SortManager

    }
    setDependencies(questManager) {
        // When dependencies are set, check if we need to show the activation modal on startup
        const settings = questManager?.userProfile?.pomodoroSettings;
        if (settings?.pomodoroModeActive) {
            // Use a timeout to ensure the UI is ready
            setTimeout(() => this.uiManager.interactionManager._openPomodoroActivationModal(), 500);
        }

        this.questManager = questManager;
        this.uiManager.setDependencies(questManager);
    }

    _initializeDOMElements() {
        this.ganttChartContainer = document.getElementById('div-4320');
        this.ganttViewSelect = document.getElementById('gantt-view-select');
        this.ganttTimescaleSelect = document.getElementById('gantt-timescale-select');
        this.ganttHoursViewSelect = document.getElementById('gantt-hours-view-select');
        this.sortAllBtn = document.getElementById('gantt-sort-all-btn');
        this.pomodoroToggle = document.getElementById('gantt-pomodoro-toggle');
    }

    _attachEventListeners() {
        this.uiManager.attachEventListeners();
        this._updateHoursViewOptions(); // Now called here

        if (this.ganttViewSelect) this.ganttViewSelect.addEventListener('change', () => this.render(this.localQuests));
        if (this.ganttTimescaleSelect) this.ganttTimescaleSelect.addEventListener('change', () => {
            this._updateHoursViewOptions();
            this.render(this.localQuests);
        });
        if (this.ganttHoursViewSelect) this.ganttHoursViewSelect.addEventListener('change', () => this.render(this.localQuests));
    }

    _updateHoursViewOptions() {
        if (!this.ganttTimescaleSelect || !this.ganttHoursViewSelect) return;

        const scale = parseInt(this.ganttTimescaleSelect.value, 10);
        let options;

        if (scale <= 15) {
            options = [1, 2, 4];
        } else if (scale <= 30) {
            options = [4, 6, 8];
        } else { // 60
            options = [8, 10, 12];
        }

        this.ganttHoursViewSelect.innerHTML = '';
        options.forEach(h => {
            this.ganttHoursViewSelect.innerHTML += `<option value="${h}">${h}h</option>`;
        });
    }

    render(quests) {
        this.localQuests = quests;
        this.uiManager.render(quests);
    }

    /**
     * Generates and renders the Pomodoro break grid.
     * @param {object} settings - The settings for the Pomodoro grid.
     */
    renderPomodoroGrid(settings) {
        let allDayBreaks = this.pomodoroGridGenerator.generateGrid(settings);
        // Assign a unique ID to each break object right after generation.
        allDayBreaks.forEach(b => b.id = `pomodoro_${b.startTime}`);

        // Find the end time of the last quest to avoid rendering unnecessary breaks
        const scheduledQuests = this.localQuests.filter(q => q.ganttScheduledAt);
        if (scheduledQuests.length > 0) {
            const lastQuestEndTime = Math.max(...scheduledQuests.map(q => {
                const startTime = (q.ganttScheduledAt || q.scheduledAt).toMillis();
                return startTime + (q.durationMinutes * 60000);
            }));
            // Filter breaks to only include those that start before the last quest ends
            this.pomodoroBreaks = allDayBreaks.filter(b => b.startTime < lastQuestEndTime);
        } else {
            // If no quests are scheduled, we don't need to show any breaks yet.
            this.pomodoroBreaks = [];
        }

        this.render(this.localQuests); // Re-render the whole chart with the new breaks
    }

    /**
     * Fügt eine Änderung zur Liste der ungespeicherten Änderungen hinzu.
     * @param {string} questId - Die ID der Quest.
     * @param {object} changes - Das Objekt mit den geänderten Feldern.
     */
    addPendingChange(questId, changes) {
        if (this.pendingChanges.has(questId)) {
            // Bestehende Änderungen für diese Quest mit neuen zusammenführen
            const existingChanges = this.pendingChanges.get(questId);
            this.pendingChanges.set(questId, { ...existingChanges, ...changes });
        } else {
            this.pendingChanges.set(questId, changes);
        }
        this.uiManager.toggleSaveButton(true);
    }

    /**
     * Speichert alle anstehenden Änderungen in der Datenbank.
     */
    async savePendingChanges() {
        if (this.pendingChanges.size === 0) return;

        const batch = writeBatch(this.db);
        this.pendingChanges.forEach((changes, questId) => {
            const questRef = doc(this.db, 'todos', questId);
            batch.update(questRef, changes);
        });

        await batch.commit();
        this.pendingChanges.clear();
        this.uiManager.toggleSaveButton(false);
        this.showNotification("Änderungen gespeichert!", "success");
    }

    triggerSortIfPomodoroActive() {
        if (this.pomodoroModeActive) {
            this.sortManager.sortAllQuests();
        }
    }
}