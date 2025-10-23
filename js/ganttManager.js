import { Timestamp, updateDoc, doc, writeBatch } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { GanttSortManager } from "./ganttSortManager.js";
import { PomodoroGridGenerator } from "./PomodoroGridGenerator.js";
import { GanttScheduleGenerator } from "./ganttScheduleGenerator.js";

class GanttWarningManager {
    constructor() {
        this.maxWorkSessionMinutes = 45;
        this.pomodoroModeActive = false; // New state
    }

    getQuestWarning(quest, index, allScheduledQuests, workMinutesThreshold = 45) {
        const warnings = [];
        if (this.pomodoroModeActive) {
            // Check for long segment
            if (this.findNextBreakInsertionPoint(quest, workMinutesThreshold)) {
                warnings.push({ text: `Ein Arbeitsblock ist > ${this.maxWorkSessionMinutes}min!`, type: 'long_segment' });
            }
    
            // Check for missing gap
            if (index < allScheduledQuests.length - 1) {
                const nextQuest = allScheduledQuests[index + 1];
                const questEndTime = this._getActualQuestEndTime(quest);
                const nextQuestStartTime = (nextQuest.ganttScheduledAt || nextQuest.scheduledAt).toMillis();
                const gap = nextQuestStartTime - questEndTime;
    
                if (gap < 1 * 60000) { // Gap is less than 1 minute and not negative (overlap)
                    warnings.push({ text: "Keine Pause zwischen den Pomodoro-Einheiten!", type: 'no_gap' });
                }
            }
        }
        // Return array of warnings, or null if empty
        return warnings.length > 0 ? warnings : null;
    }

    _getActualQuestEndTime(quest) {
        const startTime = (quest.ganttScheduledAt || quest.scheduledAt).toMillis();
        const totalBreakDurationMillis = (quest.breaks || []).reduce((acc, b) => acc + (b.durationMinutes * 60000), 0);
        return startTime + (quest.durationMinutes * 60000) + totalBreakDurationMillis;
    }

    findNextBreakInsertionPoint(quest, workSessionMinutes) {
        const maxWorkSessionMinutes = workSessionMinutes || this.maxWorkSessionMinutes;
        const sortedBreaks = (quest.breaks || []).filter(b => !b.isAuto).sort((a, b) => a.scheduledAt.toMillis() - b.scheduledAt.toMillis());

        let lastEventEndTime = (quest.ganttScheduledAt || quest.scheduledAt)?.toMillis();
        if (!lastEventEndTime) return null;
        let accumulatedWorkMinutes = 0;

        // Iterate through segments between breaks
        for (const breakItem of sortedBreaks) {
            const workSegmentDuration = ((breakItem.scheduledAt?.toMillis() || 0) - lastEventEndTime) / 60000;

            if (workSegmentDuration >= maxWorkSessionMinutes - 0.0001) {
                return lastEventEndTime + (maxWorkSessionMinutes * 60000);
            }
            accumulatedWorkMinutes += workSegmentDuration;
            lastEventEndTime = (breakItem.scheduledAt?.toMillis() || 0) + (breakItem.durationMinutes * 60000);
        }

        // Check the final segment from the last break (or quest start) to the end of the total work duration
        const finalSegmentDuration = quest.durationMinutes - accumulatedWorkMinutes;

        if (finalSegmentDuration >= maxWorkSessionMinutes - 0.0001) { // Use a small tolerance for floating point issues
            return lastEventEndTime + (maxWorkSessionMinutes * 60000);
        }

        return null;
    }
}

class GanttBreakManager {
    constructor(db, showNotificationCallback, getLocalQuestsCallback) {
        this.db = db;
        this.showNotification = showNotificationCallback;
        this.getLocalQuests = getLocalQuestsCallback;
        this.isAutoBreakCooldown = false;
    }

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

    async addManualBreak(questId, breakMinutes, workMinutes) {
        const quest = this.getLocalQuests().find(q => q.id === questId);
        if (!quest || !quest.ganttScheduledAt) return;

        // Use the synchronized logic from the warning manager
        const insertTimeMillis = this.ganttManager.warningManager.findNextBreakInsertionPoint(quest, workMinutes);
        if (insertTimeMillis === null) {
            this.showNotification(`Kein Arbeitsblock > ${workMinutes} Min. für eine Pause gefunden.`, "info");
            return;
        }
        const newBreak = { id: `break_${Date.now()}`, scheduledAt: Timestamp.fromMillis(insertTimeMillis), durationMinutes: breakMinutes };
        const updatedBreaks = [...(quest.breaks || []), newBreak];
        await updateDoc(doc(this.db, 'todos', questId), { breaks: updatedBreaks });
        this.showNotification(`${breakMinutes} Min. Pause visuell hinzugefügt.`, "success");
    }

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

    async deleteSingleBreak(questId, breakId) {
        const quest = this.getLocalQuests().find(q => q.id === questId);
        if (!quest || !quest.breaks) return;

        const updatedBreaks = quest.breaks.filter(b => b.id !== breakId);
        await updateDoc(doc(this.db, 'todos', questId), { breaks: updatedBreaks });
        this.showNotification("Pause entfernt.", "info");
    }

}

class GanttInteractionManager {
    constructor(ganttManager) {
        this.ganttManager = ganttManager;
        this.db = ganttManager.db;
        this.showNotification = ganttManager.showNotification; // This is correct
        this.questManager = null; // Set by GanttManager

        this.ganttChartContainer = ganttManager.ganttChartContainer;


        this.ganttScrollLeft = 0;
        this.ganttScrollTop = 0;
        this.isDragging = false;
        this.draggedOffsetX = 0; // To store the mouse offset within the bar
    }

