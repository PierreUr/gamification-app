import { doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

export class AchievementManager {
    constructor(db, showNotificationCallback, config) {
        this.db = db;
        this.showNotification = showNotificationCallback;
        this.achievementDatabase = config.achievementDatabase;

        // DOM Elements
        this.modal = document.getElementById('div-2430');
        this.openBtn = document.getElementById('menu-btn-achievements');
        this.closeBtn = this.modal.querySelector('.modal-close-btn');
        this.listContainer = document.getElementById('div-2433');
        this.iconsSelectionContainer = document.getElementById('div-2435');

        // State
        this.currentUser = null;
        this.userProfile = null;
    }

    updateUserData(user, userProfile) {
        this.currentUser = user;
        this.userProfile = userProfile;
    }

    render() {
        if (!this.userProfile) return;

        this.listContainer.innerHTML = '';
        this.achievementDatabase.forEach(ach => {
            const isUnlocked = this.userProfile.achievements && this.userProfile.achievements[ach.id];
            const achEl = document.createElement('div');
            achEl.className = `p-3 rounded-lg flex items-center gap-4 border-2 ${isUnlocked ? 'bg-gray-700 border-yellow-500' : 'bg-gray-800 border-gray-600 opacity-60'}`;
            
            achEl.innerHTML = `
                <div class="text-4xl">${ach.icon}</div>
                <div>
                    <h4 class="font-bold ${isUnlocked ? 'text-yellow-400' : ''}">${ach.name}</h4>
                    <p class="text-sm text-gray-400">${ach.description}</p>
                    ${isUnlocked ? `<p class="text-xs text-green-400 font-semibold mt-1">Freigeschaltet</p>` : ''}
                </div>
            `;
            this.listContainer.appendChild(achEl);
        });

        this.renderIconSelection();
    }

    renderIconSelection() {
        this.iconsSelectionContainer.innerHTML = '';
        const unlockedAchievements = this.achievementDatabase.filter(ach => this.userProfile.achievements && this.userProfile.achievements[ach.id]);
        
        unlockedAchievements.forEach(ach => {
            const iconEl = document.createElement('div');
            const isDisplayed = (this.userProfile.displayedAchievements || []).includes(ach.id);
            iconEl.className = `achievement-icon-selector text-2xl p-1 rounded-md cursor-pointer ${isDisplayed ? 'selected' : ''}`;
            iconEl.textContent = ach.icon;
            iconEl.dataset.achievementId = ach.id;
            iconEl.title = ach.name;
            this.iconsSelectionContainer.appendChild(iconEl);
        });
    }

    async _toggleDisplayedAchievement(achievementId) {
        if (!this.currentUser) return;
        const userDocRef = doc(this.db, 'users', this.currentUser.uid);
        let displayed = [...(this.userProfile.displayedAchievements || [])];

        if (displayed.includes(achievementId)) {
            displayed = displayed.filter(id => id !== achievementId);
        } else {
            if (displayed.length < 3) {
                displayed.push(achievementId);
            } else {
                this.showNotification("Du kannst maximal 3 Erfolge anzeigen.", "info");
                return;
            }
        }
        await updateDoc(userDocRef, { displayedAchievements: displayed });
    }

    _attachEventListeners() {
        this.openBtn.addEventListener('click', () => {
            this.render();
            this.modal.classList.remove('hidden');
        });

        this.closeBtn.addEventListener('click', () => {
            this.modal.classList.add('hidden');
        });

        this.iconsSelectionContainer.addEventListener('click', e => {
            const iconEl = e.target.closest('.achievement-icon-selector');
            if (iconEl && iconEl.dataset.achievementId) {
                this._toggleDisplayedAchievement(iconEl.dataset.achievementId);
            }
        });
    }
}
