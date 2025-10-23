import { doc, updateDoc, deleteDoc, Timestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { formatDuration } from './utils.js';

export class QuestListManager {
    constructor(db, showNotificationCallback, showDeleteConfirmCallback, handleCompletionCallback, handleFocusCallback, getXpForPriorityCallback, handleEditCallback) {
        this.db = db;
        this.showNotification = showNotificationCallback;
        this.showDeleteConfirm = showDeleteConfirmCallback;
        this.handleCompletion = handleCompletionCallback;
        this.handleFocus = handleFocusCallback;
        this.handleEdit = handleEditCallback;
        this.getXpForPriority = getXpForPriorityCallback;

        // State
        this.localQuests = [];
        this.focusedQuestId = null;
        this.currentQuestSort = { field: 'priority', direction: 'asc' };
        this.currentQuestFilter = 'all';
    }

    _attachEventListeners() {
        this.todoListContainer = document.getElementById('content-1110'); // Correct content ID
        this.questListFilters = document.getElementById('quest-list-filters');

        if (this.questListFilters) {
            this.questListFilters.addEventListener('change', e => {
                if (e.target.id === 'quest-sort-select') {
                    this.currentQuestSort.field = e.target.value;
                    this.render(this.localQuests, this.focusedQuestId);
                }
            });

            this.questListFilters.addEventListener('click', e => {
                const filterBtn = e.target.closest('.quest-filter-btn');
                if (filterBtn) {
                    this.questListFilters.querySelectorAll('.quest-filter-btn').forEach(btn => btn.classList.remove('active', 'bg-indigo-600'));
                    filterBtn.classList.add('active', 'bg-indigo-600');
                    this.currentQuestFilter = filterBtn.dataset.filter;
                    this.render(this.localQuests, this.focusedQuestId);
                }
            });
        }

        if (this.todoListContainer) {
            this.todoListContainer.addEventListener('click', async (e) => {
                const questId = e.target.closest('[data-quest-id]')?.dataset.questId;
                if (!questId) return;

                if (e.target.closest('.complete-btn')) {
                    this.handleCompletion(questId);
                } else if (e.target.closest('.delete-btn')) {
                    const quest = this.localQuests.find(q => q.id === questId);
                    const questName = quest ? `"${quest.text}"` : "diese Quest";
                    this.showDeleteConfirm(`Willst du ${questName} wirklich löschen?`, async () => {
                        await deleteDoc(doc(this.db, 'todos', questId));
                        this.showNotification("Quest gelöscht.", "info");
                    });
                } else if (e.target.closest('.focus-btn')) {
                    this.handleFocus(questId);
                } else if (e.target.closest('.today-btn')) {
                    const today = new Date();
                    today.setHours(23, 59, 59, 999);
                    const deadline = Timestamp.fromDate(today);
                    await updateDoc(doc(this.db, 'todos', questId), { deadline: deadline });
                    this.showNotification("Quest auf heute datiert.", "success");
                } else if (e.target.closest('.edit-btn')) {
                    this.handleEdit(questId);
                }
            });
        }
    }

    render(quests, focusedQuestId) {
        this.localQuests = quests;
        this.focusedQuestId = focusedQuestId;
        
        if (!this.todoListContainer) return;

        const questsToRender = this._applyQuestFiltersAndSort(this.localQuests.filter(q => q.id !== this.focusedQuestId));
        this.todoListContainer.innerHTML = '';

        if (questsToRender.length === 0) {
            this.todoListContainer.innerHTML = '<p class="text-gray-400 text-center">Keine Quests entsprechen den aktuellen Filtern.</p>';
            return;
        }

        questsToRender.forEach(todo => {
            const isDueToday = () => {
                const today = new Date();
                const isSameDate = (date) => {
                    if (!date) return false;
                    return date.getDate() === today.getDate() &&
                           date.getMonth() === today.getMonth() &&
                           date.getFullYear() === today.getFullYear();
                };
                return isSameDate(todo.deadline?.toDate()) || isSameDate(todo.scheduledAt?.toDate()) || isSameDate(todo.ganttScheduledAt?.toDate());
            };

            const todoEl = document.createElement('div');
            todoEl.className = 'grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 p-3 bg-gray-700 rounded-lg transition-all duration-300 hover:bg-gray-600';
            todoEl.dataset.questId = todo.id;

            let tagsHtml = (todo.tags || []).map(tag => `<span class="text-xs bg-gray-600 px-2 py-0.5 rounded-full">${tag}</span>`).join(' ');
            let scheduledHtml = '';
            if (todo.scheduledAt) {
                const scheduledDate = todo.scheduledAt.toDate().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
                scheduledHtml = `<span class="text-gray-600">|</span><span class="flex items-center gap-1" title="Geplant für ${scheduledDate}">🗓️<span class="text-purple-400">${scheduledDate}</span></span>`;
            }

            todoEl.innerHTML = `
                <button data-id="${todo.id}" class="complete-btn flex-shrink-0 w-6 h-6 border-2 border-gray-500 rounded-full transition-colors duration-300 hover:bg-green-500"></button>
                <div class="flex-grow">
                    <p class="font-bold">${todo.text}</p>
                    <div class="flex items-center gap-2 text-xs text-gray-400 mt-1">
                        <span class="font-bold text-yellow-400">${this.getXpForPriority(todo.priority)} XP</span>
                        <span class="text-gray-600">|</span>
                        ${this._getCurrencyForPriority(todo.priority)}`
                        + `${todo.durationMinutes > 0 ? `<span class="text-gray-600">|</span><span class="flex items-center gap-1" title="Dauer">🕒<span class="text-cyan-400">${formatDuration(todo.durationMinutes * 60, true)}</span></span>` : ''}
                        ${scheduledHtml}
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
                    <button data-id="${todo.id}" class="delete-btn text-gray-400 hover:text-red-500 font-bold text-xl" title="Löschen">&times;</button>
                </div>
            `;
            this.todoListContainer.appendChild(todoEl);
        });
    }

    _applyQuestFiltersAndSort(quests) {
        let filteredQuests = [...quests];

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
            weekEnd.setDate(weekEnd.getDate() + (7 - now.getDay()));
            filteredQuests = filteredQuests.filter(q => {
                if (!q.deadline) return false;
                const deadlineDate = q.deadline.toDate();
                return deadlineDate >= todayStart && deadlineDate <= weekEnd;
            });
        }

        filteredQuests.sort((a, b) => {
            const field = this.currentQuestSort.field;
            let valA, valB;

            if (field === 'priority') {
                const priorityOrder = { 'Schwer': 0, 'Mittel': 1, 'Leicht': 2 };
                valA = priorityOrder[a.priority];
                valB = priorityOrder[b.priority];
            } else if (field === 'xp') {
                valA = this.getXpForPriority(b.priority);
                valB = this.getXpForPriority(a.priority);
            } else if (field === 'createdAt') {
                valA = b.createdAt?.toMillis() || 0;
                valB = a.createdAt?.toMillis() || 0;
            } else {
                valA = a.text.toLowerCase();
                valB = b.text.toLowerCase();
            }

            if (valA < valB) return -1;
            if (valA > valB) return 1;
            return 0;
        });

        return filteredQuests;
    }

    _getCurrencyForPriority(priority) {
        const rewards = { 'Leicht': 5, 'Mittel': 15, 'Schwer': 30 };
        let bronze = rewards[priority] || 0;
        let html = '';
        if (bronze > 0) html += `<span class="flex items-center gap-1" title="${bronze} Bronze">🥉<span class="text-orange-400">${bronze}</span></span>`;
        return html;
    }
}