    attachEventListeners() {
        // Initialize DOM elements here, when we are sure they exist.
        this.ganttViewSelect = document.getElementById('gantt-view-select');
        this.sortAllBtn = document.getElementById('gantt-sort-all-btn');
        this.pomodoroToggle = document.getElementById('gantt-pomodoro-toggle');
        this.pomodoroSettingsBtn = document.getElementById('gantt-pomodoro-settings-btn');
        this.pomodoroActivationModal = document.getElementById('div-7120');
        this.pomodoroSettingsModal = document.getElementById('div-7130');
        this.pomodoroSettingsSaveBtn = document.getElementById('pomodoro-settings-save-btn');
        this.addFixedBreakBtn = document.getElementById('pomodoro-add-fixed-break-btn');
        this.fixedBreaksContainer = document.getElementById('pomodoro-fixed-breaks-container');
        this.longBreakDurationInput = document.getElementById('pomodoro-long-break-duration');
        this.startTimeInput = document.getElementById('pomodoro-start-time');
        this.shortBreakColorInput = document.getElementById('pomodoro-short-break-color');
        this.longBreakColorInput = document.getElementById('pomodoro-long-break-color');
        this.pomodoroStyleInputs = document.querySelectorAll('input[name="pomodoro-style"]');
        this.pomodoroLineSettingsContainer = document.getElementById('pomodoro-line-settings');
        this.lineColorInput = document.getElementById('pomodoro-line-color');
        this.pomodoroBarSettingsContainer = document.getElementById('pomodoro-bar-settings');
        this.barBorderColorInput = document.getElementById('pomodoro-break-bar-border-color');
        this.barRoundedCornersCheckbox = document.getElementById('pomodoro-break-bar-rounded-corners');
        this.barOutlineThicknessInput = document.getElementById('pomodoro-bar-outline-thickness');
        this.lineThicknessInput = document.getElementById('pomodoro-line-thickness');
        // Logging Toggles
        this.logQuestToggle = document.getElementById('log-toggle-quests');
        this.logBreakToggle = document.getElementById('log-toggle-breaks');
        // Test Tools
        this.testShowPomodoroBreaksBtn = document.getElementById('test-show-pomodoro-breaks-btn');
        this.pomodoroBreaksTestModal = document.getElementById('div-8120');
        this.pomodoroSplitModal = document.getElementById('div-7140');

        this._addGanttDragDropListeners();
        if (this.sortAllBtn) this.sortAllBtn.addEventListener('click', () => this.ganttManager.sortManager.sortAllQuests()); // This now handles both modes
        
        if (this.pomodoroToggle) {
            this.pomodoroToggle.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this._openPomodoroActivationModal();
                    // Prevent the mode from being truly active until a choice is made
                    e.target.checked = false; 
                } else {
                    this._deactivatePomodoroMode();
                }
            });
        }

        if (this.pomodoroSettingsBtn) {
            this.pomodoroSettingsBtn.addEventListener('click', () => {
                this._loadPomodoroSettings();
                this.pomodoroSettingsModal.classList.remove('hidden');
            });
        }

        // Listeners for the new activation modal
        this.pomodoroActivationModal.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            if (button.classList.contains('modal-close-btn') || button.id === 'pomodoro-activate-no-breaks-btn') {
                this.pomodoroActivationModal.classList.add('hidden');
            }

            if (button.id === 'pomodoro-activate-btn') {
                const startTimeInput = document.getElementById('pomodoro-initial-start-time');
                const breakDurationSelect = document.getElementById('pomodoro-initial-break-duration');
                const workIntervalSelect = document.getElementById('pomodoro-work-interval');

                const startTime = startTimeInput.value;
                const shortBreak = parseInt(breakDurationSelect.value, 10);
                const workInterval = parseInt(workIntervalSelect.value, 10);
                this._activatePomodoroMode(startTime, shortBreak, workInterval);
                this.pomodoroActivationModal.classList.add('hidden');
            }
        });

        // Listener for settings modal
        if (this.pomodoroSettingsSaveBtn) {
            this.pomodoroSettingsSaveBtn.addEventListener('click', () => this._savePomodoroSettings());
        }
        if (this.addFixedBreakBtn) {
            this.addFixedBreakBtn.addEventListener('click', () => this._renderFixedBreak());
        }
        if (this.fixedBreaksContainer) {
            this.fixedBreaksContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('delete-fixed-break-btn')) {
                    e.target.closest('.fixed-break-entry').remove();
                }
            });
        }

        this.pomodoroStyleInputs.forEach(input => {
            input.addEventListener('change', () => {
                this._updatePomodoroStyleSelection();
            });
        });

        // Logging Toggles
        if (this.logQuestToggle) {
            this.logQuestToggle.addEventListener('change', (e) => {
                this.ganttManager.logQuestPositioning = e.target.checked;
            });
        }
        if (this.logBreakToggle) {
            this.logBreakToggle.addEventListener('change', (e) => {
                this.ganttManager.logBreakRendering = e.target.checked;
            });
        }

        // Bugfix: Add listener to close the settings modal
        this.pomodoroSettingsModal.querySelector('.modal-close-btn').addEventListener('click', () => this.pomodoroSettingsModal.classList.add('hidden'));

        // Test Tools Listeners
        if (this.testShowPomodoroBreaksBtn) {
            this.testShowPomodoroBreaksBtn.addEventListener('click', () => {
                this.pomodoroBreaksTestModal.classList.remove('hidden');
                this._renderPomodoroBreaksList();
            });
        }
        if (this.pomodoroBreaksTestModal) {
            this.pomodoroBreaksTestModal.querySelector('.modal-close-btn').addEventListener('click', () => this.pomodoroBreaksTestModal.classList.add('hidden'));
            this.pomodoroBreaksTestModal.addEventListener('click', (e) => {
                const button = e.target.closest('button[data-action="add-pomodoro-time"]');
                if (button) {
                    const breakId = button.dataset.breakId;
                    const minutesToAdd = parseInt(button.dataset.addMinutes, 10);
                    this._addTimeToPomodoroBreak(breakId, minutesToAdd);
                    this._renderPomodoroBreaksList(); // Re-render the list to show the change
                }
            });
        }

        if (this.pomodoroSplitModal) {
            this.pomodoroSplitModal.querySelector('.modal-close-btn').addEventListener('click', () => this.pomodoroSplitModal.classList.add('hidden'));
            // The confirm button has no function yet.
        }
    }

    _handlePomodoroPriorityChange(e) {
        const select = e.target;
        const questId = select.dataset.questId;
        const priority = parseInt(select.value, 10);
        if (!questId) return;

        updateDoc(doc(this.db, 'todos', questId), { pomodoroPriority: priority });
    }

    _createGanttHeaderButtons() {
        const dateDisplay = document.getElementById('gantt-current-date-display');
        if (!dateDisplay || !dateDisplay.parentElement) return;

        // Prevent creating buttons multiple times
        if (document.getElementById('gantt-header-view-btn')) return;

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'ml-4';

        // Combined "Ansicht" and Settings Button
        const viewButton = document.createElement('button');
        viewButton.id = 'gantt-header-view-btn';
        viewButton.innerHTML = 'Ansicht <span class="ml-1">⚙️</span>';
        viewButton.className = 'flex items-center px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-md';
        viewButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this._showGanttHeaderPopup(e.currentTarget);
        });

        buttonContainer.append(viewButton);
        dateDisplay.parentElement.insertBefore(buttonContainer, dateDisplay.nextSibling);
    }

    _showGanttHeaderPopup(target) {
        document.querySelector('.gantt-header-popup')?.remove();

        const popover = document.createElement('div');
        popover.className = 'gantt-header-popup absolute z-50 bg-gray-800 border border-gray-600 rounded-md shadow-lg p-4 text-white';
        
        // Dummy content for testing
        popover.innerHTML = `
            <h4 class="font-bold mb-2 border-b border-gray-600 pb-1">Ansicht & Einstellungen</h4>
            <div class="space-y-2 mt-2">
                <button class="w-full text-left text-sm p-1 hover:bg-gray-700 rounded">Zeitskala umschalten</button>
                <button class="w-full text-left text-sm p-1 hover:bg-gray-700 rounded">Sichtbare Stunden ändern</button>
            </div>
        `;

        const rect = target.getBoundingClientRect();
        popover.style.left = `${rect.left}px`;
        popover.style.top = `${rect.bottom + 5}px`;

        document.body.appendChild(popover);
        setTimeout(() => document.addEventListener('click', () => popover.remove(), { once: true }), 0);
    }

    _addGanttDragDropListeners() {
        this.ganttChartContainer.addEventListener('dragstart', (e) => {
            const bar = e.target.closest('.gantt-quest-bar[draggable="true"]');
            if (!bar) return;
            this.isDragging = true;
            this.draggedOffsetX = e.clientX - bar.getBoundingClientRect().left;

            const viewMode = this.ganttViewSelect.value;
            let scrollContainer;
            if (viewMode === 'single-line') {
                scrollContainer = this.ganttChartContainer;
                this.ganttScrollLeft = this.ganttChartContainer.scrollLeft;
                this.ganttScrollTop = this.ganttChartContainer.scrollTop;
            } else {
                scrollContainer = this.ganttChartContainer.querySelector('#gantt-timeline-scroll-container');
                this.ganttScrollLeft = scrollContainer.scrollLeft;
                this.ganttScrollTop = scrollContainer.scrollTop;
            }

            e.dataTransfer.setData('text/plain', bar.dataset.questId);
            bar.style.opacity = '0.3'; // Reduce opacity to indicate original position
            e.target.addEventListener('dragend', () => { e.target.style.opacity = '1'; }, { once: true });
        });

        // Bind resize event handlers to 'this'
        this._handleResizeMouseMove = this._handleResizeMouseMove.bind(this);
        this._handleResizeMouseUp = this._handleResizeMouseUp.bind(this);


        // Prevent default on dragover for the entire Gantt container to allow dropping anywhere inside it.
        this.ganttChartContainer.addEventListener('dragover', (e) => {
            e.preventDefault(); 
            e.dataTransfer.dropEffect = 'move';
        });

        // Attach drop listener to the Gantt container to handle the drop event.
        this.ganttChartContainer.addEventListener('drop', async (e) => {
            e.preventDefault();

            // Only proceed if the drop is within the Gantt container
            // No need to check for dropTarget anymore as the listener is on the container itself.
            
            const questId = e.dataTransfer.getData('text/plain');
            const quest = this.ganttManager.localQuests.find(q => q.id === questId);
            if (!quest) return;

            const viewMode = this.ganttViewSelect.value;

            // --- New Feature: Vertical Reordering ---
            // const targetQuestBar = e.target.closest('.gantt-quest-bar');
            // if (viewMode !== 'single-line' && targetQuestBar && targetQuestBar.dataset.questId !== questId) {
            //     await this._handleVerticalReorder(quest, targetQuestBar.dataset.questId);
            //     return;
            // }

            let pixelOffset, timelinePixelWidth, viewDate;

            if (viewMode === 'single-line') {
                const timelineCell = this.ganttChartContainer.querySelector('.relative.h-10');
                if (!timelineCell) return;
                const timelineRect = timelineCell.getBoundingClientRect();
                pixelOffset = (e.clientX - timelineRect.left + this.ganttChartContainer.scrollLeft) - this.draggedOffsetX; // Correctly apply offset
                timelinePixelWidth = timelineCell.scrollWidth;
            } else {
                const scrollContainer = this.ganttChartContainer.querySelector('#gantt-timeline-scroll-container');
                if (!scrollContainer) return;
                const containerRect = scrollContainer.getBoundingClientRect();
                pixelOffset = (e.clientX - containerRect.left + scrollContainer.scrollLeft) - this.draggedOffsetX; // Correctly apply offset
                timelinePixelWidth = scrollContainer.querySelector('#gantt-timeline-grid').scrollWidth;
            }

            viewDate = new Date();
            viewDate.setHours(0, 0, 0, 0);
            const totalDayMinutes = 24 * 60;
            const timeOffsetMinutes = (pixelOffset / timelinePixelWidth) * totalDayMinutes;
            const viewDateEnd = new Date(viewDate.getTime() + 24 * 60 * 60 * 1000);
            let newStartTime = new Date(viewDate.getTime() + timeOffsetMinutes * 60000);
            if (newStartTime < viewDate) newStartTime = viewDate;

            const questDurationMillis = quest.durationMinutes * 60000;
            if (new Date(newStartTime.getTime() + questDurationMillis) > viewDateEnd) {
                newStartTime = new Date(viewDateEnd.getTime() - questDurationMillis);
            }

            const timeDifference = newStartTime.getTime() - (quest.ganttScheduledAt || quest.scheduledAt).toMillis();

            const updatedBreaks = (quest.breaks || []).map(breakItem => {
                const newBreakTime = breakItem.scheduledAt.toMillis() + timeDifference;
                return { ...breakItem, scheduledAt: Timestamp.fromMillis(newBreakTime) };
            });

            const questEndTime = new Date(newStartTime.getTime() + quest.durationMinutes * 60000);
            if (this.ganttManager.logQuestPositioning) {
                console.log(`Quest "${quest.text}" | Manuell verschoben: ${newStartTime.toLocaleTimeString()} - ${questEndTime.toLocaleTimeString()}`);
            }
            await updateDoc(doc(this.db, 'todos', questId), { ganttScheduledAt: Timestamp.fromDate(newStartTime), breaks: updatedBreaks });
            this.showNotification(`"${quest.text}" verschoben.`);
        });
    }

    // --- Resize Feature Start ---
    _addGanttResizeListeners() {
        this.ganttChartContainer.addEventListener('mousedown', (e) => {
            const resizeHandle = e.target.closest('.gantt-resize-handle');
            if (!resizeHandle) return;

            e.preventDefault(); // Prevent text selection
            this.isResizing = true;
            this.resizingQuestId = resizeHandle.dataset.questId;
            this.resizingQuestBar = resizeHandle.closest('.gantt-quest-bar');
            
            if (!this.resizingQuestBar) return;

            this.resizeStartWidth = this.resizingQuestBar.offsetWidth;
            this.resizeStartMouseX = e.clientX;

            const quest = this.ganttManager.localQuests.find(q => q.id === this.resizingQuestId);
            this.originalQuestDuration = quest ? quest.durationMinutes : 0;

            console.log('Resize-Analyse (Start):', { startWidth: this.resizeStartWidth, startMouseX: this.resizeStartMouseX, originalDuration: this.originalQuestDuration, pixelsPerMinute: this.pixelsPerMinute });

            // Calculate pixelsPerMinute dynamically based on current view
            const viewMode = this.ganttViewSelect.value;
            let timelinePixelWidth;
            if (viewMode === 'single-line') {
                timelinePixelWidth = this.ganttChartContainer.scrollWidth;
            } else {
                const timelineGrid = this.ganttChartContainer.querySelector('#gantt-timeline-grid');
                timelinePixelWidth = timelineGrid ? timelineGrid.scrollWidth : 0;
            }
            const hoursInView = parseInt(this.ganttManager.ganttHoursViewSelect.value, 10);
            const totalViewMinutes = hoursInView * 60;
            this.pixelsPerMinute = timelinePixelWidth / totalViewMinutes;

            // Add global listeners for mousemove and mouseup
            document.addEventListener('mousemove', this._handleResizeMouseMove);
            document.addEventListener('mouseup', this._handleResizeMouseUp);
        });
    }

    _handleResizeMouseMove(e) {
        if (!this.isResizing || !this.resizingQuestBar || !this.resizingQuestId) return;

        const deltaX = e.clientX - this.resizeStartMouseX;
        const durationChangeMinutes = (deltaX / this.pixelsPerMinute);
        let newDurationMinutes = Math.round((this.originalQuestDuration + durationChangeMinutes) / 5) * 5;
        newDurationMinutes = Math.max(5, newDurationMinutes); // Minimum 5 minutes duration

        console.log('Resize-Analyse (Move):', { newDurationMinutes });

        // Update the bar's width visually
        const totalDayMinutes = 24 * 60; // Always calculate percentage based on the full day
        const newWidthPercentage = (newDurationMinutes / totalDayMinutes) * 100;
        
        this.resizingQuestBar.style.width = `${newWidthPercentage}%`;
    }

    async _handleResizeMouseUp(e) {
        if (!this.isResizing || !this.resizingQuestId) return;

        this.isResizing = false;
        document.removeEventListener('mousemove', this._handleResizeMouseMove);
        document.removeEventListener('mouseup', this._handleResizeMouseUp);

        const quest = this.ganttManager.localQuests.find(q => q.id === this.resizingQuestId);
        if (!quest) return;

        // Calculate final duration based on the mouse movement for higher precision
        const deltaX = e.clientX - this.resizeStartMouseX;
        const durationChangeMinutes = (deltaX / this.pixelsPerMinute);
        let finalDurationMinutes = Math.round((this.originalQuestDuration + durationChangeMinutes) / 5) * 5;

        console.log('Resize-Analyse (Ende):', { deltaX, durationChangeMinutes, finalDurationMinutes });

        finalDurationMinutes = Math.max(5, finalDurationMinutes); // Ensure minimum 5 minutes

        if (finalDurationMinutes !== this.originalQuestDuration) {
            await updateDoc(doc(this.db, 'todos', this.resizingQuestId), { durationMinutes: finalDurationMinutes, breaks: [] }); // Clear breaks if duration changes
            this.showNotification(`Dauer von "${quest.text}" auf ${finalDurationMinutes} Min. geändert.`);
        }
        
        this.resizingQuestId = null;
        this.resizingQuestBar = null;
        this.pixelsPerMinute = 0;
        this.originalQuestDuration = 0;

        this.ganttManager.render(this.ganttManager.localQuests); // Re-render to reflect changes and re-sort if needed
        this.ganttManager.triggerSortIfPomodoroActive();
    }
    // --- Resize Feature End ---

    async _handleVerticalReorder(draggedQuest, targetQuestId) {
        const targetQuest = this.ganttManager.localQuests.find(q => q.id === targetQuestId);
        if (!targetQuest || !draggedQuest.ganttScheduledAt || !targetQuest.ganttScheduledAt) {
            this.showNotification("Umsortieren nicht möglich.", "error");
            return;
        }

        // Swap the ganttScheduledAt timestamps
        const draggedTime = draggedQuest.ganttScheduledAt;
        const targetTime = targetQuest.ganttScheduledAt;

        const batch = writeBatch(this.db);
        const draggedRef = doc(this.db, 'todos', draggedQuest.id);
        const targetRef = doc(this.db, 'todos', targetQuest.id);

        batch.update(draggedRef, { ganttScheduledAt: targetTime });
        batch.update(targetRef, { ganttScheduledAt: draggedTime });
        await batch.commit();
        this.showNotification("Reihenfolge geändert.", "success");
    }

    _addGanttTooltipListeners() {
        this._addGanttResizeListeners(); // Attach resize listeners
        const container = this.ganttChartContainer;
        if (!container) return;

        let tooltip = document.querySelector('.gantt-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.className = 'gantt-tooltip';
            document.body.appendChild(tooltip);
        }

        document.body.addEventListener('mouseover', (e) => {
            const infoIcon = e.target.closest('.gantt-info-icon');
            const warningIcon = e.target.closest('.gantt-warning-icon');
            if (!e.target.closest('#div-7110') || (!infoIcon && !warningIcon)) return;

            let content = '';
            if (warningIcon) {
                content = `<div class="text-sm text-yellow-300">${warningIcon.dataset.warningText}</div>`;
            } else if (infoIcon) {
                const questId = infoIcon.dataset.questId || infoIcon.closest('.gantt-quest-bar')?.dataset.questId;
                const quest = this.ganttManager.localQuests.find(q => q.id === questId);
                if (quest) {
                    content = `<div class="font-bold text-white">${quest.text}</div><div class="text-sm text-gray-300">${quest.priority || 'N/A'} | ${quest.durationMinutes} Min.</div>${quest.details ? `<div class="mt-2 pt-2 border-t border-gray-600 text-xs text-gray-400 whitespace-pre-wrap">${quest.details}</div>` : ''}`;
                }
            }
            if (content) {
                tooltip.innerHTML = content;
                tooltip.style.left = `${e.clientX + 15}px`;
                tooltip.style.top = `${e.clientY + 15}px`;
                tooltip.style.display = 'block';
            }
        });

        document.body.addEventListener('mouseout', (e) => {
            const infoIcon = e.target.closest('.gantt-info-icon');
            if (infoIcon) tooltip.style.display = 'none';
        });

        document.body.addEventListener('click', (e) => {
            const button = e.target.closest('.gantt-popover button[data-action="add-break"]');
            if (button) {
                const questId = button.dataset.questId;
                const breakMinutes = parseInt(button.dataset.breakMinutes, 10);
                const workMinutes = parseInt(button.dataset.workMinutes, 10);
                this.ganttManager.breakManager.addManualBreak(questId, breakMinutes, workMinutes);
                document.querySelector('.gantt-popover')?.remove();
            }

            const deleteButton = e.target.closest('.gantt-popover button[data-action="delete-break"]');
            if (deleteButton) {
                const questId = deleteButton.dataset.questId;
                const breakId = deleteButton.dataset.breakId;
                this.ganttManager.breakManager.deleteSingleBreak(questId, breakId);
                document.querySelector('.gantt-popover')?.remove();
            }
        });

        document.body.addEventListener('click', (e) => {
            const popover = document.querySelector('.gantt-popover');
            if (popover && (e.target.closest('.gantt-popover-close') || !e.target.closest('.gantt-popover'))) {
                popover.remove();
            }
        });

        document.body.addEventListener('mousedown', (e) => {
            const popoverHeader = e.target.closest('.gantt-popover-header');
            if (!popoverHeader) return;
            const popover = popoverHeader.closest('.gantt-popover');
            e.preventDefault();
            let pos1 = 0, pos2 = 0, pos3 = e.clientX, pos4 = e.clientY;
            const onMouseMove = (moveEvent) => {
                pos1 = pos3 - moveEvent.clientX;
                pos2 = pos4 - moveEvent.clientY;
                pos3 = moveEvent.clientX;
                pos4 = moveEvent.clientY;
                popover.style.top = (popover.offsetTop - pos2) + "px";
                popover.style.left = (popover.offsetLeft - pos1) + "px";
            };
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', () => document.removeEventListener('mousemove', onMouseMove), { once: true });
        });

        document.body.addEventListener('click', (e) => {
            const infoIcon = e.target.closest('.gantt-info-icon');
            if (infoIcon) {
                if (!e.target.closest('#div-7110')) return;
                e.stopPropagation();
                const questId = infoIcon.dataset.questId || infoIcon.closest('.gantt-quest-bar')?.dataset.questId;
                if (questId && this.questManager) this.questManager._openEditModal(questId);
                return;
            }

            const warningIcon = e.target.closest('.gantt-warning-icon');
            if (warningIcon) {
                const warningType = warningIcon.dataset.warningType;
                if (!e.target.closest('#div-7110') || warningType !== 'long_segment') return;
                e.stopPropagation();
                document.querySelector('.gantt-popover')?.remove();
                const popover = document.createElement('div');
                popover.className = 'gantt-popover';
                const questId = warningIcon.closest('.gantt-quest-bar').dataset.questId;
                popover.innerHTML = `
                    <div class="gantt-popover-header flex justify-between items-center mb-2 cursor-move">
                        <div class="text-sm text-yellow-300">${warningIcon.dataset.warningText || 'Pause hinzufügen'}</div>
                        <button class="gantt-popover-close">&times;</button>
                    </div>
                    <div class="space-y-2 border-t border-gray-600 pt-2">
                        <div>
                            <p class="text-xs text-gray-400">Nach 25 Min:</p>
                            <div class="flex gap-2">
                                <button data-action="add-break" data-quest-id="${questId}" data-break-minutes="5" data-work-minutes="25">Pause +5m</button>
                                <button data-action="add-break" data-quest-id="${questId}" data-break-minutes="10" data-work-minutes="25">Pause +10m</button>
                            </div>
                        </div>
                        <div>
                            <p class="text-xs text-gray-400">Nach 45 Min:</p>
                            <div class="flex gap-2">
                                <button data-action="add-break" data-quest-id="${questId}" data-break-minutes="5" data-work-minutes="45">Pause +5m</button>
                                <button data-action="add-break" data-quest-id="${questId}" data-break-minutes="10" data-work-minutes="45">Pause +10m</button>
                            </div>
                        </div>
                    </div>
                `;
                popover.style.left = `${e.clientX + 15}px`;
                popover.style.top = `${e.clientY + 15}px`;
                document.body.appendChild(popover);
            }

            // Event listener for Pomodoro break bars
            // This needs to be before the general breakBar listener to ensure correct popover rendering
            const pomodoroBreakBar = e.target.closest('.gantt-pomodoro-break');
            if (pomodoroBreakBar) {
                if (!e.target.closest('#div-7110')) return;
                e.stopPropagation();
                document.querySelector('.gantt-popover')?.remove(); // Close any existing popover
                const popover = document.createElement('div');
                popover.className = 'gantt-popover';
                const breakId = pomodoroBreakBar.dataset.breakId;
                popover.innerHTML = `
                    <div class="gantt-popover-header flex justify-between items-center mb-2 cursor-move">
                        <div class="text-sm text-gray-300">Pausendauer anpassen</div>
                        <button class="gantt-popover-close">&times;</button>
                    </div>
                    <div id="pomodoro-break-popover-content" class="space-y-2 border-t border-gray-600 pt-2" data-break-id="${breakId}"></div>
                `;
                popover.style.left = `${e.clientX + 15}px`;
                popover.style.top = `${e.clientY + 15}px`;
                document.body.appendChild(popover);
                this._renderPomodoroBreakPopoverContent(breakId);
            }

            const splitButton = e.target.closest('.gantt-quest-split-btn');
            if (splitButton) {
                if (!e.target.closest('#div-7110')) return;
                e.stopPropagation();
                const questId = splitButton.dataset.questId;
                this.pomodoroSplitModal.querySelector('#quest-split-confirm-btn').dataset.questId = questId;
                this.pomodoroSplitModal.classList.remove('hidden');
            }

            const breakBar = e.target.closest('.gantt-break-bar');
            if (breakBar) {
                if (!e.target.closest('#div-7110')) return;
                e.stopPropagation();
                document.querySelector('.gantt-popover')?.remove();
                const popover = document.createElement('div');
                popover.className = 'gantt-popover';
                const questId = breakBar.dataset.questId;
                const breakId = breakBar.dataset.breakId;
                popover.innerHTML = `
                    <div class="gantt-popover-header flex justify-between items-center mb-2">
                        <div class="text-sm text-gray-300">Pause löschen?</div>
                        <button class="gantt-popover-close">&times;</button>
                    </div>
                    <div class="flex gap-2 border-t border-gray-600 pt-2">
                        <button data-action="delete-break" data-quest-id="${questId}" data-break-id="${breakId}" class="bg-red-700 hover:bg-red-600">Löschen</button>
                    </div>
                `;
                popover.style.left = `${e.clientX + 15}px`;
                popover.style.top = `${e.clientY + 15}px`;
                document.body.appendChild(popover);
            }
        });
    }

    // Renders the content for the Pomodoro break popover
    _renderPomodoroBreakPopoverContent(breakId) {
        // Find the break data from the ganttManager's pomodoroBreaks array
        const breakData = this.ganttManager.pomodoroBreaks.find(b => b.id === breakId);
        if (!breakData) return;

        const contentEl = document.getElementById('pomodoro-break-popover-content');
        if (!contentEl) return;

        // Calculate current duration in minutes
        const currentDuration = (breakData.endTime - breakData.startTime) / 60000;

        let buttonsHtml = '';
        if (currentDuration !== 5) {
            buttonsHtml += `<button data-action="set-pomodoro-break" data-duration="5" class="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded">5 Min</button>`;
        }
        if (currentDuration !== 10) {
            buttonsHtml += `<button data-action="set-pomodoro-break" data-duration="10" class="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded">10 Min</button>`;
        }

        // Populate the popover content with buttons and input field
        contentEl.innerHTML = `
            <div class="flex gap-2">
                ${buttonsHtml}
            </div>
            <div class="flex items-center gap-2">
                <input type="number" id="manual-pomodoro-break-duration" value="${currentDuration}" class="w-20 bg-gray-700 p-1 rounded text-xs">
                <button data-action="set-pomodoro-break-manual" class="text-xs bg-green-700 hover:bg-green-600 px-3 py-1 rounded">Speichern</button>
            </div>
        `;

        const popover = contentEl.closest('.gantt-popover');

        // Add event listeners for the predefined duration buttons
        contentEl.querySelectorAll('button[data-action="set-pomodoro-break"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const duration = parseInt(e.target.dataset.duration, 10);
                this._updatePomodoroBreakDuration(breakId, duration);
                popover?.remove();
            });
        });

        // Add event listener for the manual duration save button
        contentEl.querySelector('button[data-action="set-pomodoro-break-manual"]').addEventListener('click', () => {
            const input = document.getElementById('manual-pomodoro-break-duration');
            const newDuration = parseInt(input.value, 10);
            if (!isNaN(newDuration) && newDuration > 0) {
                this._updatePomodoroBreakDuration(breakId, newDuration);
                popover?.remove();
            }
        });
    }

    // Updates the duration of a Pomodoro break and shifts subsequent breaks/quests
    _updatePomodoroBreakDuration(breakId, newDurationMinutes) {
        const breakIndex = this.ganttManager.pomodoroBreaks.findIndex(b => b.id === breakId);
        if (breakIndex === -1) return;

        // Update only the end time of the target break in the local array
        const targetBreak = this.ganttManager.pomodoroBreaks[breakIndex];
        const newDurationMillis = newDurationMinutes * 60000;
        targetBreak.endTime = targetBreak.startTime + newDurationMillis;

        // Use a timeout to allow the popover to be removed before re-rendering
        setTimeout(() => {
            this.ganttManager.render(this.ganttManager.localQuests);
            this.ganttManager.triggerSortIfPomodoroActive();
        }, 0);
    }

    _addTimeToPomodoroBreak(breakId, minutesToAdd) {
        const breakIndex = this.ganttManager.pomodoroBreaks.findIndex(b => b.id === breakId);
        if (breakIndex === -1) return;

        const targetBreak = this.ganttManager.pomodoroBreaks[breakIndex];
        const currentDuration = (targetBreak.endTime - targetBreak.startTime) / 60000;
        const newDuration = currentDuration + minutesToAdd;

        this._updatePomodoroBreakDuration(breakId, newDuration);
    }

    _renderPomodoroBreaksList() {
        const contentEl = this.pomodoroBreaksTestModal.querySelector('#content-8120');
        if (!contentEl) return;

        contentEl.innerHTML = '';

        if (!this.ganttManager.pomodoroBreaks || this.ganttManager.pomodoroBreaks.length === 0) {
            contentEl.innerHTML = '<p class="text-gray-500">Keine Pomodoro-Pausen aktiv.</p>';
            return;
        }

        this.ganttManager.pomodoroBreaks.forEach(breakData => {
            const breakDiv = document.createElement('div');
            breakDiv.className = 'p-2 bg-gray-700 rounded flex items-center justify-between text-xs';
            const startTime = new Date(breakData.startTime).toLocaleTimeString('de-DE');
            const endTime = new Date(breakData.endTime).toLocaleTimeString('de-DE');

            breakDiv.innerHTML = `
                <div class="font-mono text-gray-400 w-1/3 truncate" title="${breakData.id}">${breakData.id}</div>
                <div class="font-semibold">${startTime} - ${endTime}</div>
                <div class="flex gap-2">
                    <button data-action="add-pomodoro-time" data-break-id="${breakData.id}" data-add-minutes="5" class="bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded">+5m</button>
                    <button data-action="add-pomodoro-time" data-break-id="${breakData.id}" data-add-minutes="10" class="bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded">+10m</button>
                </div>
            `;
            contentEl.appendChild(breakDiv);
        });
    }

    _openPomodoroActivationModal() {
        const selectionContainer = this.pomodoroActivationModal.querySelector('#pomodoro-quest-selection');
        const searchInput = this.pomodoroActivationModal.querySelector('#pomodoro-quest-search');
        const activateBtn = this.pomodoroActivationModal.querySelector('#pomodoro-activate-btn');
        const startTimeInput = this.pomodoroActivationModal.querySelector('#pomodoro-initial-start-time');
        
        // Pre-fill start time
        const settings = this.ganttManager.questManager?.userProfile?.pomodoroSettings;
        if (settings?.startTime) startTimeInput.value = settings.startTime;

        selectionContainer.innerHTML = '';
        activateBtn.disabled = true;
        searchInput.value = '';

        const questsForToday = this.ganttManager.localQuests.filter(q => q.ganttScheduledAt);

        const renderList = (quests) => {
            selectionContainer.innerHTML = '';
            if (quests.length === 0) {
                selectionContainer.innerHTML = '<p class="text-center text-gray-500 text-sm">Keine Quests für heute geplant.</p>';
                return;
            }
            quests.forEach(quest => {
                const item = document.createElement('p');
                item.className = 'p-2 rounded-md cursor-pointer hover:bg-gray-700 text-sm truncate';
                item.textContent = quest.text.length > 20 ? quest.text.substring(0, 20) + '...' : quest.text;
                item.dataset.questId = quest.id;
                item.addEventListener('click', () => {
                    // Single selection logic
                    selectionContainer.querySelectorAll('p').forEach(p => p.classList.remove('bg-indigo-600'));
                    item.classList.add('bg-indigo-600');
                    activateBtn.disabled = false;
                    activateBtn.dataset.selectedQuestId = quest.id;
                });
                selectionContainer.appendChild(item);
            });
        };

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredQuests = questsForToday.filter(q => q.text.toLowerCase().includes(searchTerm));
            renderList(filteredQuests);
        });

        renderList(questsForToday);
        this.pomodoroActivationModal.classList.remove('hidden');
    }

    async _activatePomodoroMode(startTime, shortBreak, workInterval) {
        const activateBtn = this.pomodoroActivationModal.querySelector('#pomodoro-activate-btn');
        const selectedQuestId = activateBtn.dataset.selectedQuestId;

        if (!selectedQuestId) {
            this.showNotification("Fehler: Keine Start-Quest ausgewählt.", "error");
            return;
        }

        this.pomodoroToggle.checked = true;
        this.pomodoroSettingsBtn.classList.remove('hidden');
        this.ganttManager.pomodoroModeActive = true; // Set state in the main manager
        this.ganttManager.warningManager.pomodoroModeActive = true; // Set state in the correct manager
        this.showNotification(`Pomodoro-Modus aktiviert.`, "success");
        
        // Generate grid with default values, as they are not set in this modal anymore
        const settings = this.ganttManager.questManager?.userProfile?.pomodoroSettings || {};
        const gridSettings = {
            startTime: startTime || settings.startTime || '09:00',
            workInterval: workInterval || 45,
            shortBreak: shortBreak || 10,
            longBreak: settings.longBreakDuration || 30,
            longBreakInterval: 4 // Default value
        };

        const userId = this.ganttManager.questManager?.currentUser?.uid;
        if (userId) {
            const userRef = doc(this.db, 'users', userId);
            // Set priority for the selected quest and save the new start time
            await updateDoc(userRef, { 
                "pomodoroSettings.startTime": startTime 
            });
            await updateDoc(doc(this.db, 'todos', selectedQuestId), { pomodoroPriority: 1 });
        }

        this.ganttManager.renderPomodoroGrid(gridSettings);

        // Automatically sort all quests after a short delay
        setTimeout(() => this.ganttManager.sortManager.sortAllQuests(), 200);
    }

    _deactivatePomodoroMode() {
        this.pomodoroToggle.checked = false;
        this.pomodoroSettingsBtn.classList.add('hidden');
        this.showNotification("Pomodoro-Modus deaktiviert.", "info");
        // Optional: remove generated breaks and re-render
        this.ganttManager.warningManager.pomodoroModeActive = false; // Set state to false in the correct manager
        this.ganttManager.pomodoroModeActive = false; // Set state to false
        this.ganttManager.pomodoroBreaks = [];
        this.ganttManager.render(this.ganttManager.localQuests); // Re-render to remove break bars
    }

    _renderFixedBreak(breakData) {
        let defaultName = 'Mittagspause';
        let defaultStart = '12:00';
        let defaultEnd = '12:30';

        if (!breakData) {
            const lastBreakEntry = this.fixedBreaksContainer.querySelector('.fixed-break-entry:last-child');
            if (lastBreakEntry) {
                const lastEndTime = lastBreakEntry.querySelectorAll('input')[2].value;
                if (lastEndTime) {
                    defaultStart = lastEndTime;
                    const [h, m] = lastEndTime.split(':').map(Number);
                    const newEndDate = new Date(0, 0, 0, h, m + 30);
                    defaultEnd = `${String(newEndDate.getHours()).padStart(2, '0')}:${String(newEndDate.getMinutes()).padStart(2, '0')}`;
                    defaultName = 'Pause';
                }
            }
        }

        const entryDiv = document.createElement('div');
        entryDiv.className = 'fixed-break-entry flex items-center gap-2 p-2 bg-gray-900 rounded';
        entryDiv.innerHTML = `
            <input type="text" class="flex-grow bg-gray-700 p-1 rounded text-xs" placeholder="Pausenname" value="${breakData?.name || defaultName}">
            <input type="time" class="bg-gray-700 p-1 rounded text-xs" value="${breakData?.startTime || defaultStart}">
            <span>-</span>
            <input type="time" class="bg-gray-700 p-1 rounded text-xs" value="${breakData?.endTime || defaultEnd}">
            <button class="delete-fixed-break-btn text-red-500 hover:text-red-400 text-lg">&times;</button>
        `;
        this.fixedBreaksContainer.appendChild(entryDiv);
    }

    _loadPomodoroSettings() {
        const settings = this.ganttManager.questManager?.userProfile?.pomodoroSettings;
        if (!settings) return;

        this.longBreakDurationInput.value = settings.longBreakDuration || 30;
        this.startTimeInput.value = settings.startTime || '08:00';
        
        const breakBarStyle = settings.breakBarStyle || 'bar';
        this.pomodoroStyleInputs.forEach(input => {
            input.checked = input.value === breakBarStyle;
        });

        const breakBarColors = settings.breakBarColors || {};
        this.shortBreakColorInput.value = breakBarColors.short || '#FBBF24'; // Default: amber-400
        this.longBreakColorInput.value = breakBarColors.long || '#F59E0B';  // Default: amber-500

        const lineStyle = settings.lineStyle || {};
        this.lineColorInput.value = lineStyle.color || '#FBBF24';
        this.lineThicknessInput.value = lineStyle.thickness || 2;
        
        const barStyle = settings.barStyle || {};
        this.barOutlineThicknessInput.value = barStyle.outlineThickness || 1;

        // This must be called after loading all values
        this._updatePomodoroStyleSelection();

        // Apply styles on load
        this._applyPomodoroStyling(settings);
        this.fixedBreaksContainer.innerHTML = '';
        if (settings.fixedBreaks && Array.isArray(settings.fixedBreaks)) {
            settings.fixedBreaks.forEach(breakData => this._renderFixedBreak(breakData));
        }
    }

    


    async _savePomodoroSettings() {
        const userId = this.ganttManager.questManager?.currentUser?.uid;
        if (!userId) {
            this.showNotification("Fehler: Benutzer nicht gefunden.", "error");
            return;
        }

        const fixedBreaks = [];
        this.fixedBreaksContainer.querySelectorAll('.fixed-break-entry').forEach(entry => {
            const inputs = entry.querySelectorAll('input');
            fixedBreaks.push({
                name: inputs[0].value,
                startTime: inputs[1].value,
                endTime: inputs[2].value
            });
        });

        const settings = {
            longBreakDuration: parseInt(this.longBreakDurationInput.value, 10),
            startTime: this.startTimeInput.value,
            fixedBreaks: fixedBreaks,
            breakBarStyle: document.querySelector('input[name="pomodoro-style"]:checked').value,
            breakBarColors: {
                short: this.shortBreakColorInput.value,
                long: this.longBreakColorInput.value
            },            
            barStyle: {
                outlineThickness: parseInt(this.barOutlineThicknessInput.value, 10),
                borderColor: this.barBorderColorInput.value,
                roundedCorners: this.barRoundedCornersCheckbox.checked
            },

            lineStyle: {
                color: this.lineColorInput.value,
                thickness: parseInt(this.lineThicknessInput.value, 10)
            }
        };

        try {
            const userRef = doc(this.db, 'users', userId);
            await updateDoc(userRef, {
                "pomodoroSettings": settings // Save the whole object
            });

            // Apply colors immediately after saving
            this._applyPomodoroStyling(settings); // Corrected call

            this.showNotification("Pomodoro-Einstellungen gespeichert.", "success");
            this.pomodoroSettingsModal.classList.add('hidden');
        } catch (error) {
            console.error("Error saving pomodoro settings:", error);
            this.showNotification("Fehler beim Speichern der Einstellungen.", "error");
        }
    }

    _applyPomodoroStyling(settings) {
        const container = this.ganttManager.ganttChartContainer;
        if (!container || !settings) return;
        const root = document.documentElement;

        // General Style
        container.classList.remove('pomodoro-style-bar', 'pomodoro-style-line');
        container.classList.add(`pomodoro-style-${settings.breakBarStyle || 'bar'}`);

        // Bar Style
        const barStyle = settings.barStyle || {};
        const breakBarColors = settings.breakBarColors || {};
        root.style.setProperty('--pomodoro-short-break-bg', breakBarColors.short || '#FBBF24');
        root.style.setProperty('--pomodoro-long-break-bg', breakBarColors.long || '#F59E0B');
        root.style.setProperty('--pomodoro-bar-outline-thickness', `${barStyle.outlineThickness || 1}px`);
        root.style.setProperty('--pomodoro-break-bar-border-color', barStyle.borderColor || '#FBBF24');
        root.style.setProperty('--pomodoro-break-bar-border-radius', barStyle.roundedCorners ? '0.25rem' : '0px');

        // Line Style
        const lineStyle = settings.lineStyle || {};
        root.style.setProperty('--pomodoro-line-color', lineStyle?.color || '#FBBF24');
        root.style.setProperty('--pomodoro-line-thickness', `${lineStyle?.thickness || 2}px`);
    }

    _updatePomodoroStyleSelection() {
        const selectedStyle = document.querySelector('input[name="pomodoro-style"]:checked').value;
        this.pomodoroLineSettingsContainer.classList.toggle('hidden', selectedStyle !== 'line');
        this.pomodoroBarSettingsContainer.classList.toggle('hidden', selectedStyle !== 'bar');

        // Update active state for radio buttons
        this.pomodoroStyleInputs.forEach(input => {
            const label = input.closest('label');
            if (input.checked) {
                label.classList.add('bg-indigo-600');
                label.classList.remove('bg-gray-900');
            } else {
                label.classList.remove('bg-indigo-600');
                label.classList.add('bg-gray-900');
            }
        });
    }
}

