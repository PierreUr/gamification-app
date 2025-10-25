import { collection, query, where, onSnapshot, addDoc, serverTimestamp, Timestamp, deleteDoc, updateDoc, doc, increment, writeBatch, getDocs } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { formatDuration } from './utils.js';

export class QuestManager {
    constructor(db, showNotificationCallback, handleXpGainCallback, processQuestDropCallback, showDeleteConfirmCallback, ganttManager) {
        this.db = db;
        this.showNotification = showNotificationCallback;
        this.handleXpGain = handleXpGainCallback;
        this.processQuestDrop = processQuestDropCallback;
        this.showDeleteConfirm = showDeleteConfirmCallback;
        this.timerManager = null;
        this.ganttManager = ganttManager;

        this._initializeDOMElements();

        // State
        this.currentUser = null;
        this.userProfile = null;
        this.questsUnsubscribe = null;
        this.localQuests = [];
        this.focusedQuestId = null;
    }

    _initializeDOMElements() {
        this.myQuestsModal = document.getElementById('div-1110');
        this.questListContainer = document.getElementById('div-1115');
        this.questSortSelect = document.getElementById('quest-sort-select');
        this.questFilterButtons = document.querySelectorAll('#div-1114 .quest-filter-btn');
        this.questCountDisplay = document.getElementById('div-1102');
        this.focusQuestContainer = document.getElementById('div-4400');
        this.editQuestModal = document.getElementById('div-1112');
        this.editQuestForm = document.getElementById('edit-quest-form');
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
            this._renderMyQuests();
            this._renderFocusQuest();
            if (this.ganttManager) {
                this.ganttManager.render(this.localQuests);
            }
        });
    }

    _attachEventListeners() {
        if (this.questSortSelect) {
            this.questSortSelect.addEventListener('change', () => this._renderMyQuests());
        }
        if (this.questFilterButtons) {
            this.questFilterButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.questFilterButtons.forEach(b => b.classList.remove('active', 'bg-indigo-600'));
                    e.currentTarget.classList.add('active', 'bg-indigo-600');
                    this._renderMyQuests();
                });
            });
        }

        if (this.questListContainer) {
            this.questListContainer.addEventListener('click', (e) => {
                const button = e.target.closest('button');
                if (!button) return;

                const questId = button.dataset.id;
                if (button.classList.contains('focus-btn')) {
                    this._handleFocusRequest(questId);
                }
            });
        }
    }

    _renderMyQuests() {
        if (!this.questListContainer) return;

        const activeFilter = document.querySelector('#div-1114 .quest-filter-btn.active')?.dataset.filter || 'all';
        let filteredQuests = this.localQuests;

        if (activeFilter === 'dueToday') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const endOfToday = new Date();
            endOfToday.setHours(23, 59, 59, 999);
            filteredQuests = this.localQuests.filter(q => q.deadline && q.deadline.toDate() >= today && q.deadline.toDate() <= endOfToday);
        }

        if (filteredQuests.length === 0) {
            this.questListContainer.innerHTML = '<p class="text-gray-400 text-center">Keine Quests für diesen Filter gefunden.</p>';
            return;
        }

        this.questListContainer.innerHTML = filteredQuests.map(quest => this._createQuestItemHTML(quest)).join('');
    }

    _createQuestItemHTML(quest) {
        const isFocused = quest.id === this.focusedQuestId;
        const focusClass = isFocused ? 'border-cyan-400' : 'border-gray-700';
        const priorityColors = { 'Leicht': 'border-l-green-500', 'Mittel': 'border-l-yellow-500', 'Schwer': 'border-l-red-500' };
        const priorityClass = priorityColors[quest.priority] || 'border-l-gray-500';

        return `
            <div class="quest-item bg-gray-700 p-2 rounded-lg border ${focusClass} border-l-4 ${priorityClass} flex justify-between items-center text-sm">
                <span class="font-semibold">${quest.text}</span>
                <div class="flex items-center gap-2">
                    <button data-id="${quest.id}" class="focus-btn bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-1 px-2 rounded text-xs">Fokus</button>
                </div>
            </div>
        `;
    }

    _renderFocusQuest() {
        if (!this.focusQuestContainer) return;
        const quest = this.localQuests.find(q => q.id === this.focusedQuestId);
        if (quest) {
            this.focusQuestContainer.innerHTML = `
                <div id="focus-quest-container">
                    <h3 class="text-lg font-bold text-cyan-400 mb-2 border-b border-gray-600 pb-2 text-center">Fokus</h3>
                    <p class="font-bold text-xl text-center">${quest.text}</p>
                </div>
            `;
        } else {
            this.focusQuestContainer.innerHTML = '<div id="focus-quest-container"><p class="text-center text-gray-500 text-sm">Keine Quest im Fokus. Wähle eine Quest aus der Liste aus.</p></div>';
        }
    }

    async _handleFocusRequest(questId) {
        this.focusedQuestId = questId;
        this._renderMyQuests();
        this._renderFocusQuest();
    }

    async addTestQuestsForToday(count = 5) {
        if (!this.currentUser) {
            this.showNotification("Benutzer nicht angemeldet.", "error");
            return;
        }
        console.log(`Adding ${count} test quests for today...`);
        const today = new Date();
        const deadline = new Date();
        deadline.setHours(23, 59, 59, 999);

        for (let i = 0; i < count; i++) {
            const questData = {
                text: `Test Quest ${i + 1} (Heute)`,
                details: `Dies ist eine Test-Quest, die heute fällig ist.`,
                taskType: 'Aufgabe',
                tags: ['Test'],
                priority: 'Mittel',
                isDaily: false,
                deadline: Timestamp.fromDate(deadline),
                scheduledAt: Timestamp.fromDate(today),
                ganttScheduledAt: Timestamp.fromDate(today),
                durationMinutes: 30,
                createdAt: Timestamp.now(),
                status: 'new',
                userId: this.currentUser.uid,
            };
            try {
                await addDoc(collection(this.db, 'todos'), questData);
            } catch (error) {
                console.error("Error adding test quest: ", error);
                this.showNotification("Fehler beim Hinzufügen der Test-Quest.", "error");
                return; // Stop on first error
            }
        }
        this.showNotification(`${count} Test-Quests für heute hinzugefügt.`, 'success');
    }
}