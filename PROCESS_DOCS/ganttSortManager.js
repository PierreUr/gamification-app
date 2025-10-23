import { Timestamp, writeBatch, doc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
/**
 * Gantt Sort Manager
 * 
 * Diese Klasse ist verantwortlich für die Implementierung der "Auto-Sortieren"-Funktionalität
 * im Gantt-Chart. Sie ordnet Quests neu an und fügt Pausen gemäß den Pomodoro-Regeln ein.
 */
export class GanttSortManager {
    constructor(ganttManager) {
        this.ganttManager = ganttManager;
    }

    async sortAllQuests() {
        const pomodoroSettings = this.ganttManager.questManager?.userProfile?.pomodoroSettings;
        const pomodoroBreaks = this.ganttManager.pomodoroBreaks;

        console.log('Analyse Re-Eval 1: pomodoroModeActive:', this.ganttManager.pomodoroModeActive);
        console.log('Analyse Re-Eval 1: pomodoroBreaks:', pomodoroBreaks);
        console.log('Analyse Re-Eval 1: pomodoroBreaks.length:', pomodoroBreaks?.length);

        if (this.ganttManager.pomodoroModeActive && pomodoroBreaks && pomodoroBreaks.length > 0) {
            this._sortIntoPomodoroGrid(pomodoroSettings, pomodoroBreaks);
        } else {
            this._sortChronologically();
        }
    }

    async _sortChronologically() {
        const scheduledQuests = this.ganttManager.localQuests.filter(q => q.ganttScheduledAt)
            .sort((a, b) => a.ganttScheduledAt.toMillis() - b.ganttScheduledAt.toMillis());

        if (scheduledQuests.length < 2) return;

        const batch = writeBatch(this.ganttManager.db);
        let lastQuestEndTime = 0;

        scheduledQuests.forEach((quest, index) => {
            if (index > 0) {
                const newStartTime = new Date(lastQuestEndTime);
                const questRef = doc(this.ganttManager.db, 'todos', quest.id);
                batch.update(questRef, { ganttScheduledAt: Timestamp.fromDate(newStartTime) });
                lastQuestEndTime = newStartTime.getTime() + (quest.durationMinutes * 60000);
            } else {
                lastQuestEndTime = quest.ganttScheduledAt.toMillis() + (quest.durationMinutes * 60000);
            }
        });

        await batch.commit();
        this.ganttManager.showNotification("Alle Quests wurden chronologisch sortiert.", "success");
    }

    async _sortIntoPomodoroGrid(settings, breaks) {
        const questsToSort = this.ganttManager.localQuests
            .filter(q => q.ganttScheduledAt); // Get all quests scheduled for the Gantt
        
        console.log('Analyse Schritt 2.5: Alle lokalen Quests:', this.ganttManager.localQuests);
        console.log('Analyse Schritt 2.5: Gefilterte Quests (questsToSort):', questsToSort);

        if (questsToSort.length === 0) {
            this.ganttManager.showNotification("Keine Quests zum Sortieren vorhanden.", "info");
            return;
        }

        const batch = writeBatch(this.ganttManager.db);
        let lastEventEndTime = this._parseTimeToMillis(settings.startTime);

        const allBreaks = [...breaks].sort((a, b) => a.startTime - b.startTime);

        questsToSort.forEach(quest => {
            console.groupCollapsed(`Analyse Schritt 3: Verarbeite Quest "${quest.text}"`);
            console.log('Zeit vor Schleife:', new Date(lastEventEndTime).toLocaleString());
            // Find the next available slot by skipping over breaks
            while (allBreaks.some(event => lastEventEndTime < event.endTime && lastEventEndTime + (quest.durationMinutes * 60000) > event.startTime)) {
                const conflictingEvent = allBreaks.find(event => lastEventEndTime < event.endTime && lastEventEndTime + (quest.durationMinutes * 60000) > event.startTime);
                console.log(`Konflikt mit Pause gefunden. Springe von ${new Date(lastEventEndTime).toLocaleTimeString()} zu ${new Date(conflictingEvent.endTime).toLocaleTimeString()}`);
                lastEventEndTime = conflictingEvent.endTime;
            }
            
            console.log('Zeit nach Schleife (Neue Startzeit):', new Date(lastEventEndTime).toLocaleString());
            const questRef = doc(this.ganttManager.db, 'todos', quest.id);
            batch.update(questRef, { ganttScheduledAt: Timestamp.fromMillis(lastEventEndTime) });
            lastEventEndTime += quest.durationMinutes * 60000; // The end of this quest becomes the start for the next
        });

        await batch.commit();
        this.ganttManager.showNotification("Quests wurden in das Pomodoro-Raster einsortiert.", "success");
        console.groupEnd();
    }

    _parseTimeToMillis(timeString) {
        if (!timeString) return new Date().setHours(9, 0, 0, 0);
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date.getTime();
    }
}