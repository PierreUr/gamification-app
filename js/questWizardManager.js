export class QuestWizardManager {
    constructor(availableTags, weekDays) {
        this.availableTags = availableTags;
        this.weekDays = weekDays;

        // DOM Elements (IDs must match index.html/UI_ELEMENT_IDS.md)
        this.addTodoForm = document.getElementById('add-todo-form');
        this.todoInput = document.getElementById('todo-input');
        this.todoDetailsInput = document.getElementById('todo-details');
        this.todoPriorityInput = document.getElementById('todo-priority');
        this.todoDeadlineInput = document.getElementById('todo-deadline');
        this.todoTagsContainer = document.getElementById('div-1147');
        this.todoTaskTypeInput = document.getElementById('todo-task-type');
        this.todoParentProjectContainer = document.getElementById('todo-parent-project-container');
        this.todoParentProjectInput = document.getElementById('todo-parent-project');
        this.todoRepeatCheckbox = document.getElementById('todo-repeat');
        this.todoRepeatDaysContainer = document.getElementById('div-1143');
        this.todoStartTimeInput = document.getElementById('todo-start-time');
        this.questWizardSteps = document.querySelectorAll('.quest-wizard-step');
        this.questWizardProgress = document.getElementById('div-1148'); 
        this.questBackBtn = document.getElementById('quest-back-btn');
        this.questNextBtn = document.getElementById('quest-next-btn');
        this.questSubmitBtn = document.getElementById('quest-submit-btn');
        this.toggleDetailsBtn = document.getElementById('toggle-details-btn'); 
        this.detailsToggleContent = document.getElementById('div-1127'); 
        
        // --- Steuerelemente für Logik (Müssen im Konstruktor zugewiesen sein) ---
        this.priorityContainer = document.getElementById('div-1145');
        this.deadlineContainer = document.getElementById('deadline-container');
        this.scheduledDateContainer = document.getElementById('scheduled-date-container');
        this.repeatOptionsContainer = document.getElementById('div-1141');
        this.startDateContainer = document.getElementById('start-date-container'); 
        this.durationContainerTask = document.getElementById('div-1132'); 
        this.durationContainerProject = document.getElementById('div-1136'); 
        
        this.durationPomodoroContainer = document.getElementById('div-1133'); 
        this.durationFreeContainer = document.getElementById('Bearbeitungsdauer-Frei'); 
        this.durationModeToggle = document.getElementById('duration-mode-toggle');

        this.durationStylePomodoro = document.getElementById('duration-style-pomodoro');
        this.durationStyleManual = document.getElementById('duration-style-manual');

        // State
        this.currentQuestStep = 1;
        this.newQuestDuration = 0;
    }

    _attachEventListeners() {
        this._setupNewQuestForm();

        this.addTodoForm.addEventListener('input', () => this._validateCurrentQuestStep());
        this.addTodoForm.addEventListener('change', () => this._validateCurrentQuestStep());
        
        this.todoTaskTypeInput.addEventListener('change', () => this._handleTaskTypeChange());

        this.questNextBtn.addEventListener('click', () => {
            if (this.currentQuestStep < this.questWizardSteps.length) {
                this.currentQuestStep++;
                this._showQuestStep(this.currentQuestStep);
            }
        });

        this.questBackBtn.addEventListener('click', () => {
            if (this.currentQuestStep > 1) {
                this.currentQuestStep--;
                this._showQuestStep(this.currentQuestStep);
            }
        });

        this.toggleDetailsBtn.addEventListener('click', () => {
            this.detailsToggleContent?.classList.toggle('hidden');
            this.toggleDetailsBtn.textContent = this.detailsToggleContent?.classList.contains('hidden') ? 'Beschreibung hinzufügen +' : 'Beschreibung ausblenden -';
        });

        document.querySelectorAll('.duration-add-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.newQuestDuration += parseInt(btn.dataset.addDuration, 10);
                document.getElementById('quest-duration-display').textContent = this._formatDuration(this.newQuestDuration);
                this._validateCurrentQuestStep();
            });
        });

        document.getElementById('duration-reset-btn').addEventListener('click', () => {
            this.newQuestDuration = 0;
            document.getElementById('quest-duration-display').textContent = this._formatDuration(0);
            this._validateCurrentQuestStep();
        });

        this.durationModeToggle?.addEventListener('click', (e) => {
            // Logik für Umschaltung innerhalb des MANUELLEN Modus
            this.durationPomodoroContainer?.classList.toggle('hidden');
            this.durationFreeContainer?.classList.toggle('hidden');
            e.target.textContent = this.durationPomodoroContainer?.classList.contains('hidden') ? 'Button-Eingabe' : 'Manuelle Eingabe';
            this._validateCurrentQuestStep();
        });
        
        this.durationStylePomodoro?.addEventListener('change', () => this._handleDurationStyleChange(true));
        this.durationStyleManual?.addEventListener('change', () => this._handleDurationStyleChange(false));

        this.todoRepeatCheckbox.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            this.repeatOptionsContainer?.classList.toggle('hidden', !isChecked);
            
            // Logik: Tägliche Quests blenden Deadline/geplanten Tag/Priorität aus
            this.deadlineContainer.style.display = isChecked ? 'none' : 'block';
            this.scheduledDateContainer.style.display = isChecked ? 'none' : 'block';
            this.priorityContainer.style.display = isChecked ? 'none' : 'block';
            
            if (isChecked) this.todoPriorityInput.value = 'Leicht';
            this._validateCurrentQuestStep();
        });

        document.getElementById('schedule-today-btn')?.addEventListener('click', () => {
            document.getElementById('todo-scheduled-date').valueAsDate = new Date();
        });

        document.getElementById('deadline-today-btn')?.addEventListener('click', () => {
            document.getElementById('todo-deadline').valueAsDate = new Date();
            this._validateCurrentQuestStep();
        });
    }

    _handleTaskTypeChange() {
        const type = this.todoTaskTypeInput.value;
        const isProject = type === 'Projekt';
        const isTask = type === 'Aufgabe' || type === 'Projektaufgabe';

        // Sichtbarkeit der Dauer-Container steuern (Step 3)
        this.durationContainerTask?.classList.toggle('hidden', !isTask);
        this.durationContainerProject?.classList.toggle('hidden', !isProject);
        
        this.todoParentProjectContainer?.classList.toggle('hidden', type !== 'Projektaufgabe');

        // Sichtbarkeit der Datums-Container steuern (Step 4)
        this.deadlineContainer.classList.toggle('hidden', isProject);
        this.startDateContainer.classList.toggle('hidden', !isProject);
        this.scheduledDateContainer.classList.toggle('hidden', isProject);
        this.todoRepeatCheckbox.closest('.pt-2')?.classList.toggle('hidden', isProject);

        // Standardmäßig auf Pomodoro zurückschalten, wenn es keine Projekt ist
        if (isTask) {
             // Sicherstellen, dass die Radio-Buttons richtig stehen
            if(this.durationStylePomodoro) this.durationStylePomodoro.checked = true;
            this._handleDurationStyleChange(true); 
            this.todoRepeatCheckbox.checked = false;
        }

        this._validateCurrentQuestStep();
    }
    
    _handleDurationStyleChange(isPomodoro) {
        // Logik für die Umschaltung der Dauer-UI (Buttons vs. Freitext)
        
        // Prüfen, ob wir im Aufgaben-Modus sind
        if (this.todoTaskTypeInput.value !== 'Aufgabe' && this.todoTaskTypeInput.value !== 'Projektaufgabe') return;
        
        if (isPomodoro) {
            // POMODORO: Standardmäßig Buttons, kein Toggle sichtbar
            this.durationPomodoroContainer?.classList.remove('hidden');
            this.durationFreeContainer?.classList.add('hidden');
            this.durationModeToggle?.classList.add('hidden');
        } else {
            // MANUELL: Startet in Buttons-Ansicht, aber Toggle ist sichtbar
            this.durationPomodoroContainer?.classList.remove('hidden');
            this.durationFreeContainer?.classList.add('hidden');
            this.durationModeToggle?.classList.remove('hidden');
            this.durationModeToggle.textContent = 'Manuelle Eingabe';
        }
        this._validateCurrentQuestStep();
    }

    _setupNewQuestForm() {
        if (!this.todoTagsContainer) return;
        this.availableTags.forEach((tag, index) => {
            const label = document.createElement('label');
            label.className = 'flex items-center gap-2 cursor-pointer';
            const radio = document.createElement('input');
            radio.type = 'radio'; radio.name = 'quest-tag'; radio.value = tag;
            radio.className = 'form-radio bg-gray-700 border-gray-600 text-indigo-500 focus:ring-indigo-500';
            if (index === 0) radio.checked = true;
            label.appendChild(radio);
            label.append(tag);
            this.todoTagsContainer.appendChild(label);
        });
        if (!this.todoRepeatDaysContainer) return;
        this.weekDays.forEach(day => {
            const label = document.createElement('label');
            label.className = 'flex items-center gap-1 cursor-pointer';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox'; checkbox.value = day;
            checkbox.className = 'form-checkbox bg-gray-700 border-gray-600 text-indigo-500 focus:ring-indigo-500';
            label.appendChild(checkbox);
            label.append(day);
            this.todoRepeatDaysContainer.appendChild(label);
        });
        
        // Initialer Zustand festlegen
        this._handleTaskTypeChange();
    }

    _renderQuestWizardProgress() {
        if (!this.questWizardProgress) return;
        this.questWizardProgress.innerHTML = '';
        for (let i = 1; i <= this.questWizardSteps.length; i++) {
            const dot = document.createElement('div');
            dot.className = 'wizard-progress-dot';
            if (i <= this.currentQuestStep) dot.classList.add('active');
            this.questWizardProgress.appendChild(dot);
        }
    }

    _parseDuration(inputStr) {
        let totalMinutes = 0;
        const hourMatch = inputStr.match(/(\d+)\s*h/);
        const minuteMatch = inputStr.match(/(\d+)\s*m/);
        const numberOnlyMatch = inputStr.match(/^\d+$/);
        if (hourMatch) totalMinutes += parseInt(hourMatch[1], 10) * 60;
        if (minuteMatch) totalMinutes += parseInt(minuteMatch[1], 10);
        if (!hourMatch && !minuteMatch && numberOnlyMatch) totalMinutes = parseInt(numberOnlyMatch[1], 10);
        return totalMinutes;
    }

    _validateCurrentQuestStep() {
        let isValid = false;
        const isDaily = this.todoRepeatCheckbox.checked;
        const taskType = this.todoTaskTypeInput.value;
        
        // Hilfsfunktion, um die aktuelle Dauer zu ermitteln
        const getCurrentDuration = () => {
            const isManualFree = this.durationFreeContainer && !this.durationFreeContainer.classList.contains('hidden');
            return isManualFree ? this._parseDuration(document.getElementById('quest-duration-free-input').value) : this.newQuestDuration;
        };

        switch (this.currentQuestStep) {
            case 1: isValid = true; break;
            case 2: isValid = this.todoInput.value.trim() !== ''; break;
            
            case 3:
                if (taskType === 'Projekt') {
                    isValid = document.getElementById('project-duration-days').value > 0;
                } else {
                    const isPomodoroStyle = this.durationStylePomodoro?.checked;

                    if (isPomodoroStyle) {
                        // POMODORO MODE: Dauer ist PFLICHT
                        isValid = getCurrentDuration() > 0;
                    } else {
                        // MANUELLER MODE: Dauer ist OPTIONAL (Prüfung folgt in Step 4)
                        const currentDuration = getCurrentDuration();
                        isValid = currentDuration >= 0; 
                    }
                }
                break;
                
            case 4: 
                const currentDuration = getCurrentDuration();
                const hasScheduledDate = document.getElementById('todo-scheduled-date').value !== '';
                
                // 1. Validierung des Datumsfeldes selbst
                if (isDaily) {
                    isValid = this.todoStartTimeInput.value !== '';
                } else if (taskType === 'Projekt') {
                    isValid = document.getElementById('project-start-date').value !== '';
                } else {
                    // Nicht-tägliche Aufgabe/Projektaufgabe: Deadline ist Pflicht
                    isValid = this.todoDeadlineInput.value !== ''; 
                }
                
                // 2. ZUSÄTZLICHE PRÜFUNG: Dauer ist Pflicht, wenn ein Datum gesetzt ist
                // Dies gilt für alle Aufgaben/Projektaufgaben (nicht für Projekte) und wenn ein Datum relevant ist.
                const requiresDuration = (isValid || hasScheduledDate) && taskType !== 'Projekt' && !isDaily;

                if (requiresDuration && currentDuration === 0) {
                    isValid = false; 
                }
                
                break;
                
            case 5: isValid = !!this.todoTagsContainer.querySelector('input:checked'); break;
            default: isValid = false;
        }
        this.questNextBtn.disabled = !isValid;
    }

    _showQuestStep(step) {
        this.questWizardSteps.forEach(s => s.classList.add('hidden'));
        const stepIdMap = { 1: 'div-1123', 2: 'div-1125', 3: 'div-1128', 4: 'div-1137', 5: 'div-1144' };
        document.getElementById(stepIdMap[step])?.classList.remove('hidden');
        
        this.questBackBtn.classList.toggle('hidden', step === 1);
        this.questNextBtn.classList.toggle('hidden', step === this.questWizardSteps.length);
        this.questSubmitBtn.classList.toggle('hidden', step !== this.questWizardSteps.length);
        this._renderQuestWizardProgress();
        this._validateCurrentQuestStep();
    }

    _formatDuration(totalMinutes) {
        if (totalMinutes === 0) return '0m';
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m` : ''}`.trim();
    }

    reset() {
        this.addTodoForm.reset();
        this.currentQuestStep = 1;
        this.newQuestDuration = 0;
        
        const durationDisplaySpan = document.getElementById('quest-duration-display');
        if (durationDisplaySpan) durationDisplaySpan.textContent = this._formatDuration(0);

        if (this.todoTagsContainer.querySelector('input')) this.todoTagsContainer.querySelector('input').checked = true;

        const scheduledDateInput = document.getElementById('todo-scheduled-date');
        if (scheduledDateInput) scheduledDateInput.value = '';
        
        // Initialer Zustand: Aufgabe, Pomodoro
        this.todoTaskTypeInput.value = 'Aufgabe';
        this._handleTaskTypeChange(); // Setzt alle UI-Elemente basierend auf 'Aufgabe'

        // Stelle sicher, dass die Pomodoro-Radio-Buttons aktiv sind, bevor _handleDurationStyleChange aufgerufen wird
        if(this.durationStylePomodoro) this.durationStylePomodoro.checked = true;
        this._handleDurationStyleChange(true); 

        // Setze Sichtbarkeit von Datumsfeldern zurück
        this.deadlineContainer?.style.removeProperty('display');
        this.scheduledDateContainer?.style.removeProperty('display');
        this.startDateContainer?.classList.add('hidden');
        this.todoRepeatCheckbox.closest('.pt-2')?.classList.remove('hidden'); 
        this.todoRepeatCheckbox.checked = false;
        this.repeatOptionsContainer?.classList.add('hidden');
        
        this.priorityContainer?.style.removeProperty('display');
        this.todoPriorityInput.value = 'Mittel';
        this.todoStartTimeInput.value = '10:00';
        
        const projectStartDate = document.getElementById('project-start-date');
        if (projectStartDate) projectStartDate.valueAsDate = new Date();

        
        const durationModeToggle = document.getElementById('duration-mode-toggle');
        if (durationModeToggle) durationModeToggle.textContent = 'Manuelle Eingabe';
        
        this.questSubmitBtn.textContent = 'Quest Hinzufügen';
        this._showQuestStep(1);
    }

    populateParentProjectDropdown(allQuests) {
        if (!this.todoParentProjectInput) return;
        
        const projects = allQuests.filter(q => q.taskType === 'Projekt');
        this.todoParentProjectInput.innerHTML = '<option value="">Kein Projekt ausgewählt</option>';
        projects.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = p.text;
            this.todoParentProjectInput.appendChild(option);
        });
    }
}
