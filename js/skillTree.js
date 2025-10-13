/**
 * Skill Tree Manager
 * Handles all logic related to the skill tree modal.
 */
import { doc, updateDoc, increment, arrayUnion } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

export class SkillTreeManager {
    constructor(db, showNotificationCallback) {
        this.db = db;
        this.showNotification = showNotificationCallback;

        // DOM-Elemente
        this.modal = document.getElementById('skill-tree-modal');
        this.openBtn = document.getElementById('open-skills-btn');
        this.closeBtn = this.modal.querySelector('.modal-close-btn');
        this.resetBtn = document.getElementById('reset-skills-btn');
        this.listPanel = document.getElementById('skill-list-panel');
        this.detailPanel = document.getElementById('skill-detail-panel');
        this.skillPointsDisplay = document.getElementById('skill-points-display');

        // Zustand
        this.skillsData = [];
        this.selectedSkillId = null;
        this.currentUser = null;
        this.userProfile = null;

        this._loadSkillsData();
    }

    updateUserData(user, userProfile) {
        this.currentUser = user;
        this.userProfile = userProfile;
        // If the modal is open, re-render it with the new data
        if (!this.modal.classList.contains('hidden')) {
            this.render();
        }
    }

    render() {
        if (!this.userProfile || !this.modal) return;
        this._renderSkillListPanel();
        this._renderSkillDetailPanel();
    }

    _renderSkillListPanel() {
        if (!this.listPanel) return;
        this.listPanel.innerHTML = '';
        const learnedSkills = this.userProfile.skills || [];
        const availableSkillPoints = this.userProfile.skillPoints || 0;

        this.skillsData.forEach(skill => {
            const isUnlocked = learnedSkills.includes(skill.id);
            const dependenciesMet = skill.dependencies.every(depId => learnedSkills.includes(depId));
            const canLearn = !isUnlocked && this.userProfile.level >= skill.levelRequirement && availableSkillPoints >= skill.cost && dependenciesMet;

            const skillNode = document.createElement('div');
            skillNode.className = `skill-node ${isUnlocked ? 'skill-node--unlocked' : canLearn ? 'skill-node--learnable' : 'skill-node--locked'}`;
            if (skill.id === this.selectedSkillId) skillNode.classList.add('selected');
            skillNode.dataset.skillId = skill.id;
            skillNode.innerHTML = `<div class="skill-icon">${skill.icon || '❓'}</div><span class="text-sm font-semibold">${skill.name}</span>`;
            this.listPanel.appendChild(skillNode);
        });
    }

    _renderSkillDetailPanel() {
        if (!this.detailPanel) return;
        this.skillPointsDisplay.textContent = this.userProfile.skillPoints || 0;
        const skill = this.skillsData.find(s => s.id === this.selectedSkillId);

        if (!skill) {
            this.detailPanel.innerHTML = '<p class="text-center text-gray-400 m-auto">Wähle einen Skill aus der Liste aus.</p>';
            return;
        }

        const learnedSkills = this.userProfile.skills || [];
        const isUnlocked = learnedSkills.includes(skill.id);
        const dependenciesMet = skill.dependencies.every(depId => learnedSkills.includes(depId));
        const levelMet = this.userProfile.level >= skill.levelRequirement;
        const pointsMet = (this.userProfile.skillPoints || 0) >= skill.cost;
        const canLearn = !isUnlocked && dependenciesMet && levelMet && pointsMet;

        const requirementsHtml = `
            <ul class="text-sm text-gray-400 mt-4 space-y-1">
                <li class="${pointsMet ? 'text-green-400' : 'text-red-400'}">Kosten: ${skill.cost} Punkt(e)</li>
                <li class="${levelMet ? 'text-green-400' : 'text-red-400'}">Benötigtes Level: ${skill.levelRequirement}</li>
                ${skill.dependencies.length > 0 ? `<li class="${dependenciesMet ? 'text-green-400' : 'text-red-400'}">Benötigt: ${skill.dependencies.map(depId => this.skillsData.find(s => s.id === depId)?.name || 'Unbekannt').join(', ')}</li>` : ''}
            </ul>`;

        this.detailPanel.innerHTML = `
            <div class="text-center"><span class="text-6xl">${skill.icon || '❓'}</span><h3 class="text-2xl font-bold mt-2">${skill.name}</h3></div>
            <p class="text-gray-300 mt-4 text-center">${skill.description}</p>
            <div class="mt-auto pt-4 border-t border-gray-600">
                <h4 class="font-semibold text-gray-200 mb-2">Voraussetzungen</h4>
                ${requirementsHtml}
                <button id="learn-skill-btn" data-skill-id="${skill.id}" class="w-full mt-4 py-2 px-4 font-bold rounded-lg transition-colors ${canLearn ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-600 cursor-not-allowed'}" ${canLearn && !isUnlocked ? '' : 'disabled'}>
                    ${isUnlocked ? 'Bereits erlernt' : 'Skill erlernen'}
                </button>
            </div>`;
    }

    async _learnSkill(skillId) {
        if (!this.currentUser || !skillId) return;
        const skill = this.skillsData.find(s => s.id === skillId);
        if (!skill) return;

        // Re-validate just before database write
        const canLearn = !(this.userProfile.skills || []).includes(skill.id) && skill.dependencies.every(depId => (this.userProfile.skills || []).includes(depId)) && this.userProfile.level >= skill.levelRequirement && (this.userProfile.skillPoints || 0) >= skill.cost;
        if (!canLearn) { this.showNotification("Voraussetzungen nicht erfüllt.", "error"); return; }

        try {
            const userDocRef = doc(this.db, 'users', this.currentUser.uid);
            await updateDoc(userDocRef, { skills: arrayUnion(skillId), skillPoints: increment(-skill.cost) });
            this.showNotification(`Skill "${skill.name}" erlernt!`, "success");
        } catch (error) {
            console.error("Error learning skill:", error);
            this.showNotification("Fehler beim Erlernen des Skills.", "error");
        }
    }

    _loadSkillsData() {
        try {
            const dataEl = document.getElementById('skills-data');
            if (dataEl) this.skillsData = JSON.parse(dataEl.textContent);
        } catch (e) { console.error("Failed to parse skills data:", e); }
    }

    _attachEventListeners() {
        this.openBtn.addEventListener('click', () => {
            if (this.skillsData.length > 0 && !this.selectedSkillId) {
                this.selectedSkillId = this.skillsData[0].id;
            }
            this.render();
            this.modal.classList.remove('hidden');
        });
        this.closeBtn.addEventListener('click', () => this.modal.classList.add('hidden'));
        this.listPanel.addEventListener('click', (e) => {
            const skillNode = e.target.closest('.skill-node');
            if (skillNode) {
                this.selectedSkillId = skillNode.dataset.skillId;
                this.render();
            }
        });
        this.detailPanel.addEventListener('click', (e) => {
            const learnBtn = e.target.closest('#learn-skill-btn');
            if (learnBtn && !learnBtn.disabled) {
                this._learnSkill(learnBtn.dataset.skillId);
            }
        });
        this.resetBtn.addEventListener('click', async () => {
            if (!this.currentUser) return;
            const skillPointsToRestore = (this.userProfile.level || 1) - 1;
            try {
                await updateDoc(doc(this.db, 'users', this.currentUser.uid), { skills: [], skillPoints: skillPointsToRestore });
                this.showNotification("Alle Skills zurückgesetzt.", "info");
            } catch (error) {
                console.error("Error resetting skills:", error);
                this.showNotification("Fehler beim Zurücksetzen.", "error");
            }
        });
    }
}