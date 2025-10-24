import { Timestamp, updateDoc, doc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

/**
 * UI-DESIGN: Verwaltet die Logik für visuelle Warnungen im Gantt-Chart.
 */
class GanttWarningManager {
    constructor() {
        this.maxWorkSessionMinutes = 45;
        this.pomodoroModeActive = false;
    }

    getQuestWarning(quest, index, allScheduledQuests, workMinutesThreshold = 45) {
        const warnings = [];
        if (this.pomodoroModeActive) {
            if (this.findNextBreakInsertionPoint(quest, workMinutesThreshold)) {
                warnings.push({ text: `Ein Arbeitsblock ist > ${this.maxWorkSessionMinutes}min!`, type: 'long_segment' });
            }
            if (index < allScheduledQuests.length - 1) {
                const nextQuest = allScheduledQuests[index + 1];
                const questEndTime = this._getActualQuestEndTime(quest);
                const nextQuestStartTime = (nextQuest.ganttScheduledAt || nextQuest.scheduledAt).toMillis();
                const gap = nextQuestStartTime - questEndTime;
                if (gap < 1 * 60000) {
                    warnings.push({ text: "Keine Pause zwischen den Pomodoro-Einheiten!", type: 'no_gap' });
                }
            }
        }
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
        for (const breakItem of sortedBreaks) {
            const workSegmentDuration = ((breakItem.scheduledAt?.toMillis() || 0) - lastEventEndTime) / 60000;
            if (workSegmentDuration >= maxWorkSessionMinutes - 0.0001) {
                return lastEventEndTime + (maxWorkSessionMinutes * 60000);
            }
            accumulatedWorkMinutes += workSegmentDuration;
            lastEventEndTime = (breakItem.scheduledAt?.toMillis() || 0) + (breakItem.durationMinutes * 60000);
        }
        const finalSegmentDuration = quest.durationMinutes - accumulatedWorkMinutes;
        if (finalSegmentDuration >= maxWorkSessionMinutes - 0.0001) {
            return lastEventEndTime + (maxWorkSessionMinutes * 60000);
        }
        return null;
    }
}

/**
 * UI-DESIGN: Verwaltet alle Benutzerinteraktionen mit dem Gantt-Chart.
 */
class GanttInteractionManager {
    constructor(ganttManager, uiManager) {
        this.ganttManager = ganttManager;
        this.uiManager = uiManager;
        this.db = ganttManager.db;
        this.showNotification = ganttManager.showNotification;
        this.questManager = null;
        this.ganttScrollLeft = 0;
        this.ganttScrollTop = 0;
        this.isDragging = false;
        this.draggedOffsetX = 0;

        // UI-DESIGN: Definiert die verfügbaren Zoomstufen für das Gantt-Diagramm.
        // Jede Stufe ist eine Kombination aus [timescale_in_minuten, sichtbare_stunden].
        this.zoomLevels = [
            [15, 1], [15, 2], [15, 4],
            [30, 4], [30, 6], [30, 8],
            [60, 8], [60, 10], [60, 12]
        ];
        this.currentZoomIndex = 5; // Startet mit einer mittleren Zoomstufe (30min Skala, 8h sichtbar)
        this.isZooming = false;
        this.zoomTimeout = null;
    }

    attachEventListeners() {
        this.ganttChartContainer = this.ganttManager.ganttChartContainer; // Get the container now that it exists
        this.ganttViewSelect = document.getElementById('gantt-view-select');
        this.sortAllBtn = document.getElementById('gantt-sort-all-btn');
        this.pomodoroToggle = document.getElementById('gantt-pomodoro-toggle');
        this.pomodoroSettingsBtn = document.getElementById('gantt-pomodoro-settings-btn');
        this.pomodoroActivationModal = document.getElementById('div-4330');
        this.pomodoroSettingsModal = document.getElementById('div-4340');
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
        this.logQuestToggle = document.getElementById('log-toggle-quests'); // Corrected ID
        this.logBreakToggle = document.getElementById('log-toggle-breaks');
        this.testShowPomodoroBreaksBtn = document.getElementById('test-show-pomodoro-breaks-btn');
        this.pomodoroBreaksTestModal = document.getElementById('div-5300');
        this.pomodoroSplitModal = document.getElementById('div-4360');
        this.ganttHeader = null; // Wird in attachEventListeners initialisiert

        this.ganttHeader = document.getElementById('div-4310'); // Initialize ganttHeader here
        if (this.sortAllBtn) this.sortAllBtn.addEventListener('click', () => this.ganttManager.sortManager.sortAllQuests());
        if (this.pomodoroToggle) {
            this.pomodoroToggle.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this._openPomodoroActivationModal();
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
        this.pomodoroSettingsModal.querySelector('.modal-close-btn').addEventListener('click', () => this.pomodoroSettingsModal.classList.add('hidden'));
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
                    this._renderPomodoroBreaksList();
                }
            });
        }
        if (this.pomodoroSplitModal) {
            this.pomodoroSplitModal.querySelector('.modal-close-btn').addEventListener('click', () => this.pomodoroSplitModal.classList.add('hidden'));
        }

        // Add listeners for the new day navigation buttons
        this._addGanttDragDropListeners();
        this.ganttChartContainer.addEventListener('click', (e) => this._handleDayNavigation(e));
        this.ganttChartContainer.addEventListener('click', (e) => this._handleCollapseToggle(e));

        document.getElementById('div-4310').addEventListener('click', (e) => this._handleSave(e));

        // UI-DESIGN: Fügt den Event-Listener für das Zoomen mit dem Mausrad hinzu.
        this.ganttChartContainer.addEventListener('wheel', (e) => this._handleWheelZoom(e), { passive: false });
    }
    
    _handlePomodoroPriorityChange(e) {
        const select = e.target;
        const questId = select.dataset.questId;
        const priority = parseInt(select.value, 10);
        if (!questId) return;
        updateDoc(doc(this.db, 'todos', questId), { pomodoroPriority: priority });
    }

    _handleDayNavigation(e) {
        const prevDayBtn = e.target.closest('.gantt-prev-day-btn');
        const nextDayBtn = e.target.closest('.gantt-next-day-btn');
        const calendarBtn = e.target.closest('.gantt-calendar-btn');

        if (prevDayBtn) {
            this.ganttManager.currentGanttDate.setDate(this.ganttManager.currentGanttDate.getDate() - 1);
            this.ganttManager.render(this.ganttManager.localQuests);
        }

        if (nextDayBtn) {
            this.ganttManager.currentGanttDate.setDate(this.ganttManager.currentGanttDate.getDate() + 1);
            this.ganttManager.render(this.ganttManager.localQuests);
        }

        if (calendarBtn) {
            // Placeholder for calendar popup logic
            this.showNotification("Kalender-Popup noch nicht implementiert.", "info");
        }
    }

    _handleCollapseToggle(e) {
        const collapseBtn = e.target.closest('.gantt-label-collapse-btn');
        if (collapseBtn) {
            this.uiManager.isLabelColumnCollapsed = !this.uiManager.isLabelColumnCollapsed;
            this.ganttManager.render(this.ganttManager.localQuests);
        }
    }

    _handleSave(e) {
        const saveBtn = e.target.closest('#gantt-save-btn');
        if (saveBtn) {
            this.ganttManager.savePendingChanges();
        }
    }

    /**
     * Behandelt das Zoomen im Gantt-Chart via Strg + Mausrad.
     * @param {WheelEvent} e - Das Wheel-Event.
     */
    _handleWheelZoom(e) {
        if (!e.ctrlKey) return; // Nur zoomen, wenn STRG gedrückt ist
        e.preventDefault();

        // Debouncing, um zu schnelles Feuern zu verhindern
        if (this.isZooming) return;
        this.isZooming = true;
        setTimeout(() => { this.isZooming = false; }, 100); // Cooldown von 100ms

        const zoomDirection = e.deltaY < 0 ? 'in' : 'out';

        if (zoomDirection === 'in') {
            this.currentZoomIndex = Math.max(0, this.currentZoomIndex - 1);
        } else {
            this.currentZoomIndex = Math.min(this.zoomLevels.length - 1, this.currentZoomIndex + 1);
        }

        const [newTimescale, newHours] = this.zoomLevels[this.currentZoomIndex];

        // Aktualisiere die Dropdown-Werte
        if (this.ganttManager.ganttTimescaleSelect) {
            this.ganttManager.ganttTimescaleSelect.value = newTimescale;
        }
        // Die Stunden-Optionen müssen eventuell neu erstellt werden
        this.ganttManager._updateHoursViewOptions();
        if (this.ganttManager.ganttHoursViewSelect) {
            this.ganttManager.ganttHoursViewSelect.value = newHours;
        }

        // Rendere das Gantt-Chart mit der neuen Zoomstufe neu
        this.ganttManager.render(this.ganttManager.localQuests);
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
            bar.style.opacity = '0.3';
            e.target.addEventListener('dragend', () => { e.target.style.opacity = '1'; }, { once: true });
        });
        this._handleResizeMouseMove = this._handleResizeMouseMove.bind(this);
        this._handleResizeMouseUp = this._handleResizeMouseUp.bind(this);
        this.ganttChartContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });
        this.ganttChartContainer.addEventListener('drop', async (e) => {
            e.preventDefault();
            const questId = e.dataTransfer.getData('text/plain');
            const quest = this.ganttManager.localQuests.find(q => q.id === questId);
            if (!quest) return;
            const viewMode = this.ganttViewSelect.value;
            let pixelOffset, timelinePixelWidth, viewDate;
            if (viewMode === 'single-line') {
                const timelineCell = this.ganttChartContainer.querySelector('.relative.h-10');
                if (!timelineCell) return;
                const timelineRect = timelineCell.getBoundingClientRect();
                pixelOffset = (e.clientX - timelineRect.left + this.ganttChartContainer.scrollLeft) - this.draggedOffsetX;
                timelinePixelWidth = timelineCell.scrollWidth;
            } else {
                const scrollContainer = this.ganttChartContainer.querySelector('#gantt-timeline-scroll-container');
                if (!scrollContainer) return;
                const containerRect = scrollContainer.getBoundingClientRect();
                pixelOffset = (e.clientX - containerRect.left + scrollContainer.scrollLeft) - this.draggedOffsetX;
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
            // Statt direkt zu speichern, die Änderung vormerken
            this.ganttManager.addPendingChange(questId, { ganttScheduledAt: Timestamp.fromDate(newStartTime), breaks: updatedBreaks });
            // Visuelles Update ohne Neuladen der Daten aus der DB
            this.ganttManager.render(this.ganttManager.localQuests);
        });
    }

    _addGanttResizeListeners() {
        this.ganttChartContainer.addEventListener('mousedown', (e) => {
            const resizeHandle = e.target.closest('.gantt-resize-handle');
            if (!resizeHandle) return;
            e.preventDefault();
            this.isResizing = true;
            this.resizingQuestId = resizeHandle.dataset.questId;
            this.resizingQuestBar = resizeHandle.closest('.gantt-quest-bar');
            if (!this.resizingQuestBar) return;
            this.resizeStartWidth = this.resizingQuestBar.offsetWidth;
            this.resizeStartMouseX = e.clientX;
            const quest = this.ganttManager.localQuests.find(q => q.id === this.resizingQuestId);
            this.originalQuestDuration = quest ? quest.durationMinutes : 0;
            console.log('Resize-Analyse (Start):', { startWidth: this.resizeStartWidth, startMouseX: this.resizeStartMouseX, originalDuration: this.originalQuestDuration, pixelsPerMinute: this.pixelsPerMinute });
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
            document.addEventListener('mousemove', this._handleResizeMouseMove);
            document.addEventListener('mouseup', this._handleResizeMouseUp);
        });
    }

    _handleResizeMouseMove(e) {
        if (!this.isResizing || !this.resizingQuestBar || !this.resizingQuestId) return;
        const deltaX = e.clientX - this.resizeStartMouseX;
        const durationChangeMinutes = (deltaX / this.pixelsPerMinute);
        let newDurationMinutes = Math.round((this.originalQuestDuration + durationChangeMinutes) / 5) * 5;
        newDurationMinutes = Math.max(5, newDurationMinutes);
        console.log('Resize-Analyse (Move):', { newDurationMinutes });
        const totalDayMinutes = 24 * 60;
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
        const deltaX = e.clientX - this.resizeStartMouseX;
        const durationChangeMinutes = (deltaX / this.pixelsPerMinute);
        let finalDurationMinutes = Math.round((this.originalQuestDuration + durationChangeMinutes) / 5) * 5;
        console.log('Resize-Analyse (Ende):', { deltaX, durationChangeMinutes, finalDurationMinutes });
        finalDurationMinutes = Math.max(5, finalDurationMinutes);
        if (finalDurationMinutes !== this.originalQuestDuration) {
            // Statt direkt zu speichern, die Änderung vormerken
            this.ganttManager.addPendingChange(this.resizingQuestId, { durationMinutes: finalDurationMinutes, breaks: [] });
            this.showNotification(`Änderung für "${quest.text}" vorgemerkt.`);
        }
        this.resizingQuestId = null;
        this.resizingQuestBar = null;
        this.pixelsPerMinute = 0;
        this.originalQuestDuration = 0;
        this.ganttManager.render(this.ganttManager.localQuests);
        this.ganttManager.triggerSortIfPomodoroActive();
    }

    _addGanttTooltipListeners() {
        this._addGanttResizeListeners();
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
            if (!e.target.closest('#div-4320') || (!infoIcon && !warningIcon)) return;
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
                if (!e.target.closest('#div-4320')) return;
                e.stopPropagation();
                const questId = infoIcon.dataset.questId || infoIcon.closest('.gantt-quest-bar')?.dataset.questId;
                if (questId && this.questManager) this.questManager._openEditModal(questId);
                return;
            }
            const warningIcon = e.target.closest('.gantt-warning-icon');
            if (warningIcon) {
                const warningType = warningIcon.dataset.warningType;
                if (!e.target.closest('#div-4320') || warningType !== 'long_segment') return;
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
            const pomodoroBreakBar = e.target.closest('.gantt-pomodoro-break');
            if (pomodoroBreakBar) {
                if (!e.target.closest('#div-4320')) return;
                e.stopPropagation();
                document.querySelector('.gantt-popover')?.remove();
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
                if (!e.target.closest('#div-4320')) return;
                e.stopPropagation();
                const questId = splitButton.dataset.questId;
                this.pomodoroSplitModal.querySelector('#quest-split-confirm-btn').dataset.questId = questId;
                this.pomodoroSplitModal.classList.remove('hidden');
            }
            const breakBar = e.target.closest('.gantt-break-bar');
            if (breakBar) {
                if (!e.target.closest('#div-4320')) return;
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

    _renderPomodoroBreakPopoverContent(breakId) {
        const breakData = this.ganttManager.pomodoroBreaks.find(b => b.id === breakId);
        if (!breakData) return;
        const contentEl = document.getElementById('pomodoro-break-popover-content');
        if (!contentEl) return;
        const currentDuration = (breakData.endTime - breakData.startTime) / 60000;
        let buttonsHtml = '';
        if (currentDuration !== 5) {
            buttonsHtml += `<button data-action="set-pomodoro-break" data-duration="5" class="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded">5 Min</button>`;
        }
        if (currentDuration !== 10) {
            buttonsHtml += `<button data-action="set-pomodoro-break" data-duration="10" class="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded">10 Min</button>`;
        }
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
        contentEl.querySelectorAll('button[data-action="set-pomodoro-break"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const duration = parseInt(e.target.dataset.duration, 10);
                this._updatePomodoroBreakDuration(breakId, duration);
                popover?.remove();
            });
        });
        contentEl.querySelector('button[data-action="set-pomodoro-break-manual"]').addEventListener('click', () => {
            const input = document.getElementById('manual-pomodoro-break-duration');
            const newDuration = parseInt(input.value, 10);
            if (!isNaN(newDuration) && newDuration > 0) {
                this._updatePomodoroBreakDuration(breakId, newDuration);
                popover?.remove();
            }
        });
    }

    _updatePomodoroBreakDuration(breakId, newDurationMinutes) {
        const breakIndex = this.ganttManager.pomodoroBreaks.findIndex(b => b.id === breakId);
        if (breakIndex === -1) return;
        const targetBreak = this.ganttManager.pomodoroBreaks[breakIndex];
        const newDurationMillis = newDurationMinutes * 60000;
        targetBreak.endTime = targetBreak.startTime + newDurationMillis;
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
        this.ganttManager.pomodoroModeActive = true;
        this.uiManager.warningManager.pomodoroModeActive = true;
        this.showNotification(`Pomodoro-Modus aktiviert.`, "success");
        const settings = this.ganttManager.questManager?.userProfile?.pomodoroSettings || {};
        const gridSettings = {
            startTime: startTime || settings.startTime || '09:00',
            workInterval: workInterval || 45,
            shortBreak: shortBreak || 10,
            longBreak: settings.longBreakDuration || 30,
            longBreakInterval: 4
        };
        const userId = this.ganttManager.questManager?.currentUser?.uid;
        if (userId) {
            const userRef = doc(this.db, 'users', userId);
            await updateDoc(userRef, { "pomodoroSettings.startTime": startTime });
            await updateDoc(doc(this.db, 'todos', selectedQuestId), { pomodoroPriority: 1 });
        }
        this.ganttManager.renderPomodoroGrid(gridSettings);
        setTimeout(() => this.ganttManager.sortManager.sortAllQuests(), 200);
    }

    _deactivatePomodoroMode() {
        this.pomodoroToggle.checked = false;
        this.pomodoroSettingsBtn.classList.add('hidden');
        this.showNotification("Pomodoro-Modus deaktiviert.", "info");
        this.uiManager.warningManager.pomodoroModeActive = false;
        this.ganttManager.pomodoroModeActive = false;
        this.ganttManager.pomodoroBreaks = [];
        this.ganttManager.render(this.ganttManager.localQuests);
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
        this.shortBreakColorInput.value = breakBarColors.short || '#FBBF24';
        this.longBreakColorInput.value = breakBarColors.long || '#F59E0B';
        const lineStyle = settings.lineStyle || {};
        this.lineColorInput.value = lineStyle.color || '#FBBF24';
        this.lineThicknessInput.value = lineStyle.thickness || 2;
        const barStyle = settings.barStyle || {};
        this.barOutlineThicknessInput.value = barStyle.outlineThickness || 1;
        this._updatePomodoroStyleSelection();
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
            await updateDoc(userRef, { "pomodoroSettings": settings });
            this._applyPomodoroStyling(settings);
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
        container.classList.remove('pomodoro-style-bar', 'pomodoro-style-line');
        container.classList.add(`pomodoro-style-${settings.breakBarStyle || 'bar'}`);
        const barStyle = settings.barStyle || {};
        const breakBarColors = settings.breakBarColors || {};
        root.style.setProperty('--pomodoro-short-break-bg', breakBarColors.short || '#FBBF24');
        root.style.setProperty('--pomodoro-long-break-bg', breakBarColors.long || '#F59E0B');
        root.style.setProperty('--pomodoro-bar-outline-thickness', `${barStyle.outlineThickness || 1}px`);
        root.style.setProperty('--pomodoro-break-bar-border-color', barStyle.borderColor || '#FBBF24');
        root.style.setProperty('--pomodoro-break-bar-border-radius', barStyle.roundedCorners ? '0.25rem' : '0px');
        const lineStyle = settings.lineStyle || {};
        root.style.setProperty('--pomodoro-line-color', lineStyle?.color || '#FBBF24');
        root.style.setProperty('--pomodoro-line-thickness', `${lineStyle?.thickness || 2}px`);
    }

    _updatePomodoroStyleSelection() {
        const selectedStyle = document.querySelector('input[name="pomodoro-style"]:checked').value;
        this.pomodoroLineSettingsContainer.classList.toggle('hidden', selectedStyle !== 'line');
        this.pomodoroBarSettingsContainer.classList.toggle('hidden', selectedStyle !== 'bar');
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

/**
 * UI-DESIGN: Verantwortlich für das Rendern (Zeichnen) des Gantt-Charts.
 */
class GanttRenderManager {
    constructor(ganttManager, uiManager) {
        this.ganttManager = ganttManager;
        this.uiManager = uiManager;
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
        const startHour = 0;
        const endHour = 24;
        const hoursInView = 24;
        const labelColumnWidthPx = 150;
        const intervalMinutes = parseInt(this.ganttTimescaleSelect.value, 10) || 60;
        const totalColumns = (hoursInView * 60) / intervalMinutes;
        const visibleHours = parseInt(this.ganttHoursViewSelect.value, 10);
        const columnsInView = (visibleHours * 60) / intervalMinutes;
        const scrollbarWidth = 17;
        const columnWidth = (viewport.clientWidth - labelColumnWidthPx - scrollbarWidth) / columnsInView;
        this.ganttChartContainer.innerHTML = '';
        this.ganttChartContainer.style.display = 'flex';
        this.ganttChartContainer.style.height = '100%';

        // UI-DESIGN: Neue, separate Leiste für den Collapse-Button, die immer sichtbar ist.
        const collapseContainer = document.createElement('div');
        collapseContainer.id = 'gantt-collapse-bar';
        collapseContainer.className = 'flex-shrink-0 bg-gray-800 z-20 flex flex-col';
        collapseContainer.style.width = '30px';

        // UI-DESIGN: Der eigentliche Container für die Quest-Labels, der ein- und ausgeklappt wird.
        const labelsContainer = document.createElement('div');
        labelsContainer.id = 'gantt-labels-column';
        labelsContainer.className = 'flex-shrink-0 bg-gray-800 z-20 flex flex-col';
        labelsContainer.style.width = `${labelColumnWidthPx}px`;

        // UI-DESIGN: Container für die Zeitachse.
        const timelineScrollContainer = document.createElement('div');
        timelineScrollContainer.id = 'gantt-timeline-scroll-container';
        timelineScrollContainer.classList.add('gantt-multiline-scrollbar');
        timelineScrollContainer.className = 'flex-grow overflow-auto';

        const timelineGrid = document.createElement('div');
        timelineGrid.id = 'gantt-timeline-grid';
        timelineGrid.style.display = 'grid';
        timelineGrid.style.gridTemplateColumns = `repeat(${totalColumns}, ${columnWidth}px)`;
        timelineGrid.style.position = 'relative';
        timelineGrid.style.paddingBottom = '16px';

        // UI-DESIGN: Kopfzeile für die Collapse-Leiste.
        const collapseHeader = document.createElement('div');
        collapseHeader.className = 'h-8 border-b-2 border-gray-600 sticky top-0 bg-gray-800 flex items-center justify-center';
        const collapseIcon = this.uiManager.isLabelColumnCollapsed ? '⏩' : '⏮️';
        collapseHeader.innerHTML = `<button class="gantt-label-collapse-btn p-1 rounded-md hover:bg-gray-700" title="Seitenleiste umschalten">${collapseIcon}</button>`;
        collapseContainer.appendChild(collapseHeader);

        // UI-DESIGN: Funktion zum Erstellen der Datumsnavigationsleiste.
        const createDateHeader = () => {
            const header = document.createElement('div');
            header.className = 'h-8 border-b-2 border-gray-600 sticky top-0 bg-gray-800 flex items-center justify-between px-2';
            header.innerHTML = `
                <button class="gantt-prev-day-btn p-1 rounded-md hover:bg-gray-700" title="Vorheriger Tag">&lt;</button>
                <div class="flex items-center gap-2">
                    <span class="font-bold">${this.ganttManager.currentGanttDate.toLocaleDateString('de-DE')}</span>
                    <button class="gantt-calendar-btn p-1 rounded-md hover:bg-gray-700" title="Datum auswählen">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"></path></svg>
                    </button>
                </div>
                <button class="gantt-next-day-btn p-1 rounded-md hover:bg-gray-700" title="Nächster Tag">&gt;</button>
            `;
            return header;
        };

        const dateHeaderInSidebar = createDateHeader();

        // UI-DESIGN: Erstellt die Kopfzeile der Zeitachse mit den Stunden-Markierungen.
        for (let i = 0; i < totalColumns; i++) {
            const currentMinute = i * intervalMinutes;
            const hour = startHour + Math.floor(currentMinute / 60);
            const minute = currentMinute % 60;
            const hourCell = document.createElement('div');
            hourCell.className = 'text-center text-xs text-gray-400 border-b-2 border-gray-600 border-r border-gray-700 h-8 flex items-center justify-center sticky top-0 bg-gray-800 z-10';
            hourCell.append(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
            timelineGrid.appendChild(hourCell);
        }

        // Erstelle einen Wrapper für die Label-Spalte, der die Kopfzeile und die Liste enthält
        const labelWrapper = document.createElement('div');
        labelWrapper.className = 'flex flex-col flex-shrink-0 bg-gray-800 z-20';
        labelWrapper.style.width = `${labelColumnWidthPx}px`;
        labelWrapper.appendChild(dateHeaderInSidebar);
        labelWrapper.appendChild(labelsContainer);

        // UI-DESIGN: Passt die Ansicht an, je nachdem ob die Label-Spalte (der Wrapper) eingeklappt ist.
        if (this.uiManager.isLabelColumnCollapsed) {
            labelWrapper.style.display = 'none';
            
            // UI-DESIGN: Fügt die vertikale Datumsnavigation in die schmale Leiste ein.
            const collapsedDateNav = document.createElement('div');
            collapsedDateNav.className = 'flex flex-col items-center justify-center gap-2 p-2';
            collapsedDateNav.innerHTML = `
                <button class="gantt-prev-day-btn p-1 rounded-md hover:bg-gray-700" title="Vorheriger Tag">▲</button>
                <button class="gantt-calendar-btn p-1 rounded-md hover:bg-gray-700" title="Datum auswählen">
                     <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"></path></svg>
                </button>
                <span class="font-bold text-xs text-center leading-tight">
                    ${String(this.ganttManager.currentGanttDate.getDate()).padStart(2, '0')}<br>
                    ${String(this.ganttManager.currentGanttDate.getMonth() + 1).padStart(2, '0')}<br>
                    ${String(this.ganttManager.currentGanttDate.getFullYear()).slice(-2)}
                </span>
                <button class="gantt-next-day-btn p-1 rounded-md hover:bg-gray-700" title="Nächster Tag">▼</button>
            `;
            collapseContainer.appendChild(collapsedDateNav);
        }

        let scheduledQuests = this.ganttManager.localQuests.filter(q => {
            return this._isToday(q.ganttScheduledAt);
        });
        if (scheduledQuests.length === 0) {
            const emptyRow = document.createElement('div'); // This should be in the timelineGrid, not labelsContainer
            emptyRow.className = 'text-center text-gray-500 p-4';
            emptyRow.textContent = 'Keine Quests für diesen Tag geplant.';
            labelsContainer.appendChild(emptyRow); // Correctly place it in the label list area
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
        this.ganttChartContainer.append(collapseContainer, labelWrapper, timelineScrollContainer);
        this._setupGanttScroll(timelineScrollContainer);
        this._renderPomodoroSchedule(timelineGrid, startHour, hoursInView);
        this._addCurrentTimeIndicator();
    }

    _setupGanttScroll(scrollContainer, startHour = 0) {
        setTimeout(() => {
            if (!scrollContainer) return;
            if (this.uiManager.interactionManager.isDragging) {
                scrollContainer.scrollLeft = this.uiManager.interactionManager.ganttScrollLeft;
                scrollContainer.scrollTop = this.uiManager.interactionManager.ganttScrollTop;
                this.uiManager.interactionManager.isDragging = false;
            } else {
                const firstQuest = this.ganttManager.localQuests
                    .filter(q => q.ganttScheduledAt)
                    .sort((a, b) => a.ganttScheduledAt.toMillis() - b.ganttScheduledAt.toMillis())[0];
                if (firstQuest) {
                    const firstQuestHour = firstQuest.ganttScheduledAt.toDate().getHours();
                    const totalDayMinutes = 24 * 60;
                    const questStartMinutesInDay = firstQuestHour * 60 + firstQuest.ganttScheduledAt.toDate().getMinutes();
                    const scrollPercentage = questStartMinutesInDay / totalDayMinutes;
                    const targetScrollLeft = scrollContainer.scrollWidth * scrollPercentage - 100;
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
            if (timelineGridEl) {
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
        this.ganttChartContainer.innerHTML = '';
        this.ganttChartContainer.style.overflowX = 'auto';
        this.ganttChartContainer.classList.add('gantt-singleline-scrollbar');
        this.ganttChartContainer.style.overflowY = 'hidden';
        this.ganttChartContainer.style.display = 'grid';
        this.ganttChartContainer.style.gridTemplateRows = 'auto 1fr';
        const intervalMinutes = parseInt(this.ganttTimescaleSelect.value, 10) || 60;
        const totalColumns = (hoursInView * 60) / intervalMinutes;
        const visibleHours = parseInt(this.ganttHoursViewSelect.value, 10);
        const columnsInView = (visibleHours * 60) / intervalMinutes;
        const scrollbarWidth = 17;
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
        const scheduledQuests = this.ganttManager.localQuests.filter(q => {
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
            const questLabel = document.createElement('div'); // UI-DESIGN: Quest-Label-Container
            questLabel.className = 'border-t border-gray-700 h-8 flex items-center justify-center gap-2 px-2'; // justify-center für zentrierten Text
            if (this.ganttManager.pomodoroModeActive) {
                const prioritySelect = document.createElement('select');
                prioritySelect.className = 'pomodoro-priority-select bg-gray-700 text-white text-xs rounded p-0.5 focus:ring-0 border-gray-600';
                prioritySelect.dataset.questId = quest.id;
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
                prioritySelect.addEventListener('change', (e) => this.uiManager.interactionManager._handlePomodoroPriorityChange(e));
                questLabel.appendChild(prioritySelect);
            }
            const textSpan = document.createElement('span');
            textSpan.className = 'truncate text-center'; // text-center für zentrierten Text
            textSpan.textContent = quest.text;
            questLabel.appendChild(textSpan);
            labelsContainer.appendChild(questLabel);
        }
        const timelineCell = document.createElement('div');
        timelineCell.className = 'relative h-8 border-t border-gray-700';
        timelineCell.style.gridRow = `${rowNum}`;
        timelineCell.style.gridColumn = '1 / -1';
        if (quest.durationMinutes > 0) {
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
                const questBar = this._createGanttBar(quest, startHour, hoursInView, index, allScheduledQuests, timelineCell);
                if (questBar) {
                    timelineCell.appendChild(questBar);
                }
            }
            (quest.breaks || []).forEach(breakItem => {
                const breakBar = document.createElement('div');
                breakBar.className = 'gantt-quest-bar gantt-break-bar bg-gray-500 opacity-70 z-20 cursor-pointer';
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

        // UI-DESIGN: Fügt den Quest-Namen direkt in den Balken ein.
        const textSpan = document.createElement('span');
        textSpan.className = 'gantt-bar-text';
        textSpan.textContent = quest.text;
        questBar.appendChild(textSpan);

        const questStart = scheduleTimestamp.toDate();
        const questStartMinutes = (questStart.getHours() - startHour) * 60 + questStart.getMinutes();
        questBar.style.left = `${(questStartMinutes / totalViewMinutes) * 100}%`;
        questBar.style.width = `${(quest.durationMinutes / totalViewMinutes) * 100}%`;
        const projectStripe = document.createElement('div');
        if (!isSegment) {
            const resizeHandle = document.createElement('div');
            resizeHandle.className = 'gantt-resize-handle';
            resizeHandle.innerHTML = '↔️';
            resizeHandle.dataset.questId = quest.id;
            questBar.appendChild(resizeHandle);
        }
        setTimeout(() => {
            const isShortQuest = questBar.clientWidth < 40;
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'gantt-bar-actions';
            let actionsHtml = `<span id="gantt-info-icon-${quest.id}" class="gantt-info-icon" ${isShortQuest ? `data-quest-id="${quest.id}"` : ''}>ℹ️</span>`;
            if (this.ganttManager.pomodoroModeActive && quest.durationMinutes > 25 && !isSegment) {
                actionsHtml += `<button class="gantt-quest-split-btn text-xs bg-purple-700 hover:bg-purple-600 rounded px-1.5 py-0.5" data-quest-id="${quest.id}">Split</button>`;
            }
            actionsContainer.innerHTML = actionsHtml;
            if (isShortQuest && questBar.parentElement) {
                actionsContainer.style.position = 'absolute';
                actionsContainer.style.left = `${questBar.offsetLeft + questBar.offsetWidth + 5}px`;
                actionsContainer.style.top = `${questBar.offsetTop}px`;
                questBar.parentElement.appendChild(actionsContainer);
            } else {
                questBar.appendChild(actionsContainer);
            }
        }, 0);
        setTimeout(() => {
            const settings = this.ganttManager.questManager?.userProfile?.pomodoroSettings || {};
            if (settings.pomodoroModeActive) return;
            const viewStartDate = new Date();
            viewStartDate.setHours(startHour, 0, 0, 0);
            const currentStartMs = (quest.ganttScheduledAt || quest.scheduledAt).toMillis();
            const currentEndMs = currentStartMs + quest.durationMinutes * 60000;
            allScheduledQuests.forEach(otherQuest => {
                if (quest.id === otherQuest.id) return;
                const otherStartMs = (otherQuest.ganttScheduledAt || otherQuest.scheduledAt).toMillis();
                const otherEndMs = otherStartMs + otherQuest.durationMinutes * 60000;
                if (currentStartMs < otherEndMs && currentEndMs > otherStartMs) {
                    const overlapStartMs = Math.max(currentStartMs, otherStartMs);
                    const overlapEndMs = Math.min(currentEndMs, otherEndMs);
                    const overlapStartMinutesInView = ((overlapStartMs - viewStartDate.getTime()) / 60000);
                    const overlapDurationMinutes = (overlapEndMs - overlapStartMs) / 60000;
                    const conflictSegment = document.createElement('div');
                    conflictSegment.className = 'gantt-conflict-segment z-20';
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
        const totalDayMinutes = 24 * 60;
        this.ganttManager.pomodoroBreaks.forEach(breakData => {
            let renderMode = null;
            if (questStartMs < breakData.endTime && questEndMs > breakData.startTime) {
                renderMode = 'full';
            } else if (questEndMs === breakData.startTime) {
                renderMode = 'top';
            } else if (questStartMs === breakData.endTime) {
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
                breakBar.dataset.breakId = breakData.id;
                parentCell.appendChild(breakBar);
            }
        });
    }

    _renderFixedBreaks(parentCell, startHour, hoursInView, isMultiLine = false) {
        const settings = this.ganttManager.questManager?.userProfile?.pomodoroSettings;
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
            blockBar.className = `gantt-schedule-block ${block.type} z-0`;
            blockBar.title = `${block.type.replace('_', ' ')} (${durationMinutes} min)`;
            const blockStart = new Date(block.startTime);
            const blockStartMinutesInView = (blockStart.getHours() - startHour) * 60 + blockStart.getMinutes();
            blockBar.style.left = `${(blockStartMinutesInView / totalViewMinutes) * 100}%`;
            blockBar.style.width = `${(durationMinutes / totalViewMinutes) * 100}%`;
            parentCell.appendChild(blockBar);
        });
    }
}

/**
 * UI-DESIGN: Die Hauptklasse, die alle UI-bezogenen Manager für das Gantt-Chart orchestriert.
 */
export class GanttUIManager {
    constructor(ganttManager) {
        this.ganttManager = ganttManager;
        this.warningManager = new GanttWarningManager();
        this.isLabelColumnCollapsed = false; // Zustand für die eingeklappte Seitenleiste
        this.interactionManager = new GanttInteractionManager(ganttManager, this);
        this.renderManager = new GanttRenderManager(ganttManager, this);
    }

    setDependencies(questManager) {
        this.interactionManager.questManager = questManager;
    }

    attachEventListeners() {
        this.interactionManager.attachEventListeners();
        this.interactionManager._addGanttTooltipListeners();

        // UI-DESIGN: Stellt sicher, dass die temporäre Datumsleiste im Haupt-Header entfernt wird, falls sie noch existiert.
        if (this.interactionManager.ganttHeader) {
            const headerDateNav = this.interactionManager.ganttHeader.querySelector('#gantt-date-nav-header');
            if (headerDateNav) {
                headerDateNav.remove();
            }
        }
    }
    
    /**
     * Zeigt oder versteckt das Speicher-Icon basierend darauf, ob es ungespeicherte Änderungen gibt.
     */
    toggleSaveButton(show) {
        let saveBtn = document.getElementById('gantt-save-btn');
        if (show && !saveBtn) {
            saveBtn = document.createElement('button');
            saveBtn.id = 'gantt-save-btn';
            saveBtn.className = 'absolute left-1/2 -translate-x-1/2 top-3 p-2 bg-blue-600 rounded-full shadow-lg hover:bg-blue-500 z-50';
            saveBtn.innerHTML = `<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>`;
            this.interactionManager.ganttHeader.appendChild(saveBtn);
        } else if (!show && saveBtn) {
            saveBtn.remove();
        }
    }

    render(quests) {
        const settings = this.ganttManager.questManager?.userProfile?.pomodoroSettings;
        if (settings) {
            this.interactionManager._applyPomodoroStyling(settings);
        }
        if (!this.ganttManager.ganttChartContainer) return;
        const viewMode = this.ganttManager.ganttViewSelect.value;
        if (viewMode === 'single-line') {
            this.renderManager.renderGanttSingleLineView();
        } else {
            this.renderManager.renderMultiLineView();
        }
        if (viewMode === 'single-line') {
            const timelineCell = this.ganttManager.ganttChartContainer.querySelector('.relative.h-10');
            if (timelineCell) {
                this.renderManager._renderPomodoroSchedule(timelineCell, 0, 24);
                this.renderManager._renderPomodoroBreaks(timelineCell, 0, 24, false, this.ganttManager.pomodoroBreaks);
                this.renderManager._renderFixedBreaks(timelineCell, 0, 24, false);
            }
        }
        this.renderManager._addCurrentTimeIndicator();
    }
}