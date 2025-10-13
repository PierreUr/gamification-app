import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

export class AchievementManager {
    constructor(db, showNotificationCallback, config) {
        this.db = db;
        this.showNotification = showNotificationCallback;
        this.achievementDatabase = config.achievementDatabase;

        // DOM-Elemente
        this.modal = document.getElementById('achievements-modal');
        this.openBtn = document.getElementById('menu-btn-achievements');
        this.closeBtn = this.modal.querySelector('.modal-close-btn');
        this.listContainer = document.getElementById('achievements-list');
        this.iconsSelectionContainer = document.getElementById('achievement-icons-selection');

        // Zustand
        this.currentUser = null;
        this.userProfile = null;
    }

    updateUserData(user, userProfile) {
        this.currentUser = user;
        this.userProfile = userProfile;
        if (!this.modal.classList.contains('hidden')) {
            this.render();
        }
    }

    render() {
        if (!this.userProfile || !this.listContainer) return;

        this.listContainer.innerHTML = '';
        const userAchievements = this.userProfile.achievements || {};

        this.achievementDatabase.forEach(ach => {
            const isUnlocked = userAchievements[ach.id];
            const achEl = document.createElement('div');
            achEl.className = `p-3 rounded-lg flex items-center gap-4 border ${isUnlocked ? 'bg-green-900 border-green-700' : 'bg-gray-700 border-gray-600 opacity-60'}`;

            achEl.innerHTML = `
                <div class="text-4xl">${ach.icon}</div>
                <div>
                    <h4 class="font-bold">${ach.name}</h4>
                    <p class="text-sm text-gray-300">${ach.description}</p>
                    ${isUnlocked ? `<p class="text-xs text-green-400 font-bold mt-1">Freigeschaltet</p>` : ''}
                </div>
            `;
            this.listContainer.appendChild(achEl);
        });

        this._renderIconSelection();
    }

    _renderIconSelection() {
        this.iconsSelectionContainer.innerHTML = '';
        const unlockedAchievements = this.achievementDatabase.filter(ach => this.userProfile.achievements?.[ach.id]);
        const displayedAchievements = this.userProfile.displayedAchievements || [];

        unlockedAchievements.forEach(ach => {
            const iconEl = document.createElement('div');
            iconEl.className = 'achievement-icon-selector w-8 h-8 flex items-center justify-center text-lg bg-gray-600 rounded cursor-pointer';
            iconEl.textContent = ach.icon;
            iconEl.dataset.achievementId = ach.id;
            if (displayedAchievements.includes(ach.id)) {
                iconEl.classList.add('selected');
            }
            this.iconsSelectionContainer.appendChild(iconEl);
        });
    }

    async _toggleDisplayedIcon(achievementId) {
        if (!this.currentUser) return;

        let displayed = [...(this.userProfile.displayedAchievements || [])];
        if (displayed.includes(achievementId)) {
            displayed = displayed.filter(id => id !== achievementId);
        } else if (displayed.length < 3) {
            displayed.push(achievementId);
        } else {
            this.showNotification("Du kannst maximal 3 Erfolge anzeigen.", "info");
            return;
        }

        await updateDoc(doc(this.db, 'users', this.currentUser.uid), { displayedAchievements: displayed });
    }

    _attachEventListeners() {
        this.openBtn.addEventListener('click', () => {
            this.render();
            this.modal.classList.remove('hidden');
        });

        this.closeBtn.addEventListener('click', () => this.modal.classList.add('hidden'));

        this.iconsSelectionContainer.addEventListener('click', e => {
            const iconEl = e.target.closest('[data-achievement-id]');
            if (iconEl) this._toggleDisplayedIcon(iconEl.dataset.achievementId);
        });
    }
}