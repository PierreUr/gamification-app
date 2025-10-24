import { collection, query, where, onSnapshot, addDoc, serverTimestamp, Timestamp, deleteDoc, updateDoc, doc, increment, writeBatch, getDocs } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { GanttManager } from './ganttManager.js'; // Path remains the same
import { QuestListManager } from './questListManager.js';
import { QuestWizardManager } from './questWizardManager.js';
import { formatDuration } from './utils.js';

export class QuestManager {
    constructor(db, showNotificationCallback, handleXpGainCallback, processQuestDropCallback, showDeleteConfirmCallback, ganttManager) {
        this.db = db;
        this.showNotification = showNotificationCallback;
        this.handleXpGain = handleXpGainCallback; // Callback for core game logic
        this.processQuestDrop = processQuestDropCallback;
        this.showDeleteConfirm = showDeleteConfirmCallback;
        this.timerManager = null;
        this.ganttManager = ganttManager;
        this.questListManager = new QuestListManager(db, showNotificationCallback, showDeleteConfirmCallback, this._handleQuestCompletion.bind(this), this._handleFocusRequest.bind(this), this._getXpForPriority.bind(this), this._openEditModal.bind(this));
        this.questWizardManager = new QuestWizardManager(['Arbeit', 'Privat', 'Lernen', 'Haushalt', 'Sport'], ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']);

        // Re-add availableTags for fallback logic in the edit modal
        this.availableTags = ['Arbeit', 'Privat', 'Lernen', 'Haushalt', 'Sport'];

        // State
        this.currentUser = null;
        this.userProfile = null;
        this.questsUnsubscribe = null;
        this.localQuests = [];
        this.focusedQuestId = null;
        this.editingQuestId = null;
        this.editingQuestDuration = 0;
        this.initialGanttLoad = true;
    }

    setTimerManager(timerManager) {
        this.timerManager = timerManager;
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
            this.localQuests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            this.questListManager.render(this.localQuests, this.focusedQuestId);
            this._renderFocusQuest();
            this.questWizardManager.populateParentProjectDropdown(this.localQuests);
            this.ganttManager.render(this.localQuests);
        });
    }

    _getXpForPriority(priority) {
        const xpMap = { 'Leicht': 10, 'Mittel': 25, 'Schwer': 50 };
        return xpMap[priority] || 0;
    }

    _renderFocusQuest() {
        // If a break is active, show the break timer instead of the quest timer
        if (this.timerManager && this.timerManager.isBreakActive) {
            this._renderBreakFocus();
            return;
        }

        this.focusQuestContainer.innerHTML = '';
        let quest = this.localQuests.find(q => q.id === this.focusedQuestId);

        if (!quest) {
            const sortedByDeadline = this.localQuests.filter(q => q.deadline).sort((a, b) => a.deadline.toMillis() - b.deadline.toMillis());
            const suggestion = sortedByDeadline.length > 0 ? sortedByDeadline[0] : null;
            this.focusQuestContainer.innerHTML = this._generateFocusSuggestionHTML(suggestion);
            return;
        }

        let displayDurationSeconds;
        // When a new quest is focused, prepare the timer in the timerManager
        if (this.timerManager) {
            // If a timer is already associated with this quest (running or paused), use its current time.
            if (this.timerManager.questTimer.questId === quest.id) {
                displayDurationSeconds = this.timerManager.questTimer.timeLeft;
            } else {
                // Otherwise, prepare a new timer with the full duration.
                this.timerManager.prepareQuestTimer(quest.id, quest.durationMinutes);
                displayDurationSeconds = quest.durationMinutes * 60;
            }
        }
        this.focusQuestContainer.innerHTML = this._generateFocusQuestHTML(quest, displayDurationSeconds);
    }

    _generateFocusQuestHTML(quest, displayDurationSeconds) {
        const priorityColors = { 'Leicht': 'text-green-500', 'Mittel': 'text-yellow-500', 'Schwer': 'text-red-500' };
        const currencyRewards = { 'Leicht': 5, 'Mittel': 15, 'Schwer': 30 };
        let bronzeGained = currencyRewards[quest.priority] || 0;
        const currencyRewardHtml = bronzeGained > 0 ? `<span class="flex items-center gap-1" title="${bronzeGained} Bronze">🥉<span class="text-orange-400">${bronzeGained}</span></span>` : '';
        const tagsHtml = (quest.tags || []).map(tag => `<span class="text-xs bg-gray-600 px-2 py-0.5 rounded-full">${tag}</span>`).join(' ');

        return `
            <h3 class="text-lg font-bold text-cyan-400 mb-2 border-b border-gray-600 pb-2 text-center">Fokus</h3>
            <div class="relative p-3 bg-gray-900 rounded-lg border-2 border-cyan-500 flex flex-col items-center gap-4">
                <div>
                    <p class="font-bold text-xl text-center">${quest.text}</p>
                    <div class="flex items-center justify-center gap-2 text-sm text-gray-400 mt-1">
                        <span class="font-bold ${priorityColors[quest.priority] || 'text-gray-400'}">${quest.priority}</span>
                        <span class="text-gray-600">|</span>
                        <span class="font-bold text-yellow-400">${this._getXpForPriority(quest.priority)} XP</span>
                        <span class="text-gray-600">|</span>
                        ${currencyRewardHtml}
                        <span class="text-gray-600">|</span>
                        <div class="flex items-center gap-2">
                            <span id="focus-quest-duration-display">🕒 ${quest.durationMinutes} Min</span>
                            <div class="flex gap-1 items-center">
                                <select id="duration-adjustment-select" class="bg-gray-700 text-white text-xs rounded-md p-0.5 border-gray-600 focus:ring-indigo-500 focus:border-indigo-500">
                                    <option value="25">25m</option>
                                    <option value="45">45m</option>
                                </select>
                                <button data-action="adjust-duration-select" data-id="${quest.id}" class="adjust-duration-btn bg-blue-800 hover:bg-blue-700 text-white font-bold text-xs px-2 py-0.5 rounded-full">+</button>
                            </div>
                        </div>
                        <span class="text-gray-600">|</span>
                        ${tagsHtml}
                    </div>
                </div>
                <!-- Timer Visualizer in the center -->
                <div class="relative w-48 h-48 bg-gray-800 border-2 border-gray-600 rounded-full overflow-hidden flex items-center justify-center my-4">
                    <div id="focus-timer-visual-fill" class="absolute bottom-0 left-0 w-full bg-emerald-500" style="height: 0%;"></div>
                    <div id="focus-timer-text-display" class="relative text-white text-center leading-none">${formatDuration(displayDurationSeconds, false, true)}</div>
                </div>
                <!-- Timer Controls at the bottom -->
                <div class="flex justify-center gap-4">
                    <button id="focus-timer-start-btn" class="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold text-lg">Start</button>
                    <button id="focus-timer-pause-btn" class="px-6 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg font-bold text-lg">Pause</button>
                </div>
                <div class="flex justify-center gap-2 text-xs mt-2">
                    <span class="text-gray-400">Setze Timer auf:</span>
                    <button data-action="set-timer" data-minutes="25" class="text-indigo-400 hover:underline">25m</button>
                    <button data-action="set-timer" data-minutes="45" class="text-indigo-400 hover:underline">45m</button>
                </div>
                <button data-id="${quest.id}" class="edit-btn absolute top-2 left-2 text-xs bg-yellow-600 hover:bg-yellow-500 p-1 rounded z-10" title="Bearbeiten">✏️</button>
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

    _renderBreakFocus() {
        if (!this.timerManager) return;

        const breakTimeLeft = this.timerManager.breakTimer.timeLeft;

        this.focusQuestContainer.innerHTML = `
            <h3 class="text-lg font-bold text-yellow-400 mb-2 border-b border-gray-600 pb-2 text-center">Pause</h3>
            <div class="relative p-3 bg-gray-900 rounded-lg border-2 border-yellow-500 flex flex-col items-center gap-4">
                <p class="text-xl">Aktive Pause</p>
                <div id="focus-timer-text-display" class="relative text-white text-center leading-none text-5xl font-mono my-8">${formatDuration(breakTimeLeft, false, true)}</div>
                <div class="flex justify-center gap-4 mb-2">
                    <button data-extend-break="5" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm">5 Min</button>
                    <button data-extend-break="10" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm">10 Min</button>
                    <button data-extend-break="30" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm">30 Min</button>
                </div>
            </div>`;
    }

    async _handleFocusRequest(questId) {
        this.focusedQuestId = questId;
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const deadline = Timestamp.fromDate(today);
        await updateDoc(doc(this.db, 'todos', questId), { deadline: deadline });
        this.questListManager.render(this.localQuests, this.focusedQuestId);
        this._renderFocusQuest();
    }

    async _handleQuestCompletion(questId) {
        const userId = this.currentUser.uid;
        if (!userId) return;

        const quest = this.localQuests.find(q => q.id === questId);
        if (!quest) return;

        const xpGained = this._getXpForPriority(quest.priority);
        const currencyRewards = { 'Leicht': 5, 'Mittel': 15, 'Schwer': 30 };
        let bronzeGained = currencyRewards[quest.priority] || 0;

        if (this.isSupabase) {
            const { error } = await this.db.from('todos').delete().match({ id: questId });
            if (error) {
                this.showNotification("Fehler beim Abschließen der Quest.", "error");
                console.error("Supabase delete error:", error);
                return;
            }
            // The rest (XP, currency, journal) should be handled by a trigger or RPC in Supabase for consistency.
            // For now, we call the XP gain function.
            if (this.handleXpGain) {
                await this.handleXpGain(userId, xpGained);
            }

        } else {
            // Firebase implementation
            if (quest.id === this.focusedQuestId) {
                this.focusedQuestId = null;
            }

            const journalRef = collection(this.db, 'users', userId, 'journal');
            const questRef = doc(this.db, 'todos', questId);

            const journalEntry = { ...quest, completedAt: serverTimestamp() };
            delete journalEntry.id;

            const batch = writeBatch(this.db);
            batch.set(doc(journalRef), journalEntry);
            batch.delete(questRef);

            batch.update(doc(this.db, 'users', userId), { questsCompleted: increment(1), 'currency.bronze': increment(bronzeGained) });
            await batch.commit();

            if (this.handleXpGain) {
                await this.handleXpGain(userId, xpGained);
            }
        }

        this.showNotification(`Quest "${quest.text}" abgeschlossen! +${xpGained} XP & +${bronzeGained} Bronze`, 'success');

        if (this.processQuestDrop) {
            this.processQuestDrop(quest, this.userProfile);
        }
    }

    _attachEventListeners() {
        // DOM Elements - Initialized here to ensure the DOM is ready. This must be done before any other listeners are attached.
        this.myQuestsModal = document.getElementById('div-1110');
        this.newQuestModal = document.getElementById('div-1120');
        this.editQuestModal = document.getElementById('div-1112');
        this.todoListContainer = document.getElementById('div-1115');
        this.addTodoForm = document.getElementById('add-todo-form'); // This ID is correct and unique
        this.focusQuestContainer = document.getElementById('div-4400');

        this.questListManager._attachEventListeners();
        this.questWizardManager._attachEventListeners();

        const newQuestBtn = document.getElementById('menu-btn-new-quest');

        // Listen for timer updates from the timerManager
        document.addEventListener('questTimerUpdate', (e) => {
            const { questId, timeLeft, totalDuration } = e.detail;
            this._updateFocusTimerDisplay(questId, timeLeft, totalDuration);
        });

        if (newQuestBtn) {
            newQuestBtn.addEventListener('click', () => {
                this.questWizardManager.reset();
                this.editingQuestId = null;
                this.newQuestModal.classList.remove('hidden');
            });
        }
        if (this.newQuestModal) {
            this.newQuestModal.querySelector('.modal-close-btn').addEventListener('click', () => this.newQuestModal.classList.add('hidden'));
        }

        const myQuestsBtn = document.getElementById('menu-btn-my-quests');
        if (myQuestsBtn) {
            myQuestsBtn.addEventListener('click', () => this.myQuestsModal.classList.remove('hidden'));
            this.myQuestsModal.querySelector('.modal-close-btn').addEventListener('click', () => this.myQuestsModal.classList.add('hidden'));
        }

        const simpleQuestModal = document.getElementById('div-1150');
        if (simpleQuestModal) {
            const simpleQuestBtn = document.getElementById('menu-btn-simple-quest');
            if(simpleQuestBtn) simpleQuestBtn.addEventListener('click', () => simpleQuestModal.classList.remove('hidden'));
            
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
        }

        this.addTodoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Fix: Sicherstellen, dass das Formular nur gesendet wird, wenn isValid true ist.
            // Der Submit-Button sollte durch den Wizard deaktiviert sein, aber ein Fallback-Check ist nötig.
            if (this.questWizardManager.questSubmitBtn.disabled) return; 

            const text = this.questWizardManager.todoInput.value.trim();
            const selectedTag = this.questWizardManager.todoTagsContainer.querySelector('input:checked')?.value;
            const isDaily = this.questWizardManager.todoRepeatCheckbox.checked;
            const taskType = this.questWizardManager.todoTaskTypeInput.value;
            const scheduledDateValue = document.getElementById('todo-scheduled-date').value;
            let scheduledAt = null;
            if (scheduledDateValue) {
                const date = new Date(scheduledDateValue);
                scheduledAt = Timestamp.fromDate(date);
            }
            const submitButton = this.questWizardManager.questSubmitBtn;

            if (!text || !selectedTag || !this.currentUser) {
                 this.showNotification("Bitte Titel und Tag ausfüllen.", "error"); return;
            }

            const newQuest = {
                userId: this.currentUser.uid,
                text: text,
                priority: isDaily ? 'Leicht' : this.questWizardManager.todoPriorityInput.value,
                details: this.questWizardManager.todoDetailsInput.value,
                taskType: taskType,
                tags: [selectedTag],
                createdAt: serverTimestamp(),
                isDaily: isDaily,
                repeatDays: Array.from(this.questWizardManager.todoRepeatDaysContainer.querySelectorAll('input:checked')).map(input => input.value),
                startTime: isDaily ? this.questWizardManager.todoStartTimeInput.value : null,
                durationMinutes: 0,
                scheduledAt: scheduledAt
            };
            newQuest.breaks = []; // Initialize breaks array

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
                // KORREKTUR: Zugriff auf die Instanzvariable des Wizards, nicht auf document.getElementById()
                const isFreeMode = this.questWizardManager.durationFreeContainer && !this.questWizardManager.durationFreeContainer.classList.contains('hidden');
                
                if (isFreeMode) {
                    durationInMinutes = this.questWizardManager._parseDuration(document.getElementById('quest-duration-free-input').value);
                } else {
                    durationInMinutes = this.questWizardManager.newQuestDuration;
                }

                // Pflichtprüfung für Dauer, wenn Deadline oder ScheduledAt gesetzt ist.
                if ((this.questWizardManager.todoDeadlineInput.value || scheduledDateValue) && durationInMinutes <= 0) {
                     this.showNotification("Dauer ist Pflicht, wenn ein Datum gesetzt ist.", "error"); return;
                }
                newQuest.durationMinutes = durationInMinutes;
                
                let deadline;
                
                if (this.questWizardManager.todoDeadlineInput.value) {
                    // Setzt die Gantt-Zeit basierend auf der Deadline (falls vorhanden)
                    const deadlineDate = new Date(this.questWizardManager.todoDeadlineInput.value);
                    newQuest.ganttScheduledAt = Timestamp.fromDate(deadlineDate);
                } else if (scheduledAt) {
                    // Setzt die Gantt-Zeit basierend auf dem geplanten Datum (falls vorhanden)
                    newQuest.ganttScheduledAt = scheduledAt;
                }
                
                if(isDaily) {
                    if (!this.questWizardManager.todoStartTimeInput.value) {
                         this.showNotification("Bitte eine Startzeit für die tägliche Quest angeben.", "error"); return;
                    }
                    // Tägliche Quests haben nur ein Platzhalter-Deadline-Datum
                    deadline = new Date();
                } else {
                     if (!this.questWizardManager.todoDeadlineInput.value) {
                         this.showNotification("Bitte eine Deadline angeben.", "error"); return;
                    }
                    deadline = new Date(this.questWizardManager.todoDeadlineInput.value);
                }
                deadline.setHours(23, 59, 59, 999);
                newQuest.deadline = Timestamp.fromDate(deadline);
            }

            if (newQuest.taskType === 'Projektaufgabe' && this.questWizardManager.todoParentProjectInput.value) {
                newQuest.parentProjectId = this.questWizardManager.todoParentProjectInput.value;
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

        if (this.focusQuestContainer) { this.focusQuestContainer.addEventListener('click', async (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            const questId = button.dataset.id;

            if (button.classList.contains('complete-btn') && questId) {
                await this._handleQuestCompletion(questId);
            } else if (button.classList.contains('focus-btn') && questId) { // Für den Vorschlag
                this.focusedQuestId = questId;
                const today = new Date();
                today.setHours(23, 59, 59, 999);
                const deadline = Timestamp.fromDate(today);
                await updateDoc(doc(this.db, 'todos', questId), { deadline: deadline }); // This will trigger re-render via onSnapshot
                this._renderFocusQuest();
            } else if (button.classList.contains('stop-focus-btn')) {
                const questIdToStop = button.dataset.id;
                this.focusedQuestId = null;
                if (this.timerManager && this.timerManager.isQuestTimerRunning(questIdToStop)) {
                    this.timerManager.stopQuestTimer();
                }
                this.questListManager.render(this.localQuests, this.focusedQuestId);
                this._renderFocusQuest();
            } else if (button.id === 'focus-timer-start-btn') {
                if (this.timerManager) {
                    this.timerManager.startQuestTimer();
                }
            } else if (button.id === 'focus-timer-pause-btn') {
                if (this.timerManager) {
                    this.timerManager.pauseQuestTimer();
                }
            } else if (button.classList.contains('edit-btn') && questId) {
                this._openEditModal(questId);
            }

            const extendBtn = button.closest('[data-extend-break]');
            if (extendBtn && this.timerManager) {
                this.timerManager.extendBreak(parseInt(extendBtn.dataset.extendBreak, 10));
            }

            if (button.dataset.action === 'adjust-duration-select') {
                const questIdToAdjust = button.dataset.id;
                const selectElement = document.getElementById('duration-adjustment-select');
                if (selectElement) {
                    const amount = parseInt(selectElement.value, 10);
                    await updateDoc(doc(this.db, 'todos', questIdToAdjust), { durationMinutes: increment(amount) });
                }
            }

            if (button.dataset.action === 'set-timer') {
                const minutes = parseInt(button.dataset.minutes, 10);
                this.timerManager.setQuestTimer(minutes * 60);
                this.showNotification(`Timer auf ${minutes} Minuten gesetzt.`, 'info');
            }
        });}

        if (this.editQuestModal) {
            this.editQuestModal.addEventListener('click', (e) => {
                if (e.target.closest('.modal-close-btn')) {
                    this.editQuestModal.classList.add('hidden');
                    return;
                }

                const durationBtn = e.target.closest('.edit-duration-btn');
                if (durationBtn) {
                    const change = durationBtn.dataset.durationChange;
                    if (change === 'reset') {
                        this.editingQuestDuration = 0;
                    } else {
                        this.editingQuestDuration += parseInt(change, 10);
                    }
                    const display = document.getElementById('edit-quest-duration-display');
                    if(display) display.textContent = formatDuration(this.editingQuestDuration * 60, true);
                    return;
                }

            });
            
            const editForm = document.getElementById('edit-quest-form');
            if (editForm) {
                editForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this._submitEditForm();
                });
            }
        }
    }
    
    async _handleUpdateQuest(questId, data) {
        const originalQuest = this.localQuests.find(q => q.id === questId);
        // If duration changes, invalidate and remove existing breaks.
        if (originalQuest && originalQuest.durationMinutes !== data.durationMinutes) {
            data.breaks = [];
            this.showNotification("Pausen wurden aufgrund der Daueränderung entfernt.", "info");
        }
        try {
            await updateDoc(doc(this.db, 'todos', questId), data);
            this.showNotification("Quest erfolgreich aktualisiert.", "success");
            this.editQuestModal.classList.add('hidden');
        } catch (error) {
            console.error("Fehler beim Aktualisieren der Quest:", error);
            this.showNotification("Fehler: Quest konnte nicht gespeichert werden.", "error");
        }
    }
    
    _submitEditForm() {
        const questId = document.getElementById('edit-quest-id').value;
        const originalQuest = this.localQuests.find(q => q.id === questId);
        this._handleUpdateQuest(questId, this._getEditFormData(originalQuest));
    }

    _openEditModal(questId) {
        this.editingQuestId = questId;
        const quest = this.localQuests.find(q => q.id === questId);
        if (!quest) return;
        this._populateEditModal(quest);
    }

    _populateEditModal(quest) {
        if (!quest) return;
        this.editingQuestDuration = quest.durationMinutes || 0;

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

        const durationInput = document.getElementById('edit-quest-duration');
        if (durationInput) {
            const container = durationInput.parentElement;
            container.innerHTML = `
                <label class="block text-sm font-medium text-gray-300 mb-1">Dauer</label>
                <div class="flex items-center gap-2">`
                    + `<span id="edit-quest-duration-display" class="text-lg font-semibold">${formatDuration(this.editingQuestDuration * 60, true)}</span>
                    <button type="button" data-duration-change="25" class="edit-duration-btn bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded">+25m</button>
                    <button type="button" data-duration-change="45" class="edit-duration-btn bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded">+45m</button>
                    <button type="button" data-duration-change="reset" class="edit-duration-btn bg-red-600 hover:bg-red-500 text-white font-bold py-1 px-3 rounded">Reset</button>
                </div>
            `;
        }

        document.getElementById('edit-quest-deadline').valueAsDate = quest.deadline ? quest.deadline.toDate() : null;
        document.getElementById('edit-quest-scheduled-date').valueAsDate = quest.ganttScheduledAt ? quest.ganttScheduledAt.toDate() : null;
        const typeSelect = document.getElementById('edit-quest-type');
        typeSelect.value = quest.taskType || 'Aufgabe';
        document.getElementById('edit-quest-color').value = quest.projectColor || '#8b5cf6'; // Default violet

        const parentProjectSelect = document.getElementById('edit-quest-parent-project');
        const projects = this.localQuests.filter(q => q.taskType === 'Projekt');
        parentProjectSelect.innerHTML = '<option value="">Kein Projekt</option>';
        this.editQuestModal.classList.remove('hidden');
        projects.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = p.text;
            if (p.id === quest.parentProjectId) option.selected = true;
            parentProjectSelect.appendChild(option);
        });
        this._handleEditQuestTypeChange();

        // Populate tags for the edit modal
        const tagsContainer = document.getElementById('edit-quest-tags-container');
        tagsContainer.innerHTML = '';
        this.availableTags.forEach(tag => {
            const isChecked = (quest.tags || []).includes(tag);
            tagsContainer.innerHTML += `
                <label class="flex items-center gap-2 cursor-pointer"><input type="radio" name="edit-quest-tag" value="${tag}" class="form-radio bg-gray-700 border-gray-600 text-indigo-500" ${isChecked ? 'checked' : ''}>${tag}</label>
            `;
        });
    }

    _handleEditQuestTypeChange() {
        // This method is now only relevant for the edit modal, which is still part of QuestManager
        const type = document.getElementById('edit-quest-type').value;
        const parentProjectContainer = document.getElementById('edit-quest-parent-project-container');
        parentProjectContainer.classList.toggle('hidden', type !== 'Projektaufgabe');
    }

    _getEditFormData(originalQuest) {
        return {
            text: document.getElementById('edit-quest-text').value,
            details: document.getElementById('edit-quest-details').value,
            priority: document.getElementById('edit-quest-priority').value,
            deadline: document.getElementById('edit-quest-deadline').value ? Timestamp.fromDate(new Date(document.getElementById('edit-quest-deadline').value)) : null,
            durationMinutes: this.editingQuestDuration,
            ganttScheduledAt: (() => {
                let newScheduledAt = null;
                const scheduledDateInput = document.getElementById('edit-quest-scheduled-date').value;
                if (scheduledDateInput) {
                    const selectedDate = new Date(scheduledDateInput);
                    const originalScheduledAtDate = originalQuest?.ganttScheduledAt?.toDate();
                    if (originalScheduledAtDate) {
                        selectedDate.setHours(originalScheduledAtDate.getHours(), originalScheduledAtDate.getMinutes(), originalScheduledAtDate.getSeconds(), originalScheduledAtDate.getMilliseconds());
                    } else {
                        selectedDate.setHours(0, 0, 0, 0);
                    }
                    newScheduledAt = Timestamp.fromDate(selectedDate);
                }
                return newScheduledAt;
            })(),
            taskType: document.getElementById('edit-quest-type').value,
            tags: [document.querySelector('#edit-quest-tags-container input:checked')?.value || this.availableTags[0]],
            parentProjectId: document.getElementById('edit-quest-parent-project').value || null,
            projectColor: document.getElementById('edit-quest-color').value
        };
    }

    _updateFocusTimerDisplay(questId, timeLeft, totalDuration) {
        if (questId !== this.focusedQuestId) return;

        const timerText = document.getElementById('focus-timer-text-display');
        const timerFill = document.getElementById('focus-timer-visual-fill');

        if (timerText) timerText.innerHTML = formatDuration(timeLeft, false, true);
        if (timerFill && totalDuration > 0) {
            const percentage = ((totalDuration - timeLeft) / totalDuration) * 100;
            timerFill.style.height = `${percentage}%`;
        }
    }
}
