import { collection, query, where, onSnapshot, addDoc, serverTimestamp, Timestamp, deleteDoc, updateDoc, doc, increment } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

export class QuestManager {
    constructor(db, showNotificationCallback, handleXpGainCallback, processQuestDropCallback, showDeleteConfirmCallback) {
        this.db = db;
        this.showNotification = showNotificationCallback;
        this.handleXpGain = handleXpGainCallback; // Callback for core game logic
        this.processQuestDrop = processQuestDropCallback;
        this.showDeleteConfirm = showDeleteConfirmCallback;

        // DOM Elements
        this.myQuestsModal = document.getElementById('my-quests-modal');
        this.newQuestModal = document.getElementById('new-quest-modal');
        this.editQuestModal = document.getElementById('edit-quest-modal');
        this.todoListContainer = document.getElementById('todo-list');
        this.focusQuestContainer = document.getElementById('focus-quest-container');
        this.addTodoForm = document.getElementById('add-todo-form');
        this.ganttChartContainer = document.getElementById('gantt-chart-container');
        this.ganttDateInput = document.getElementById('gantt-date');

        // --- New Quest Wizard Elements ---
        this.todoInput = document.getElementById('todo-input');
        this.todoDetailsInput = document.getElementById('todo-details');
        this.todoPriorityInput = document.getElementById('todo-priority');
        this.todoDeadlineInput = document.getElementById('todo-deadline');
        this.todoTagsContainer = document.getElementById('todo-tags-container');
        this.todoTaskTypeInput = document.getElementById('todo-task-type');
        this.todoParentProjectContainer = document.getElementById('todo-parent-project-container');
        this.todoParentProjectInput = document.getElementById('todo-parent-project');
        this.todoRepeatCheckbox = document.getElementById('todo-repeat');
        this.todoRepeatDaysContainer = document.getElementById('todo-repeat-days-container');
        this.todoStartTimeInput = document.getElementById('todo-start-time');
        this.questWizardSteps = document.querySelectorAll('.quest-wizard-step');
        this.questWizardProgress = document.getElementById('quest-wizard-progress');
        this.questBackBtn = document.getElementById('quest-back-btn');
        this.questNextBtn = document.getElementById('quest-next-btn');
        this.questSubmitBtn = document.getElementById('quest-submit-btn');
        this.toggleDetailsBtn = document.getElementById('toggle-details-btn');
        this.detailsToggleContent = document.getElementById('details-toggle-content');

        // --- Config & Constants ---
        this.availableTags = ['Arbeit', 'Privat', 'Lernen', 'Haushalt', 'Sport'];
        this.weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];


        // My Quests Filter Elements
        this.questListFilters = document.getElementById('quest-list-filters');