class GanttRenderManager {
    constructor(ganttManager) {
        this.ganttManager = ganttManager;
        this.ganttChartContainer = ganttManager.ganttChartContainer;
        this.ganttTimescaleSelect = ganttManager.ganttTimescaleSelect;
        this.ganttHoursViewSelect = ganttManager.ganttHoursViewSelect;
    }

    _isToday(timestamp) {
        if (!timestamp) return false;
        const targetDate = timestamp.toDate();
        const compareDate = this.ganttManager.currentGanttDate;
        return targetDate.getDate() === compareDate.getDate() &&
               targetDate.getMonth() === compareDate.getMonth() &&
               targetDate.getFullYear() === compareDate.getFullYear();
    }

    renderMultiLineView() {
        const viewport = this.ganttChartContainer.parentElement;
        if (!viewport) return;

        const startHour = 0; // Always render full 24h
        const endHour = 24;
        const hoursInView = 24;

        const labelColumnWidthPx = 150;
        const intervalMinutes = parseInt(this.ganttTimescaleSelect.value, 10) || 60;
        const totalColumns = (hoursInView * 60) / intervalMinutes;

        const visibleHours = parseInt(this.ganttHoursViewSelect.value, 10);
        const columnsInView = (visibleHours * 60) / intervalMinutes;
        const scrollbarWidth = 17; // Approximate width of a scrollbar
        const columnWidth = (viewport.clientWidth - labelColumnWidthPx - scrollbarWidth) / columnsInView;

        this.ganttChartContainer.innerHTML = '';
        this.ganttChartContainer.style.display = 'flex';
        this.ganttChartContainer.style.height = '100%'; // Ensure container fills space

        const labelsContainer = document.createElement('div');
        labelsContainer.id = 'gantt-labels-column';
        labelsContainer.className = 'flex-shrink-0 bg-gray-800 z-20';
        labelsContainer.style.width = `${labelColumnWidthPx}px`;

        const timelineScrollContainer = document.createElement('div');
        timelineScrollContainer.id = 'gantt-timeline-scroll-container';
        timelineScrollContainer.classList.add('gantt-multiline-scrollbar');
        timelineScrollContainer.className = 'flex-grow overflow-auto';

        const timelineGrid = document.createElement('div');
        timelineGrid.id = 'gantt-timeline-grid';
        timelineGrid.style.display = 'grid';
        timelineGrid.style.gridTemplateColumns = `repeat(${totalColumns}, ${columnWidth}px)`;
        timelineGrid.style.position = 'relative';
        timelineGrid.style.paddingBottom = '16px'; // Add space for the horizontal scrollbar

        const headerLabel = document.createElement('div');
        headerLabel.className = 'h-8 border-b-2 border-gray-600 sticky top-0 bg-gray-800';
        labelsContainer.appendChild(headerLabel);

        for (let i = 0; i < totalColumns; i++) {
            const currentMinute = i * intervalMinutes;
            const hour = startHour + Math.floor(currentMinute / 60);
            const minute = currentMinute % 60;
            const hourCell = document.createElement('div');
            hourCell.className = 'text-center text-xs text-gray-400 border-b-2 border-gray-600 border-r border-gray-700 h-8 flex items-center justify-center sticky top-0 bg-gray-800 z-10';
            hourCell.append(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
            timelineGrid.appendChild(hourCell);
        }

        const viewStartDate = new Date();
        viewStartDate.setHours(startHour, 0, 0, 0);
        const viewEndDate = new Date();
        viewEndDate.setHours(endHour, 0, 0, 0);

        // Update the date display
        const dateDisplay = document.getElementById('gantt-current-date-display');
        if (dateDisplay) dateDisplay.textContent = `Angezeigtes Datum: ${this.ganttManager.currentGanttDate.toLocaleDateString('de-DE')}`;

        let scheduledQuests = this.ganttManager.localQuests.filter(q => {
            // By default, only render quests scheduled for today.
            return this._isToday(q.ganttScheduledAt);
        });

        if (scheduledQuests.length === 0) {
            const emptyRow = document.createElement('div');
            emptyRow.className = 'text-center text-gray-500 p-4 col-span-full';
            emptyRow.textContent = 'Keine Quests für diesen Tag geplant.';
            timelineGrid.appendChild(emptyRow);
        } else {
            scheduledQuests.sort((a, b) => {
                const timeA = a.ganttScheduledAt; const timeB = b.ganttScheduledAt;
                return timeA.toMillis() - timeB.toMillis();
            });
            scheduledQuests.forEach((quest, index, arr) => {
                this._renderGanttRow(quest, index, timelineGrid, labelsContainer, startHour, hoursInView, arr);
            });
        }

        timelineScrollContainer.appendChild(timelineGrid);
        this.ganttChartContainer.append(labelsContainer, timelineScrollContainer);
        this._setupGanttScroll(timelineScrollContainer);
        this._renderPomodoroSchedule(timelineGrid, startHour, hoursInView);
        this._addCurrentTimeIndicator();
    }

    _setupGanttScroll(scrollContainer, startHour = 0) {
        setTimeout(() => {
            if (!scrollContainer) return;

            // If a drag operation was just completed, restore the scroll position.
            if (this.ganttManager.interactionManager.isDragging) { 
                scrollContainer.scrollLeft = this.ganttManager.interactionManager.ganttScrollLeft;
                scrollContainer.scrollTop = this.ganttManager.interactionManager.ganttScrollTop;
                this.ganttManager.interactionManager.isDragging = false; // Reset flag AFTER restoring scroll
            } else {
                const firstQuest = this.ganttManager.localQuests
                    .filter(q => q.ganttScheduledAt)
                    .sort((a, b) => a.ganttScheduledAt.toMillis() - b.ganttScheduledAt.toMillis())[0];

                if (firstQuest) {
                    const firstQuestHour = firstQuest.ganttScheduledAt.toDate().getHours();
                    const totalDayMinutes = 24 * 60;
                    const questStartMinutesInDay = firstQuestHour * 60 + firstQuest.ganttScheduledAt.toDate().getMinutes();
                    
                    const scrollPercentage = questStartMinutesInDay / totalDayMinutes;
                    const targetScrollLeft = scrollContainer.scrollWidth * scrollPercentage - 100; // Center it with an offset
                    scrollContainer.scrollLeft = Math.max(0, targetScrollLeft);
                } else {
                    scrollContainer.scrollLeft = 0;
                }
            }
        }, 0);
    }

    _addCurrentTimeIndicator() {
        setTimeout(() => {
            if (!this.ganttChartContainer) return;
            const existingIndicator = this.ganttChartContainer.querySelector('#gantt-current-time-indicator');
            if (existingIndicator) existingIndicator.remove();
            const now = new Date();
            const totalDayMinutes = 24 * 60;
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            const positionPercentage = (currentMinutes / totalDayMinutes) * 100;
            const indicator = document.createElement('div');
            indicator.id = 'gantt-current-time-indicator';
            const timelineGridEl = this.ganttChartContainer.querySelector('#gantt-timeline-grid') || this.ganttChartContainer.querySelector('.relative.h-10') || this.ganttChartContainer;
            if (timelineGridEl) { // Ensure the element exists before calculating offset
                const offset = timelineGridEl.scrollWidth * (positionPercentage / 100);
                indicator.style.left = `${offset}px`;
                timelineGridEl.appendChild(indicator);
            }
        }, 0);
    }
    renderGanttSingleLineView() {
        const viewport = this.ganttChartContainer.parentElement;
        if (!viewport) return;

        const startHour = 0;
        const hoursInView = 24;

        // Clear container and apply single-line specific styles
        this.ganttChartContainer.innerHTML = '';
        this.ganttChartContainer.style.overflowX = 'auto';
        this.ganttChartContainer.classList.add('gantt-singleline-scrollbar');
        this.ganttChartContainer.style.overflowY = 'hidden';
        this.ganttChartContainer.style.display = 'grid';
        this.ganttChartContainer.style.gridTemplateRows = 'auto 1fr';
        
        // Calculations must happen *after* the container is visible and has dimensions
        const intervalMinutes = parseInt(this.ganttTimescaleSelect.value, 10) || 60;
        const totalColumns = (hoursInView * 60) / intervalMinutes;
        const visibleHours = parseInt(this.ganttHoursViewSelect.value, 10);
        const columnsInView = (visibleHours * 60) / intervalMinutes;
        const scrollbarWidth = 17; // Approximate width of a scrollbar
        const columnWidth = (viewport.clientWidth - scrollbarWidth) / columnsInView;

        this.ganttChartContainer.style.gridTemplateColumns = `repeat(${totalColumns}, ${columnWidth}px)`;

        for (let i = 0; i < totalColumns; i++) {
            const currentMinute = i * intervalMinutes;
            const hour = startHour + Math.floor(currentMinute / 60);
            const minute = currentMinute % 60;
            const hourCell = document.createElement('div');
            hourCell.className = 'text-center text-xs text-gray-400 border-b-2 border-gray-600 border-r border-gray-700 h-8 flex items-center justify-center sticky top-0 bg-gray-800 z-10';
            hourCell.append(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
            this.ganttChartContainer.appendChild(hourCell);
        }

        const timelineCell = document.createElement('div');
        timelineCell.className = 'relative h-10 border-t border-gray-700';
        timelineCell.style.gridColumn = '1 / -1';
        this.ganttChartContainer.appendChild(timelineCell);

        const viewStartDate = new Date(); // This should be based on the selected date in a real app
        viewStartDate.setHours(startHour, 0, 0, 0);
        const viewEndDate = new Date();
        viewEndDate.setHours(hoursInView, 0, 0, 0);

        const scheduledQuests = this.ganttManager.localQuests.filter(q => {
            // Only render quests that have a specific ganttScheduledAt timestamp.
            return q.ganttScheduledAt && q.durationMinutes > 0;
        });

        const sortedQuests = [...scheduledQuests].sort((a, b) => (a.ganttScheduledAt || a.scheduledAt).toMillis() - (b.ganttScheduledAt || b.scheduledAt).toMillis());

        sortedQuests.forEach((quest, index, arr) => {
            const questBar = this._createGanttBar(quest, startHour, hoursInView, index, arr, timelineCell);
            if (questBar) timelineCell.appendChild(questBar);
        });
        
        this.ganttManager.localQuests.flatMap(q => q.breaks || []).forEach(breakItem => {
            const breakBar = document.createElement('div'); breakBar.className = 'gantt-quest-bar bg-gray-500 opacity-70 non-draggable';
            breakBar.title = `${breakItem.durationMinutes} Min. Pause`;
            
            const totalViewMinutes = hoursInView * 60;
            const breakStart = breakItem.scheduledAt.toDate();
            const breakStartMinutes = (breakStart.getHours() - startHour) * 60 + breakStart.getMinutes();

            breakBar.style.left = `${(breakStartMinutes / totalViewMinutes) * 100}%`;
            breakBar.style.width = `${(breakItem.durationMinutes / totalViewMinutes) * 100}%`;
            
            const breakLabel = document.createElement('span');
            breakLabel.className = 'break-label';
            breakLabel.innerHTML = breakItem.durationMinutes === 10 ? '1<br>0' : breakItem.durationMinutes;
            breakBar.appendChild(breakLabel);
            timelineCell.appendChild(breakBar);
        });

        this._setupGanttScroll(this.ganttChartContainer);
        this._addCurrentTimeIndicator();
    }

    _renderGanttRow(quest, index, timelineGrid, labelsContainer, startHour, hoursInView, allScheduledQuests) {
        const rowNum = index + 2;

        if (labelsContainer) {
            const questLabel = document.createElement('div');
            questLabel.className = 'border-t border-gray-700 h-8 flex items-center justify-end gap-2 pr-2';

            if (this.ganttManager.pomodoroModeActive) {
                const prioritySelect = document.createElement('select');
                prioritySelect.className = 'pomodoro-priority-select bg-gray-700 text-white text-xs rounded p-0.5 focus:ring-0 border-gray-600';
                prioritySelect.dataset.questId = quest.id;
                
                // Dynamically create priority options based on the number of quests
                const numberOfQuests = allScheduledQuests.length;
                const priorityOptions = ['-'];
                for (let i = 1; i <= numberOfQuests; i++) {
                    priorityOptions.push(String(i));
                }

                priorityOptions.forEach(val => {
                    const option = document.createElement('option');
                    option.value = (val === '-') ? 99 : val;
                    option.textContent = val;
                    option.selected = (quest.pomodoroPriority || 99) == option.value;
                    prioritySelect.appendChild(option);
                });
                prioritySelect.addEventListener('change', (e) => this.ganttManager.interactionManager._handlePomodoroPriorityChange(e));
                questLabel.appendChild(prioritySelect);
            }

            const textSpan = document.createElement('span');
            textSpan.className = 'truncate text-right';
            textSpan.textContent = quest.text;
            questLabel.appendChild(textSpan);
            labelsContainer.appendChild(questLabel);
        }

        const timelineCell = document.createElement('div');
        timelineCell.className = 'relative h-8 border-t border-gray-700';
        timelineCell.style.gridRow = `${rowNum}`;
        timelineCell.style.gridColumn = '1 / -1';
        if (quest.durationMinutes > 0) {
            // If Pomodoro mode is active, split the quest bar into segments around breaks.
            if (this.ganttManager.pomodoroModeActive && this.ganttManager.pomodoroBreaks.length > 0) {
                const workSegments = this.ganttManager.sortManager.calculateWorkSegmentsForQuest(quest, this.ganttManager.pomodoroBreaks);
                workSegments.forEach((segment, segmentIndex) => {
                    const segmentQuest = {
                        ...quest,
                        ganttScheduledAt: Timestamp.fromMillis(segment.start),
                        durationMinutes: (segment.end - segment.start) / 60000
                    };
                    const questBarSegment = this._createGanttBar(segmentQuest, startHour, hoursInView, index, allScheduledQuests, timelineCell, segmentIndex > 0);
                    if (questBarSegment) {
                        timelineCell.appendChild(questBarSegment);
                    }
                });
            } else {
                // Default behavior: render a single bar.
                const questBar = this._createGanttBar(quest, startHour, hoursInView, index, allScheduledQuests, timelineCell);
                if (questBar) {
                    timelineCell.appendChild(questBar);
                }
            }


            (quest.breaks || []).forEach(breakItem => {
                const breakBar = document.createElement('div'); // This is the break bar
                breakBar.className = 'gantt-quest-bar gantt-break-bar bg-gray-500 opacity-70 z-20 cursor-pointer'; // Added gantt-break-bar and cursor-pointer
                breakBar.dataset.questId = quest.id;
                breakBar.dataset.breakId = breakItem.id;
                const breakStartMinutesInView = (breakItem.scheduledAt.toDate().getHours() - startHour) * 60 + breakItem.scheduledAt.toDate().getMinutes();
                breakBar.style.left = `${(breakStartMinutesInView / (hoursInView * 60)) * 100}%`;
                breakBar.style.width = `${(breakItem.durationMinutes / (hoursInView * 60)) * 100}%`;
                
                const breakLabel = document.createElement('span');
                breakLabel.className = 'break-label';
                breakLabel.innerHTML = breakItem.durationMinutes === 10 ? '1<br>0' : breakItem.durationMinutes;
                breakBar.appendChild(breakLabel);
                timelineCell.appendChild(breakBar);
            });
        }
        timelineGrid.appendChild(timelineCell);
        // Render breaks after the main quest bar is in place
        this._renderPomodoroBreaks(timelineCell, quest, startHour, hoursInView, allScheduledQuests);
    }

    _createGanttBar(quest, startHour, hoursInView, index, allScheduledQuests, parentCell = null, isSegment = false) {
        const questBar = document.createElement('div');
        questBar.className = `gantt-quest-bar z-10`; 
        questBar.draggable = true;
        questBar.dataset.questId = quest.id;
        questBar.title = quest.text;
        const scheduleTimestamp = quest.ganttScheduledAt || quest.scheduledAt;
        if (!scheduleTimestamp) return null;

        const totalViewMinutes = hoursInView * 60;
        const questStart = scheduleTimestamp.toDate();
        const questStartMinutes = (questStart.getHours() - startHour) * 60 + questStart.getMinutes();

        questBar.style.left = `${(questStartMinutes / totalViewMinutes) * 100}%`;
        questBar.style.width = `${(quest.durationMinutes / totalViewMinutes) * 100}%`;

        // Add the project color stripe div
        const projectStripe = document.createElement('div');
        projectStripe.className = 'gantt-bar-project-stripe';
        projectStripe.id = `project-stripe-${quest.id}`;
        if (quest.projectColor) {
            projectStripe.style.backgroundColor = quest.projectColor;
        }
        questBar.appendChild(projectStripe);

        // Add resize handle (only for main quest bars, not segments) - Moved out of setTimeout
        if (!isSegment) {
            const resizeHandle = document.createElement('div');
            resizeHandle.className = 'gantt-resize-handle';
            resizeHandle.innerHTML = '↔️';
            resizeHandle.dataset.questId = quest.id; // Link handle to quest
            questBar.appendChild(resizeHandle);
        }

        // Post-append logic for actions container
        setTimeout(() => {
            const isShortQuest = questBar.clientWidth < 40; // Check actual rendered width
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'gantt-bar-actions';
            
            let actionsHtml = `<span id="gantt-info-icon-${quest.id}" class="gantt-info-icon" ${isShortQuest ? `data-quest-id="${quest.id}"` : ''}>ℹ️</span>`;
            if (this.ganttManager.pomodoroModeActive && quest.durationMinutes > 25 && !isSegment) { // Split button only for quests > 25min and not for segments
                actionsHtml += `<button class="gantt-quest-split-btn text-xs bg-purple-700 hover:bg-purple-600 rounded px-1.5 py-0.5" data-quest-id="${quest.id}">Split</button>`;
            }

            actionsContainer.innerHTML = actionsHtml;

            if (isShortQuest && questBar.parentElement) {
                // For short quests, position the actions container absolutely, next to the bar.
                // The data-quest-id on the icon is now crucial.
                actionsContainer.style.position = 'absolute';
                actionsContainer.style.left = `${questBar.offsetLeft + questBar.offsetWidth + 5}px`;
                actionsContainer.style.top = `${questBar.offsetTop}px`;
                questBar.parentElement.appendChild(actionsContainer);
            } else {
                questBar.appendChild(actionsContainer);
            }
        }, 0);

        // Post-append logic for conflict hatching (non-pomodoro mode)
        setTimeout(() => {
            const settings = this.ganttManager.questManager?.userProfile?.pomodoroSettings || {};
            if (settings.pomodoroModeActive) return; // No hatching in Pomodoro mode

            const viewStartDate = new Date();
            viewStartDate.setHours(startHour, 0, 0, 0);

            const currentStartMs = (quest.ganttScheduledAt || quest.scheduledAt).toMillis();
            const currentEndMs = currentStartMs + quest.durationMinutes * 60000;

            allScheduledQuests.forEach(otherQuest => {
                if (quest.id === otherQuest.id) return;

                const otherStartMs = (otherQuest.ganttScheduledAt || otherQuest.scheduledAt).toMillis();
                const otherEndMs = otherStartMs + otherQuest.durationMinutes * 60000;

                // Check for overlap
                if (currentStartMs < otherEndMs && currentEndMs > otherStartMs) {
                    const overlapStartMs = Math.max(currentStartMs, otherStartMs);
                    const overlapEndMs = Math.min(currentEndMs, otherEndMs);

                    const overlapStartMinutesInView = ((overlapStartMs - viewStartDate.getTime()) / 60000);
                    const overlapDurationMinutes = (overlapEndMs - overlapStartMs) / 60000;

                    const conflictSegment = document.createElement('div');
                    conflictSegment.className = 'gantt-conflict-segment z-20';
                    // Position relative to the parent cell, not the bar
                    conflictSegment.style.left = `${(overlapStartMinutesInView / (hoursInView * 60)) * 100}%`;
                    conflictSegment.style.width = `${(overlapDurationMinutes / (hoursInView * 60)) * 100}%`;
                    
                    if (parentCell) parentCell.appendChild(conflictSegment);
                }
            });
        }, 0);
        return questBar;
    }

    _parseTimeToMillis(timeString) {
        if (!timeString) return 0;
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        // Set date to today, but only use the time part for calculation relative to midnight
        date.setHours(hours, minutes, 0, 0);
        return date.getTime();
    }

    _renderPomodoroBreaks(parentCell, quest, startHour, hoursInView, allQuests) {
        if (!this.ganttManager.pomodoroBreaks || this.ganttManager.pomodoroBreaks.length === 0) return;
        
        const questStartMs = (quest.ganttScheduledAt || quest.scheduledAt)?.toMillis();
        if (!questStartMs) return;
        const questEndMs = questStartMs + (quest.durationMinutes * 60000);

        const questIndex = allQuests.findIndex(q => q.id === quest.id);
        const nextQuest = allQuests[questIndex + 1];
        const nextQuestStartMs = nextQuest ? (nextQuest.ganttScheduledAt || nextQuest.scheduledAt)?.toMillis() : Infinity;

        const totalDayMinutes = 24 * 60;

        this.ganttManager.pomodoroBreaks.forEach(breakData => {
            let renderMode = null; // 'full', 'top', 'bottom'

            // Check if the break overlaps with the quest
            if (questStartMs < breakData.endTime && questEndMs > breakData.startTime) { // Full overlap
                renderMode = 'full';
            } else if (questEndMs === breakData.startTime) { // Break starts exactly when quest ends
                renderMode = 'top';
            } else if (questStartMs === breakData.endTime) { // Break ends exactly when quest starts
                renderMode = 'bottom';
            }

            if (renderMode) {
                const breakBar = document.createElement('div');
                const durationMinutes = (breakData.endTime - breakData.startTime) / 60000;
                breakBar.className = `gantt-pomodoro-break render-mode-${renderMode}`;
                breakBar.title = `${durationMinutes} Min. ${breakData.type === 'long' ? 'lange' : 'kurze'} Pause`;
                if (breakData.type === 'long') breakBar.dataset.type = 'long';

                const breakStart = new Date(breakData.startTime);
                const breakStartMinutesInDay = breakStart.getHours() * 60 + breakStart.getMinutes();

                breakBar.style.left = `${(breakStartMinutesInDay / totalDayMinutes) * 100}%`;
                breakBar.style.width = `${(durationMinutes / totalDayMinutes) * 100}%`;

                if (this.ganttManager.logBreakRendering) {
                    console.log(`Pausenbalken gerendert für Quest "${quest.text}" | Typ: ${breakData.type} | Startzeit: ${breakStart.toLocaleTimeString()}`);
                }
                // Ensure a unique ID for interaction, as the generator doesn't provide one.
                breakBar.dataset.breakId = breakData.id;
                parentCell.appendChild(breakBar);
            }
        });
    }

    _renderFixedBreaks(parentCell, startHour, hoursInView, isMultiLine = false) {
        const settings = this.ganttManager.questManager?.userProfile?.pomodoroSettings;
        // Only render if pomodoro mode is active and settings exist
        if (!this.ganttManager.pomodoroModeActive || !settings || !settings.fixedBreaks || settings.fixedBreaks.length === 0) {
            return;
        }

        const totalViewMinutes = hoursInView * 60;

        settings.fixedBreaks.forEach(breakData => {
            const breakStartMillis = this._parseTimeToMillis(breakData.startTime);
            const breakEndMillis = this._parseTimeToMillis(breakData.endTime);
            const durationMinutes = (breakEndMillis - breakStartMillis) / 60000;

            if (durationMinutes <= 0 || !breakData.startTime || !breakData.endTime) return;

            const breakBar = document.createElement('div');
            breakBar.className = `gantt-fixed-break-bar ${isMultiLine ? 'multiline' : ''}`;
            breakBar.title = breakData.name;
            breakBar.textContent = breakData.name;

            const breakStart = new Date(breakStartMillis);
            const breakStartMinutesInView = (breakStart.getHours() - startHour) * 60 + breakStart.getMinutes();

            breakBar.style.left = `${(breakStartMinutesInView / totalViewMinutes) * 100}%`;
            breakBar.style.width = `${(durationMinutes / totalViewMinutes) * 100}%`;

            parentCell.appendChild(breakBar);
        });
    }

    _renderPomodoroSchedule(parentCell, startHour, hoursInView) {
        const schedule = this.ganttManager.pomodoroSchedule;
        if (!schedule || schedule.length === 0) {
            return;
        }

        const totalViewMinutes = hoursInView * 60;

        schedule.forEach(block => {
            const blockBar = document.createElement('div');
            const durationMinutes = (block.endTime - block.startTime) / 60000;
            
            // Assign class based on block type for styling
            blockBar.className = `gantt-schedule-block ${block.type} z-0`; // z-0 to place it in the background
            blockBar.title = `${block.type.replace('_', ' ')} (${durationMinutes} min)`;

            const blockStart = new Date(block.startTime);
            const blockStartMinutesInView = (blockStart.getHours() - startHour) * 60 + blockStart.getMinutes();

            blockBar.style.left = `${(blockStartMinutesInView / totalViewMinutes) * 100}%`;
            blockBar.style.width = `${(durationMinutes / totalViewMinutes) * 100}%`;

            parentCell.appendChild(blockBar);
        });
    }
}

export class GanttManager {
    // Orchestrator Class

    constructor(db, showNotificationCallback) {
        this.db = db;
        this.showNotification = showNotificationCallback;


        // DOM Elements
        this.ganttChartContainer = document.getElementById('div-7110'); // Main container
        this.ganttViewSelect = document.getElementById('gantt-view-select'); // View mode dropdown
        this.ganttTimescaleSelect = document.getElementById('gantt-timescale-select'); // Timescale dropdown
        this.ganttHoursViewSelect = document.getElementById('gantt-hours-view-select'); // Visible hours dropdown
        this.sortAllBtn = document.getElementById('gantt-sort-all-btn');
        this.pomodoroToggle = document.getElementById('gantt-pomodoro-toggle');

        // State
        this.localQuests = [];
        this.pomodoroModeActive = false; // State to control rendering of pomodoro elements
        this.pomodoroSchedule = []; // Array for the generated work/break schedule
        this.pomodoroBreaks = []; // Array für die neuen, visualisierten Pausen
        this.currentGanttDate = new Date(); // The date currently being viewed in the Gantt chart
        this.logQuestPositioning = true; // Default logging state

        // Sub-Managers
        this.breakManager = new GanttBreakManager(this.db, this.showNotification, () => this.localQuests);
        this.breakManager.ganttManager = this; // Provide reference
        this.interactionManager = new GanttInteractionManager(this);
        this.warningManager = new GanttWarningManager(); // Initialize the WarningManager
        this.scheduleGenerator = new GanttScheduleGenerator(this); // Initialize the new ScheduleGenerator
        this.renderManager = new GanttRenderManager(this);
        this.pomodoroGridGenerator = new PomodoroGridGenerator();
        this.sortManager = new GanttSortManager(this); // Initialize the new SortManager

        this._attachEventListeners();
        this._updateHoursViewOptions(); // Initial population
    }
    setDependencies(questManager) {
        // When dependencies are set, check if we need to show the activation modal on startup
        const settings = questManager?.userProfile?.pomodoroSettings;
        if (settings?.pomodoroModeActive) {
            // Use a timeout to ensure the UI is ready
            setTimeout(() => this.interactionManager._openPomodoroActivationModal(), 500);
        }

        this.questManager = questManager;
        this.interactionManager.questManager = questManager;
    }

    // Centralized event listener setup
    _attachEventListeners() {
        this.interactionManager.attachEventListeners();
        this.interactionManager._addGanttTooltipListeners();
        this.interactionManager._createGanttHeaderButtons();
        if (this.ganttViewSelect) this.ganttViewSelect.addEventListener('change', () => this.render(this.localQuests));
        if (this.ganttTimescaleSelect) this.ganttTimescaleSelect.addEventListener('change', () => {
            this._updateHoursViewOptions();
            this.render(this.localQuests);
        });
        if (this.ganttHoursViewSelect) this.ganttHoursViewSelect.addEventListener('change', () => this.render(this.localQuests));
    }

    // Logic to dynamically update the "visible hours" dropdown based on the timescale
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

    _addCurrentTimeIndicator() {
        setTimeout(() => {
            if (!this.ganttChartContainer) return;
            const existingIndicator = this.ganttChartContainer.querySelector('#gantt-current-time-indicator');
            if (existingIndicator) existingIndicator.remove();
            const now = new Date();
            const totalDayMinutes = 24 * 60;
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            const positionPercentage = (currentMinutes / totalDayMinutes) * 100;
            const indicator = document.createElement('div');
            indicator.id = 'gantt-current-time-indicator';
            const timelineGridEl = this.ganttChartContainer.querySelector('#gantt-timeline-grid') || this.ganttChartContainer.querySelector('.relative.h-10') || this.ganttChartContainer;
            const offset = timelineGridEl.scrollWidth * (positionPercentage / 100);
            indicator.style.left = `${offset}px`;
            timelineGridEl.appendChild(indicator);
        }, 0);
    }
    // Main render method, delegates to the RenderManager
    render(quests) {
        this.localQuests = quests;

        // Apply Pomodoro styles before any rendering to prevent flickering
        const settings = this.questManager?.userProfile?.pomodoroSettings;
        if (settings) {
            this.interactionManager._applyPomodoroStyling(settings);
        }


        if (!this.ganttChartContainer) return;

        const viewMode = this.ganttViewSelect.value;
        if (viewMode === 'single-line') {
            this.renderManager.renderGanttSingleLineView(); // Corrected method name
        } else {
            this.renderManager.renderMultiLineView();
        }

        // Render breaks/schedule only for single-line view here.
        // Multi-line view handles this inside its own render method.
        if (viewMode === 'single-line') {
            const timelineCell = this.ganttChartContainer.querySelector('.relative.h-10');
            if (timelineCell) {
                this.renderManager._renderPomodoroSchedule(timelineCell, 0, 24);
                this.renderManager._renderPomodoroBreaks(timelineCell, 0, 24, false, this.ganttManager.pomodoroBreaks);
                this.renderManager._renderFixedBreaks(timelineCell, 0, 24, false);
            }
        }

        this._addCurrentTimeIndicator();
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

    triggerSortIfPomodoroActive() {
        if (this.pomodoroModeActive) {
            this.sortManager.sortAllQuests();
        }
    }
}