export class QuestWizardManager {
    constructor(availableTags, weekDays) {
        this.availableTags = availableTags;
        this.weekDays = weekDays;

        // DOM Elements
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
        this.questWizardProgress = document.getElementById('quest-wizard-progress');
        this.questBackBtn = document.getElementById('quest-back-btn');
        this.questNextBtn = document.getElementById('quest-next-btn');
        this.questSubmitBtn = document.getElementById('quest-submit-btn');
        this.toggleDetailsBtn = document.getElementById('toggle-details-btn'); // This ID is correct
        this.detailsToggleContent = document.getElementById('div-1127');

        // State
        this.currentQuestStep = 1;
        this.newQuestDuration = 0;
    }

    _attachEventListeners() {
        this._setupNewQuestForm();

        this.addTodoForm.addEventListener('input', () => this._validateCurrentQuestStep());
        this.addTodoForm.addEventListener('change', () => this._validateCurrentQuestStep());

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
            this.detailsToggleContent.classList.toggle('hidden');
            this.toggleDetailsBtn.textContent = this.detailsToggleContent.classList.contains('hidden') ? 'Beschreibung hinzufügen +' : 'Beschreibung ausblenden -';
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

        document.getElementById('duration-mode-toggle').addEventListener('click', (e) => {
            document.getElementById('Bearbeitungsdauer-Pomodoro').classList.toggle('hidden');
            document.getElementById('Bearbeitungsdauer-Frei').classList.toggle('hidden');
            e.target.textContent = document.getElementById('Bearbeitungsdauer-Pomodoro').classList.contains('hidden') ? 'Button-Eingabe' : 'Manuelle Eingabe';
            this._validateCurrentQuestStep();
        });

        this.todoRepeatCheckbox.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            document.getElementById('todo-repeat-options-container').classList.toggle('hidden', !isChecked);
            document.getElementById('deadline-container').style.display = isChecked ? 'none' : 'block';
            document.getElementById('priority-container').style.display = isChecked ? 'none' : 'block';
            if (isChecked) this.todoPriorityInput.value = 'Leicht';
            this._validateCurrentQuestStep();
        });

        document.getElementById('schedule-today-btn').addEventListener('click', () => {
            document.getElementById('todo-scheduled-date').valueAsDate = new Date();
        });

        document.getElementById('deadline-today-btn').addEventListener('click', () => {
            document.getElementById('todo-deadline').valueAsDate = new Date();
            this._validateCurrentQuestStep(); // Trigger validation manually
        });
    }

    _setupNewQuestForm() {
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
    }

    _renderQuestWizardProgress() {
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
        switch (this.currentQuestStep) {
            case 1: isValid = true; break;
            case 2: isValid = this.todoInput.value.trim() !== ''; break;
            case 3:
                if (taskType === 'Projekt') isValid = document.getElementById('project-duration-days').value > 0;
                else {
                    const isFreeMode = !document.getElementById('Bearbeitungsdauer-Frei').classList.contains('hidden');
                    if (isFreeMode) isValid = this._parseDuration(document.getElementById('quest-duration-free-input').value) > 0;
                    else isValid = this.newQuestDuration > 0;
                }
                break;
            case 4: isValid = isDaily ? this.todoStartTimeInput.value !== '' : this.todoDeadlineInput.value !== ''; break;
            case 5: isValid = !!this.todoTagsContainer.querySelector('input:checked'); break;
            default: isValid = false;
        }
        this.questNextBtn.disabled = !isValid;
    }

    _showQuestStep(step) {
        this.questWizardSteps.forEach(s => s.classList.add('hidden'));
        document.getElementById(`quest-step-${step}`)?.classList.remove('hidden');
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
        const durationDisplayContainer = document.getElementById('div-1133');
        if (durationDisplayContainer) {
            const durationDisplaySpan = durationDisplayContainer.querySelector('span');
            if (durationDisplaySpan) durationDisplaySpan.textContent = this._formatDuration(0);
        }
        this.todoTagsContainer.querySelector('input').checked = true;
        document.getElementById('todo-scheduled-date').value = '';
        document.getElementById('div-1145').style.display = 'block';
        document.getElementById('div-1138').querySelector('#deadline-container').style.display = 'block';
        document.getElementById('div-1141').classList.add('hidden');
        this.todoPriorityInput.value = 'Mittel';
        this.todoStartTimeInput.value = '10:00';
        document.getElementById('project-start-date').valueAsDate = new Date();
        document.getElementById('Bearbeitungsdauer-Pomodoro').classList.remove('hidden');
        document.getElementById('Bearbeitungsdauer-Frei').classList.add('hidden');
        document.getElementById('duration-mode-toggle').textContent = 'Manuelle Eingabe';
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