        // State
        this.currentUser = null;
        this.userProfile = null;
        this.questsUnsubscribe = null;
        this.localQuests = [];
        this.focusedQuestId = null;
        this.currentQuestSort = { field: 'priority', direction: 'asc' };
        this.currentQuestFilter = 'all';
        this.currentQuestStep = 1;
        this.editingQuestId = null; // Hinzugefügt für den Bearbeitungsmodus
        this.newQuestDuration = 0;
    }

    updateUserData(user, userProfile) {
        this.currentUser = user;
        this.userProfile = userProfile;

        if (user) {
            this._listenToQuests(user.uid);
        } else {
            if (this.questsUnsubscribe) this.questsUnsubscribe();
            this.localQuests = [];
        }
    }

    _listenToQuests(userId) {
        if (this.questsUnsubscribe) this.questsUnsubscribe();
        const q = query(collection(this.db, 'todos'), where("userId", "==", userId));
        this.questsUnsubscribe = onSnapshot(q, (snapshot) => {
            console.log('Quests updated:', snapshot.docs.length); // DEBUG
            this.localQuests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this._renderMyQuests();
            this._renderFocusQuest();
            this._populateParentProjectDropdown();
            this._renderGanttChart();
        });
    }

    _getXpForPriority(priority) {
        const xpMap = { 'Leicht': 10, 'Mittel': 25, 'Schwer': 50 };
        return xpMap[priority] || 0;
    }

    _getCurrencyForPriority(priority) {
        const rewards = { 'Leicht': 5, 'Mittel': 15, 'Schwer': 30 };
        let bronze = rewards[priority] || 0;
        let html = '';
        if (bronze > 0) html += `<span class="flex items-center gap-1" title="${bronze} Bronze">🥉<span class="text-orange-400">${bronze}</span></span>`;
        return html;
    }

    _applyQuestFiltersAndSort(quests) {
        let filteredQuests = [...quests];

        // Apply filters
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        if (this.currentQuestFilter === 'dueToday') {
            filteredQuests = filteredQuests.filter(q => {
                if (!q.deadline) return false;
                const deadlineDate = q.deadline.toDate();
                return deadlineDate >= todayStart && deadlineDate <= todayEnd;
            });
        } else if (this.currentQuestFilter === 'dueThisWeek') {
            const weekEnd = new Date(todayEnd);
            weekEnd.setDate(weekEnd.getDate() + (7 - now.getDay())); // End of the current week (Sunday)
            filteredQuests = filteredQuests.filter(q => {
                if (!q.deadline) return false;
                const deadlineDate = q.deadline.toDate();
                return deadlineDate >= todayStart && deadlineDate <= weekEnd;
            });
        }



        // Apply sorting
        filteredQuests.sort((a, b) => {
            const field = this.currentQuestSort.field;
            let valA, valB;

            if (field === 'priority') {
                const priorityOrder = { 'Schwer': 0, 'Mittel': 1, 'Leicht': 2 };
                valA = priorityOrder[a.priority];
                valB = priorityOrder[b.priority];
            } else if (field === 'xp') {
                valA = this._getXpForPriority(b.priority); // Higher XP first
                valB = this._getXpForPriority(a.priority);
            } else if (field === 'createdAt') {
                valA = b.createdAt?.toMillis() || 0; // Newest first
                valB = a.createdAt?.toMillis() || 0;
            } else { // 'text'
                valA = a.text.toLowerCase();
                valB = b.text.toLowerCase();
            }

            if (valA < valB) return -1;
            if (valA > valB) return 1;
            return 0;
        });

        return filteredQuests;
    }

    _renderMyQuests() {
        // Die Quest, die im Fokus ist, soll in der Hauptliste nicht mehr erscheinen.
        const questsToRender = this._applyQuestFiltersAndSort(this.localQuests.filter(q => q.id !== this.focusedQuestId));
        this.todoListContainer.innerHTML = '';

        if (questsToRender.length === 0) {
            this.todoListContainer.innerHTML = '<p class="text-gray-400 text-center">Keine Quests entsprechen den aktuellen Filtern.</p>';
            return;
        }

        questsToRender.forEach(todo => {
            // Prüfen, ob die Quest bereits für heute terminiert ist.
            const isDueToday = () => {
                if (!todo.deadline) return false;
                const deadlineDate = todo.deadline.toDate();
                const today = new Date();
                return deadlineDate.getDate() === today.getDate() &&
                       deadlineDate.getMonth() === today.getMonth() &&
                       deadlineDate.getFullYear() === today.getFullYear();
            };

            const todoEl = document.createElement('div');
            todoEl.className = 'grid grid-cols-[1fr_auto_1fr] items-center gap-2 p-3 bg-gray-700 rounded-lg transition-all duration-300 hover:bg-gray-600';
            todoEl.dataset.questId = todo.id;

            let tagsHtml = (todo.tags || []).map(tag => `<span class="text-xs bg-gray-600 px-2 py-0.5 rounded-full">${tag}</span>`).join(' ');

            todoEl.innerHTML = `
                 <div class="flex-grow">
                    <p class="font-bold">${todo.text}</p>
                    <div class="flex items-center gap-2 text-xs text-gray-400 mt-1">
                        <span class="font-bold text-yellow-400">${this._getXpForPriority(todo.priority)} XP</span>
                        <span class="text-gray-600">|</span>
                        ${this._getCurrencyForPriority(todo.priority)}
                        <span class="text-gray-600">|</span>
                        ${tagsHtml}
                    </div>
                </div>
                <div class="flex-shrink-0 flex flex-col gap-1">
                    <button data-id="${todo.id}" class="focus-btn text-xs bg-cyan-600 hover:bg-cyan-500 p-2 rounded-lg font-bold w-24">Fokus</button>
                    ${!isDueToday() ? `<button data-id="${todo.id}" class="today-btn text-xs bg-blue-600 hover:bg-blue-500 p-2 rounded-lg font-bold w-24">Heute</button>` : ''}
                </div>
                <div class="flex items-center justify-end gap-2 self-start">
                     <button data-id="${todo.id}" class="edit-btn text-gray-400 hover:text-yellow-400 font-bold text-lg" title="Bearbeiten">✏️</button>
                     <button data-id="${todo.id}" class="complete-btn flex-shrink-0 w-6 h-6 border-2 border-gray-500 rounded-full transition-colors duration-300 hover:bg-green-500"></button>
                     <button data-id="${todo.id}" class="delete-btn text-gray-400 hover:text-red-500 font-bold text-xl">&times;</button>
                </div>
            `;
            this.todoListContainer.appendChild(todoEl);
        });
    }

    _renderFocusQuest() {
        this.focusQuestContainer.innerHTML = '';
        let quest = this.localQuests.find(q => q.id === this.focusedQuestId);

        if (!quest) {
            // Wenn keine Quest im Fokus ist, schlage die nächste fällige Quest vor
            const sortedByDeadline = this.localQuests.filter(q => q.deadline).sort((a, b) => a.deadline.toMillis() - b.deadline.toMillis());
            const suggestion = sortedByDeadline.length > 0 ? sortedByDeadline[0] : null;
            this.focusQuestContainer.innerHTML = this._generateFocusSuggestionHTML(suggestion);
            return;
        }

        this.focusQuestContainer.innerHTML = this._generateFocusQuestHTML(quest);
    }

    _generateFocusQuestHTML(quest) {
        const priorityColors = { 'Leicht': 'text-green-500', 'Mittel': 'text-yellow-500', 'Schwer': 'text-red-500' };
        return `
            <h3 class="text-lg font-bold text-cyan-400 mb-2 border-b border-gray-600 pb-2 text-center">Fokus</h3>
            <div class="relative p-3 bg-gray-900 rounded-lg border-2 border-cyan-500 flex flex-col items-center gap-4">
                <div>
                    <p class="font-bold text-xl text-center">${quest.text}</p>
                    <div class="flex items-center justify-center gap-2 text-sm text-gray-400 mt-1">
                        <span class="font-bold ${priorityColors[quest.priority] || 'text-gray-400'}">${quest.priority}</span>
                        <span class="text-gray-600">|</span>
                        <span class="font-bold text-yellow-400">${this._getXpForPriority(quest.priority)} XP</span>
                    </div>
                </div>
                <button data-id="${quest.id}" class="stop-focus-btn absolute top-2 right-2 text-xs bg-gray-500 hover:bg-gray-400 p-1 rounded z-10">Fokus beenden</button>
                <button data-id="${quest.id}" class="complete-btn mt-4 w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300">Abschließen</button>
            </div>`;
    }

    _generateFocusSuggestionHTML(quest) {
        if (!quest) {
            return '<p class="text-center text-gray-500 text-sm">Keine Quest im Fokus. Wähle eine Quest aus der Liste aus.</p>';
        }
        return `
            <h3 class="text-lg font-bold text-gray-500 mb-2 border-b border-gray-700 pb-2 text-center">Nächster Vorschlag</h3>
            <div class="p-3 bg-gray-700 rounded-lg flex flex-col items-center gap-4 opacity-70">
                <p class="font-bold text-lg text-center">${quest.text}</p>
                <button data-id="${quest.id}" class="focus-btn w-full bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">Fokus starten</button>
            </div>`;
    }

    _renderGanttChart() {
        if (!this.ganttChartContainer) return;

        this.ganttChartContainer.innerHTML = '';
        const selectedDate = new Date(this.ganttDateInput.value);
        selectedDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const questsForDay = this.localQuests.filter(quest => {
            if (!quest.deadline) return false;
            const deadline = quest.deadline.toDate();
            return deadline >= selectedDate && deadline < nextDay;
        });

        if (questsForDay.length === 0) {
            this.ganttChartContainer.innerHTML = '<p class="text-gray-400 text-center col-span-2">Keine Quests für heute geplant.</p>';
            return;
        }

        // 1. Render Header Row
        // Empty top-left cell for alignment
        this.ganttChartContainer.appendChild(document.createElement('div'));

        // The actual header bar with hours
        const headerContainer = document.createElement('div');
        headerContainer.className = 'grid grid-cols-24 text-center text-xs text-gray-400 border-b border-gray-700';
        for (let i = 0; i < 24; i++) {
            const hour = document.createElement('div');
            hour.textContent = `${i}:00`;
            hour.className = 'border-r border-gray-700 last:border-r-0';
            headerContainer.appendChild(hour);
        }
        this.ganttChartContainer.appendChild(headerContainer);

        // 2. Render Quest Rows
        questsForDay.forEach(quest => {
            // Column 1: Quest Label
            const questLabel = document.createElement('div');
            questLabel.className = 'text-right pr-2 truncate border-t border-gray-700 h-8 flex items-center justify-end';
            questLabel.textContent = quest.text;
            this.ganttChartContainer.appendChild(questLabel);

            // Column 2: Quest Bar Container (for positioning the bar inside)
            const questBarContainer = document.createElement('div');
            questBarContainer.className = 'relative h-8 border-t border-gray-700';
            const questBar = document.createElement('div');
            questBar.className = 'gantt-quest-bar bg-blue-600';
            // ... (Positioning logic for the bar will be added here)
            questBar.textContent = quest.text;
            questBarContainer.appendChild(questBar);
            this.ganttChartContainer.appendChild(questBarContainer);
        });
    }

    _renderTestGanttChart() {
        const container = document.getElementById('gantt-test-container');
        if (!container) return;

        container.innerHTML = '';
        // Define the grid structure directly on the main container
        container.className = 'grid grid-cols-[150px_1fr] gap-y-1';

        const questsForDay = this.localQuests.filter(quest => quest.deadline && quest.durationMinutes > 0).sort((a, b) => a.deadline.toMillis() - b.deadline.toMillis());

        // --- 1. Render Header ---
        const headerLabel = document.createElement('div');
        headerLabel.className = 'h-8 border-b-2 border-gray-600 sticky top-0 bg-gray-800 z-10';
        container.appendChild(headerLabel);

        const headerTimeline = document.createElement('div');
        headerTimeline.className = 'grid grid-cols-24 text-center text-xs text-gray-400 border-b-2 border-gray-600 min-w-[1200px] sticky top-0 bg-gray-800 z-10';
        for (let i = 0; i < 24; i++) {
            const hour = document.createElement('div');
            hour.textContent = `${i}:00`;
            hour.className = 'border-r border-gray-700';
            headerTimeline.appendChild(hour);
        }
        container.appendChild(headerTimeline);

        // --- 2. Render Quest Rows ---
        questsForDay.forEach(quest => {
            // Add label to the first grid column
            const questLabel = document.createElement('div');
            questLabel.className = 'text-right pr-2 truncate border-t border-gray-700 h-8 flex items-center justify-end';
            questLabel.textContent = quest.text;
            container.appendChild(questLabel);

            // Add a corresponding row with the bar to the second grid column
            const timelineRow = document.createElement('div');
            timelineRow.className = 'relative h-8 border-t border-gray-700 min-w-[1200px]';

            const questBar = document.createElement('div');
            questBar.className = 'gantt-quest-bar bg-indigo-600';
            const deadline = quest.deadline.toDate();
            const durationMinutes = quest.durationMinutes || 60;
            const endMinutes = deadline.getHours() * 60 + deadline.getMinutes();
            const startMinutes = endMinutes - durationMinutes;
            questBar.style.left = `${(startMinutes / 1440) * 100}%`;
            questBar.style.width = `${(durationMinutes / 1440) * 100}%`;
            questBar.textContent = quest.text;
            timelineRow.appendChild(questBar);
            container.appendChild(timelineRow);
        });
    }

    async _handleQuestCompletion(questId) {
        const userId = this.currentUser?.uid;
        if (!userId) return;

        const quest = this.localQuests.find(q => q.id === questId);
        if (!quest) return;

        if (quest.id === this.focusedQuestId) {
            this.focusedQuestId = null;
        }

        const xpGained = this._getXpForPriority(quest.priority);
        const currencyRewards = { 'Leicht': 5, 'Mittel': 15, 'Schwer': 30 };
        let bronzeGained = currencyRewards[quest.priority] || 0;

        await deleteDoc(doc(this.db, 'todos', questId));

        this.showNotification(`Quest "${quest.text}" abgeschlossen! +${xpGained} XP & +${bronzeGained} Bronze`, 'success');

        await updateDoc(doc(this.db, 'users', userId), {
            questsCompleted: increment(1),
            'currency.bronze': increment(bronzeGained)
        });

        // Call the central game logic handler for XP and level-ups
        if (this.handleXpGain) {
            await this.handleXpGain(userId, xpGained);
        }

        // Trigger drop system
        if (this.processQuestDrop) {
            this.processQuestDrop(quest, this.userProfile);
        }
    }

    _setupNewQuestForm() {
        this.availableTags.forEach((tag, index) => {
            const label = document.createElement('label');
            label.className = 'flex items-center gap-2 cursor-pointer';
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'quest-tag';
            radio.value = tag;
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
            checkbox.type = 'checkbox';
            checkbox.value = day;
            checkbox.className = 'form-checkbox bg-gray-700 border-gray-600 text-indigo-500 focus:ring-indigo-500';
            label.appendChild(checkbox);
            label.append(day);
            this.todoRepeatDaysContainer.appendChild(label);
        });
    }

    _attachEventListeners() {
        this._setupNewQuestForm(); // Setup form elements before attaching listeners to them
        this.ganttDateInput.valueAsDate = new Date();
        this.ganttDateInput.addEventListener('change', () => this._renderGanttChart());

        document.getElementById('menu-btn-new-quest').addEventListener('click', () => {
            this._resetQuestWizard();
            this.editingQuestId = null; // Sicherstellen, dass wir im Erstellen-Modus sind
            this.newQuestModal.classList.remove('hidden');
        });
        this.newQuestModal.querySelector('.modal-close-btn').addEventListener('click', () => this.newQuestModal.classList.add('hidden'));

        document.getElementById('menu-btn-my-quests').addEventListener('click', () => this.myQuestsModal.classList.remove('hidden'));
        this.myQuestsModal.querySelector('.modal-close-btn').addEventListener('click', () => this.myQuestsModal.classList.add('hidden'));

        // --- Simple Test Modal Listeners ---
        const simpleQuestModal = document.getElementById('simple-quest-modal');
        document.getElementById('menu-btn-simple-quest').addEventListener('click', () => simpleQuestModal.classList.remove('hidden'));
        simpleQuestModal.querySelector('.modal-close-btn').addEventListener('click', () => simpleQuestModal.classList.add('hidden'));
        document.getElementById('simple-quest-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = document.getElementById('simple-quest-input');
            const text = input.value.trim();
            if (!text || !this.currentUser) return;

            const newQuest = {
                userId: this.currentUser.uid,
                text: `(Test) ${text}`,
                priority: 'Mittel',
                tags: ['Test'],
                createdAt: serverTimestamp(),
            };
            await addDoc(collection(this.db, 'todos'), newQuest);
            input.value = '';
            simpleQuestModal.classList.add('hidden');
            this.showNotification("Simple Test Quest hinzugefügt!", "success");
        });

        // --- Wizard Navigation ---
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

        // --- Wizard Form Element Listeners ---
        this.addTodoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = this.todoInput.value.trim();
            const selectedTag = this.todoTagsContainer.querySelector('input:checked')?.value;
            const isDaily = this.todoRepeatCheckbox.checked;
            const taskType = this.todoTaskTypeInput.value;
            const submitButton = this.questSubmitBtn;

            if (!text || !selectedTag || !this.currentUser) {
                 this.showNotification("Bitte Titel und Tag ausfüllen.", "error"); return;
            }

            const newQuest = {
                userId: this.currentUser.uid,
                text: text,
                priority: isDaily ? 'Leicht' : this.todoPriorityInput.value,
                details: this.todoDetailsInput.value,
                taskType: taskType,
                tags: [selectedTag],
                createdAt: serverTimestamp(),
                isDaily: isDaily,
                repeatDays: Array.from(this.todoRepeatDaysContainer.querySelectorAll('input:checked')).map(input => input.value),
                startTime: isDaily ? this.todoStartTimeInput.value : null,
                durationMinutes: 0
            };
            
            if (taskType === 'Projekt') {
                const durationDays = parseInt(document.getElementById('project-duration-days').value, 10);
                const startDate = new Date(document.getElementById('project-start-date').value);
                if (isNaN(startDate.getTime()) || durationDays <= 0) {
                    this.showNotification("Bitte gültiges Startdatum und Dauer für das Projekt angeben.", "error"); return;
                }
                startDate.setHours(0,0,0,0);
                newQuest.durationMinutes = durationDays * 24 * 60;
                newQuest.ganttScheduledAt = Timestamp.fromDate(startDate);
            } else {
                let durationInMinutes = 0;
                const isFreeMode = !document.getElementById('Bearbeitungsdauer-Frei').classList.contains('hidden');
                if (isFreeMode) {
                    durationInMinutes = this._parseDuration(document.getElementById('quest-duration-free-input').value);
                } else {
                    durationInMinutes = this.newQuestDuration;
                }

                if (durationInMinutes <= 0) {
                     this.showNotification("Bitte eine Dauer von mehr als 0 Minuten angeben.", "error"); return;
                }
                newQuest.durationMinutes = durationInMinutes;
                
                let deadline;
                if(isDaily) {
                    if (!this.todoStartTimeInput.value) {
                         this.showNotification("Bitte eine Startzeit für die tägliche Quest angeben.", "error"); return;
                    }
                    deadline = new Date();
                } else {
                     if (!this.todoDeadlineInput.value) {
                         this.showNotification("Bitte eine Deadline angeben.", "error"); return;
                    }
                    deadline = new Date(this.todoDeadlineInput.value);
                }
                deadline.setHours(23, 59, 59, 999);
                newQuest.deadline = Timestamp.fromDate(deadline);
            }

            if (newQuest.taskType === 'Projektaufgabe' && this.todoParentProjectInput.value) {
                newQuest.parentProjectId = this.todoParentProjectInput.value;
            }

            submitButton.disabled = true;
            if (this.editingQuestId) {
                await updateDoc(doc(this.db, 'todos', this.editingQuestId), newQuest);
                this.showNotification("Quest aktualisiert!", "success");
                this.editingQuestId = null;
            } else {
                await addDoc(collection(this.db, 'todos'), newQuest);
                this.showNotification("Neue Quest hinzugefügt!", "success");
            }
            this.newQuestModal.classList.add('hidden');
            submitButton.disabled = false;
        });

        // --- Other Listeners ---
        this.todoListContainer.addEventListener('click', async (e) => {
            const questId = e.target.closest('[data-quest-id]')?.dataset.questId;
            if (!questId) return;

            if (e.target.closest('.complete-btn')) {
                await this._handleQuestCompletion(questId);
            } else if (e.target.closest('.delete-btn')) {
                const quest = this.localQuests.find(q => q.id === questId);
                const questName = quest ? `"${quest.text}"` : "diese Quest";
                this.showDeleteConfirm(`Willst du ${questName} wirklich löschen?`, async () => {
                    await deleteDoc(doc(this.db, 'todos', questId));
                    this.showNotification("Quest gelöscht.", "info");
                });
            } else if (e.target.closest('.focus-btn')) {
                this.focusedQuestId = questId;
                const today = new Date();
                today.setHours(23, 59, 59, 999);
                const deadline = Timestamp.fromDate(today);
                await updateDoc(doc(this.db, 'todos', questId), { deadline: deadline });
                this._renderMyQuests();
                this._renderFocusQuest();
                this.myQuestsModal.classList.add('hidden');
            } else if (e.target.closest('.today-btn')) {
                const today = new Date();
                today.setHours(23, 59, 59, 999);
                const deadline = Timestamp.fromDate(today);
                await updateDoc(doc(this.db, 'todos', questId), { deadline: deadline });
                this.showNotification("Quest auf heute datiert.", "success");
            } else if (e.target.closest('.edit-btn')) {
                this.editingQuestId = questId;
                const quest = this.localQuests.find(q => q.id === questId);
                this._populateEditModal(quest);
                this.editQuestModal.classList.remove('hidden');
            }
        });

        this.focusQuestContainer.addEventListener('click', async (e) => {
            const questId = e.target.closest('button[data-id]')?.dataset.id;
            if (!questId) return;

            if (e.target.closest('.stop-focus-btn')) {
                this.focusedQuestId = null;
                this._renderMyQuests();
                this._renderFocusQuest();
            } else if (e.target.closest('.complete-btn')) {
                await this._handleQuestCompletion(questId);
            } else if (e.target.closest('.focus-btn')) { // Für den Vorschlag
                this.focusedQuestId = questId;
                const today = new Date();
                today.setHours(23, 59, 59, 999);
                const deadline = Timestamp.fromDate(today);
                await updateDoc(doc(this.db, 'todos', questId), { deadline: deadline });
                this._renderMyQuests();
                this._renderFocusQuest();
                this.myQuestsModal.classList.add('hidden');
            }
        });

        this.questListFilters.addEventListener('click', e => {
            const filterBtn = e.target.closest('.quest-filter-btn');
            if (filterBtn) {
                this.questListFilters.querySelectorAll('.quest-filter-btn').forEach(btn => btn.classList.remove('active', 'bg-indigo-600'));
                filterBtn.classList.add('active', 'bg-indigo-600');
                this.currentQuestFilter = filterBtn.dataset.filter;
                this._renderMyQuests();
            }
        });

        // --- Edit Quest Modal Listeners (delegated from modal) ---
        this.editQuestModal.addEventListener('click', (e) => {
            if (e.target.closest('.modal-close-btn')) {
                this.editQuestModal.classList.add('hidden');
            } else if (e.target.closest('button[type="button"]')) {
                const questId = document.getElementById('edit-quest-id').value;
                const updatedData = {
                    text: document.getElementById('edit-quest-text').value,
                    details: document.getElementById('edit-quest-details').value,
                    priority: document.getElementById('edit-quest-priority').value,
                    deadline: document.getElementById('edit-quest-deadline').value ? Timestamp.fromDate(new Date(document.getElementById('edit-quest-deadline').value)) : null,
                    durationMinutes: parseInt(document.getElementById('edit-quest-duration').value, 10) || 0,
                    taskType: document.getElementById('edit-quest-type').value,
                    tags: [document.querySelector('#edit-quest-tags-container input:checked')?.value || this.availableTags[0]],
                    parentProjectId: document.getElementById('edit-quest-parent-project').value || null
                };
                this._handleUpdateQuest(questId, updatedData);
            }
        });

        this.questListFilters.addEventListener('change', e => {
            if (e.target.id === 'quest-sort-select') {
                this.currentQuestSort.field = e.target.value;
                this._renderMyQuests();
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
            const pomodoroContainer = document.getElementById('Bearbeitungsdauer-Pomodoro');
            const freeInputContainer = document.getElementById('Bearbeitungsdauer-Frei');
            const isPomodoroVisible = !pomodoroContainer.classList.contains('hidden');
            
            pomodoroContainer.classList.toggle('hidden', isPomodoroVisible);
            freeInputContainer.classList.toggle('hidden', !isPomodoroVisible);
            e.target.textContent = isPomodoroVisible ? 'Button-Eingabe' : 'Manuelle Eingabe';
            this._validateCurrentQuestStep();
        });

        this.todoRepeatCheckbox.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            document.getElementById('todo-repeat-options-container').classList.toggle('hidden', !isChecked);
            document.getElementById('deadline-container').style.display = isChecked ? 'none' : 'block';
            document.getElementById('priority-container').style.display = isChecked ? 'none' : 'block';
            if (isChecked) {
                 this.todoPriorityInput.value = 'Leicht';
            }
            this._validateCurrentQuestStep();
        });
    }

    _renderQuestWizardProgress() {
        this.questWizardProgress.innerHTML = '';
        for (let i = 1; i <= this.questWizardSteps.length; i++) {
            const dot = document.createElement('div');
            dot.className = 'wizard-progress-dot';
            if (i <= this.currentQuestStep) {
                dot.classList.add('active');
            }
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
        
        if (!hourMatch && !minuteMatch && numberOnlyMatch) {
            totalMinutes = parseInt(numberOnlyMatch[1], 10);
        }
        
        return totalMinutes;
    }

    _validateCurrentQuestStep() {
        let isValid = false;
        const isDaily = this.todoRepeatCheckbox.checked;
        const taskType = this.todoTaskTypeInput.value;
        
        switch(this.currentQuestStep) {
            case 1:
                isValid = true;
                break;
            case 2: isValid = this.todoInput.value.trim() !== ''; break;
            case 3:
                if (taskType === 'Projekt') {
                    isValid = document.getElementById('project-duration-days').value > 0;
                } else {
                    const isFreeMode = !document.getElementById('Bearbeitungsdauer-Frei').classList.contains('hidden');
                    if (isFreeMode) {
                        isValid = this._parseDuration(document.getElementById('quest-duration-free-input').value) > 0;
                    } else {
                        isValid = this.newQuestDuration > 0;
                    }
                }
                break;
            case 4:
                if (taskType === 'Projekt') isValid = document.getElementById('project-start-date').value !== '';
                else isValid = isDaily ? this.todoStartTimeInput.value !== '' : this.todoDeadlineInput.value !== '';
                break;
            case 5: isValid = !!this.todoTagsContainer.querySelector('input:checked'); break;
            default: isValid = false;
        }
        this.questNextBtn.disabled = !isValid;
    }

    _showQuestStep(step) {
        this.questWizardSteps.forEach(s => s.classList.add('hidden'));
        document.getElementById(`quest-step-${step}`).classList.remove('hidden');
        
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
        let result = '';
        if (hours > 0) result += `${hours}h `;
        if (minutes > 0) result += `${minutes}m`;
        return result.trim();
    }

    _resetQuestWizard() {
        this.addTodoForm.reset();
        this.editingQuestId = null;
        this.currentQuestStep = 1;
        this.newQuestDuration = 0;
        document.getElementById('quest-duration-display').textContent = this._formatDuration(0);
        this.todoTagsContainer.querySelector('input').checked = true;
        
        document.getElementById('priority-container').style.display = 'block';
        document.getElementById('deadline-container').style.display = 'block';
        document.getElementById('todo-repeat-options-container').classList.add('hidden');
        this.todoPriorityInput.value = 'Mittel';
        document.getElementById('project-start-date').valueAsDate = new Date();
        
        document.getElementById('Bearbeitungsdauer-Pomodoro').classList.remove('hidden');
        document.getElementById('Bearbeitungsdauer-Frei').classList.add('hidden');
        document.getElementById('duration-mode-toggle').textContent = 'Manuelle Eingabe';

        this.questSubmitBtn.textContent = 'Quest Hinzufügen';
        this._showQuestStep(1);
    }

    _populateParentProjectDropdown() {
        const projects = this.localQuests.filter(q => q.taskType === 'Projekt');
        this.todoParentProjectInput.innerHTML = '<option value="">Kein Projekt ausgewählt</option>';
        projects.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = p.text;
            this.todoParentProjectInput.appendChild(option);
        });
    }

    _handleEditQuestTypeChange() {
        const type = document.getElementById('edit-quest-type').value;
        const parentProjectContainer = document.getElementById('edit-quest-parent-project-container');
        parentProjectContainer.classList.toggle('hidden', type !== 'Projektaufgabe');
    }

    _populateEditModal(quest) {
        if (!quest) return;
        document.getElementById('edit-quest-id').value = quest.id;
        document.getElementById('edit-quest-text').value = quest.text || '';
        document.getElementById('edit-quest-details').value = quest.details || '';
        
        const prioritySelect = document.getElementById('edit-quest-priority');
        prioritySelect.innerHTML = '';
        ['Leicht', 'Mittel', 'Schwer'].forEach(p => {
            const option = document.createElement('option');
            option.value = p;
            option.textContent = p;
            if (p === quest.priority) option.selected = true;
            prioritySelect.appendChild(option);
        });

        document.getElementById('edit-quest-duration').value = quest.durationMinutes || 0;
        document.getElementById('edit-quest-deadline').valueAsDate = quest.deadline ? quest.deadline.toDate() : null;
        document.getElementById('edit-quest-type').value = quest.taskType || 'Aufgabe';

        // Populate and set parent project
        const parentProjectSelect = document.getElementById('edit-quest-parent-project');
        const projects = this.localQuests.filter(q => q.taskType === 'Projekt');
        parentProjectSelect.innerHTML = '<option value="">Kein Projekt</option>';
        projects.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = p.text;
            if (p.id === quest.parentProjectId) option.selected = true;
            parentProjectSelect.appendChild(option);
        });
        this._handleEditQuestTypeChange();

        // Populate and set tags
        const tagsContainer = document.getElementById('edit-quest-tags-container');
        tagsContainer.innerHTML = '';
        this.availableTags.forEach(tag => {
            const isChecked = (quest.tags || []).includes(tag);
            tagsContainer.innerHTML += `
                <label class="flex items-center gap-2 cursor-pointer"><input type="radio" name="edit-quest-tag" value="${tag}" class="form-radio bg-gray-700 border-gray-600 text-indigo-500" ${isChecked ? 'checked' : ''}>${tag}</label>
            `;
        });
    }

    async _handleUpdateQuest(questId, data) {
        await updateDoc(doc(this.db, 'todos', questId), data);
        this.showNotification("Quest erfolgreich aktualisiert.", "success");
        this.editQuestModal.classList.add('hidden');
    }
}