import { doc, updateDoc, deleteField, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

export class PetManager {
    constructor(db, showNotificationCallback, config) {
        this.db = db;
        this.showNotification = showNotificationCallback;
        this.rarityTiers = config.rarityTiers;
        this.rarityColors = config.rarityColors;

        // DOM-Elemente
        this.modal = document.getElementById('div-3200');
        this.openBtn = document.getElementById('menu-btn-pets');
        this.closeBtn = this.modal.querySelector('.modal-close-btn');
        this.inventoryList = document.getElementById('div-3212');
        this.detailsView = document.getElementById('div-3220');
        this.pagePrevBtn = document.getElementById('pets-page-prev');
        this.pageNextBtn = document.getElementById('pets-page-next');
        this.pageInfo = document.getElementById('pets-page-info');
        this.filterElement = document.getElementById('pet-filter-element');
        this.filterRarity = document.getElementById('pet-filter-rarity');
        this.activePetsSidebar = document.getElementById('div-2120');

        // Zustand
        this.currentUser = null;
        this.userProfile = null;
        this.currentPage = 1;
        this.itemsPerPage = 8;
        this.selectedInventoryPetId = null;
        this.comparedActivePetSlotIndex = 0;
        this.filters = { element: 'all', rarity: 'all' };

    }

    updateUserData(user, userProfile) {
        this.currentUser = user;
        this.userProfile = userProfile;
        this.renderActivePetsSidebar();

        if (!this.modal.classList.contains('hidden')) {
            this.render();
        }
    }

    render() {
        if (!this.userProfile) return;
        this._renderPetInventoryList();
        this._renderPetDetailsView();
    }

    renderActivePetsSidebar() {
        if (!this.activePetsSidebar || !this.userProfile) return;
        this.activePetsSidebar.innerHTML = '';
        const allPets = this.userProfile.pets || {};
        const activePetIds = this.userProfile.activePets || [];

        for (let i = 0; i < 3; i++) {
            const petId = activePetIds[i];
            if (petId && allPets[petId]) {
                const pet = allPets[petId];
                const petEl = document.createElement('div');
                petEl.className = 'w-8 h-8 flex items-center justify-center bg-gray-700 rounded-full border-2 border-purple-500';
                petEl.innerHTML = `<span class="text-lg" title="${pet.name} (Lvl ${pet.level})">${pet.icon}</span>`;
                this.activePetsSidebar.appendChild(petEl);
            } else {
                const slotEl = document.createElement('div');
                slotEl.className = 'w-8 h-8 bg-gray-900 rounded-full border-2 border-gray-600';
                this.activePetsSidebar.appendChild(slotEl);
            }
        }
    }

    _renderPetInventoryList() {
        const allPets = Object.values(this.userProfile.pets || {});
        const activePetIds = this.userProfile.activePets || [];

        const filteredPets = allPets.filter(pet => {
            const elementMatch = this.filters.element === 'all' || pet.element === this.filters.element;
            const rarityMatch = this.filters.rarity === 'all' || pet.rarity === this.filters.rarity;
            const isNotActive = !activePetIds.includes(pet.docId);
            return elementMatch && rarityMatch && isNotActive;
        });

        const totalPages = Math.max(1, Math.ceil(filteredPets.length / this.itemsPerPage));
        this.currentPage = Math.min(this.currentPage, totalPages);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const itemsToShow = filteredPets.slice(startIndex, startIndex + this.itemsPerPage);

        this.inventoryList.innerHTML = '';
        itemsToShow.forEach(pet => {
            const petEl = document.createElement('div');
            const borderColor = this.rarityColors[pet.rarity] || 'border-gray-500';
            const isSelected = this.selectedInventoryPetId === pet.docId;
            petEl.className = `p-2 border-2 rounded-lg flex items-center gap-3 cursor-pointer transition ${borderColor} ${isSelected ? 'bg-blue-800' : 'hover:bg-gray-700'}`;
            petEl.dataset.petId = pet.docId;

            const rarity = this.rarityTiers[pet.rarity] || this.rarityTiers.common;
            petEl.innerHTML = `
                <span class="text-3xl">${pet.icon}</span>
                <div>
                    <p class="font-bold ${rarity.color}">${pet.name}</p>
                    <p class="text-xs text-gray-400">Lvl ${pet.level} - ${pet.element}</p>
                </div>
            `;
            this.inventoryList.appendChild(petEl);
        });

        this.pageInfo.textContent = `Seite ${this.currentPage} / ${totalPages}`;
        this.pagePrevBtn.disabled = this.currentPage === 1;
        this.pageNextBtn.disabled = this.currentPage >= totalPages;
    }

    _renderPetDetailsView() {
        this.detailsView.innerHTML = '';
        const allPets = this.userProfile.pets || {};
        const activePetIds = this.userProfile.activePets || [];
        let petToDisplay = null;
        let petToCompare = null;
        let viewMode = 'active';

        if (this.selectedInventoryPetId) {
            viewMode = 'compare';
            petToCompare = allPets[this.selectedInventoryPetId];
            if (activePetIds.length > 0) {
                const activePetId = activePetIds[this.comparedActivePetSlotIndex];
                petToDisplay = allPets[activePetId];
            }
        } else if (activePetIds.length > 0) {
            const activePetId = activePetIds[this.comparedActivePetSlotIndex];
            petToDisplay = allPets[activePetId];
        }

        if (!petToDisplay && !petToCompare) {
            this.detailsView.innerHTML = '<p class="text-center text-gray-400 m-auto">Kein Pet ausgewählt oder aktiv.</p>';
            return;
        }

        let html = `<div class="flex-grow flex flex-col"><div class="flex-grow flex gap-4 relative">`;
        if (viewMode === 'compare' && petToCompare) {
            // Vergleichsansicht: Auswahl links, Aktives Pet rechts
            html += this._generatePetDetailColumn(petToCompare, 'Auswahl', petToDisplay);
            html += petToDisplay ? this._generatePetDetailColumn(petToDisplay, `Aktiv (Slot ${this.comparedActivePetSlotIndex + 1})`, petToCompare) : this._generatePetDetailColumn(null, `Leerer Slot ${this.comparedActivePetSlotIndex + 1}`);
        } else {
            // Nur-Aktiv-Ansicht: Aktives Pet rechts
            html += `<div class="flex-1"></div>`; // Leere linke Spalte
            html += this._generatePetDetailColumn(petToDisplay, `Aktiv (Slot ${this.comparedActivePetSlotIndex + 1})`);
        }
        html += `</div>`;

        // Navigationspfeile für aktive Pets, immer rechts positioniert
        if (activePetIds.length > 1) {
            html += `<div class="absolute top-1/2 -translate-y-1/2 right-2"><button id="next-active-pet-btn" class="text-lg bg-gray-600 hover:bg-gray-500 p-2 rounded-full leading-none">&gt;&gt;</button></div>`;
        }

        html += `<div class="mt-4 flex-shrink-0 grid grid-cols-2 gap-4 border-t border-gray-700 pt-3">`;
        if (viewMode === 'compare' && petToCompare) {
            html += `<div class="flex flex-col gap-2"><button data-action="release-pet" data-pet-id="${petToCompare.docId}" class="text-sm bg-red-800 hover:bg-red-700 rounded px-3 py-1">Freilassen</button></div>`;
            html += `<div class="flex flex-col gap-2"><button data-action="swap-pet" class="text-sm bg-green-600 hover:bg-green-500 rounded px-3 py-1">Mitnehmen</button>${petToDisplay ? `<button data-action="unequip-pet" data-pet-id="${petToDisplay.docId}" class="text-sm bg-yellow-600 hover:bg-yellow-500 rounded px-3 py-1">Ablegen</button>` : ''}</div>`;
        } else if (petToDisplay) {
            html += `<div></div>`; // Leere linke Spalte für Buttons
            html += `<div class="flex flex-col gap-2"><button data-action="unequip-pet" data-pet-id="${petToDisplay.docId}" class="text-sm bg-yellow-600 hover:bg-yellow-500 rounded px-3 py-1">Ablegen</button></div>`;
        }
        html += `</div></div>`;

        this.detailsView.innerHTML = html;
    }

    _generatePetDetailColumn(pet, title, comparePet = null) {
        if (!pet) return `<div class="flex-1 text-center p-4"><h4 class="text-lg font-bold text-gray-500 mb-2">${title}</h4><div class="text-6xl p-4">?</div><p class="text-gray-500">Nichts ausgerüstet</p></div>`;

        const rarity = this.rarityTiers[pet.rarity] || this.rarityTiers.common;
        const petStats = pet.currentStats || pet.baseStats || {};
        const elementIcons = { 'Erde': '🪨', 'Wasser': '💧', 'Schatten': '🌑', 'Feuer': '🔥', 'Elektro': '⚡️', 'Eis': '❄️', 'Dunkel': '🌑' };
        const skillIcons = {
            'Steinschlag': '🪨', 'Härtner': '🛡️', 'Einigeln': '🔄',
            'Tackle': '💥', 'Funkenschlag': '⚡️', 'Donnerwelle': '🌊',
            'Glut': '🔥', 'Feuerwirbel': '🌪️', 'Rauchwolke': '💨',
            'Eissplitter': '❄️', 'Froststrahl': '🥶', 'Nebel': '🌫️',
            'Schattenstoß': '🌑', 'Dunkelklaue': '🐾', 'Verfolgung': '👀'
        };
        const compareStats = comparePet?.currentStats || comparePet?.baseStats || {};
        const allStatKeys = new Set([...Object.keys(petStats), ...Object.keys(compareStats)]);

        let bonusesHtml = '';
        for (const stat of allStatKeys) {
            const petVal = petStats[stat] || 0;
            let colorClass = comparePet ? (petVal > (compareStats[stat] || 0) ? 'text-green-400' : (petVal < (compareStats[stat] || 0) ? 'text-red-400' : 'text-gray-300')) : 'text-green-400';
            if (typeof petStats[stat] !== 'undefined') {
                bonusesHtml += `<li><span class="capitalize">${stat}:</span> <span class="font-bold ${colorClass}">${petVal}</span></li>`;
            }
        }

        const xpPercentage = pet.maxXp > 0 ? (pet.xp / pet.maxXp) * 100 : 0;
        const skillsHtml = (pet.skills || []).map(skill => `<span title="${skill}">${skillIcons[skill] || '❓'}</span>`).join(' ');

        return `
            <div class="flex-1 text-center p-2 flex flex-col">
                ${title ? `<h4 class="text-lg font-bold text-gray-400 mb-2">${title}</h4>` : ''}
                <div class="text-8xl">${pet.icon}</div>
                <h3 class="text-xl font-bold mt-2 ${rarity.color}">${pet.name}</h3>
                <p class="text-sm text-gray-400">Level ${pet.level} ${rarity.name} - ${pet.element}</p>
                <div class="w-full bg-gray-700 rounded-full h-1.5 my-2 border border-gray-600">
                    <div class="bg-yellow-400 h-full rounded-full" style="width: ${xpPercentage}%" title="${pet.xp} / ${pet.maxXp} XP"></div>
                </div>
                <ul class="text-left mt-2 text-sm space-y-1 bg-gray-800 p-3 rounded-lg flex-grow">${bonusesHtml || '<li class="text-gray-400">Keine Boni</li>'}</ul>
                <div class="mt-3 bg-gray-800 p-2 rounded-lg flex justify-around items-center text-xl">
                    <span title="Element: ${pet.element}">${elementIcons[pet.element] || '❓'}</span>
                    <div class="flex gap-2" title="Fähigkeiten">${skillsHtml}</div>
                </div>
            </div>
        `;
    }

    async _swapPet() {
        if (!this.currentUser || !this.selectedInventoryPetId) return;
        const userDocRef = doc(this.db, 'users', this.currentUser.uid);
        let activePets = [...(this.userProfile.activePets || [])];
        if (activePets.length < 3) {
            activePets.push(this.selectedInventoryPetId);
        } else {
            activePets[this.comparedActivePetSlotIndex] = this.selectedInventoryPetId;
        }
        await updateDoc(userDocRef, { activePets });
        this.selectedInventoryPetId = null;
        this.comparedActivePetSlotIndex = 0;
        this.showNotification("Pet ausgetauscht!", "success");
    }

    async _unequipPet(petId) {
        if (!this.currentUser) return;
        await updateDoc(doc(this.db, 'users', this.currentUser.uid), { activePets: arrayRemove(petId) });
        this.selectedInventoryPetId = null;
        this.comparedActivePetSlotIndex = 0;
        this.showNotification("Pet abgelegt.", "info");
    }

    _attachEventListeners() {
        this.openBtn.addEventListener('click', () => {
            this.selectedInventoryPetId = null;
            this.comparedActivePetSlotIndex = 0;
            this.render();
            this.modal.classList.remove('hidden');
        });

        this.closeBtn.addEventListener('click', () => this.modal.classList.add('hidden'));

        this.inventoryList.addEventListener('click', e => {
            const petEl = e.target.closest('[data-pet-id]');
            if (petEl) {
                this.selectedInventoryPetId = petEl.dataset.petId;
                this.comparedActivePetSlotIndex = 0;
                this.render();
            }
        });

        this.detailsView.addEventListener('click', async e => {
            const button = e.target.closest('button');
            if (!button) return;

            if (button.id === 'next-active-pet-btn') {
                const activeCount = this.userProfile.activePets?.length || 0;
                if (activeCount > 0) {
                    this.comparedActivePetSlotIndex = (this.comparedActivePetSlotIndex + 1) % activeCount;
                    this.render();
                }
                return;
            }

            const { action, petId } = button.dataset;
            if (!action || !this.currentUser) return;

            if (action === 'swap-pet') await this._swapPet();
            if (action === 'unequip-pet') await this._unequipPet(petId);
            // Release-Logik wird später mit dem Delete-Confirmation-Modal verbunden
        });

        [this.filterElement, this.filterRarity].forEach(el => el.addEventListener('change', () => {
            this.filters.element = this.filterElement.value;
            this.filters.rarity = this.filterRarity.value;
            this.currentPage = 1;
            this.render();
        }));

        this.pagePrevBtn.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.render();
            }
        });

        this.pageNextBtn.addEventListener('click', () => {
            const allPets = Object.values(this.userProfile.pets || {});
            const totalPages = Math.ceil(allPets.length / this.itemsPerPage);
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.render();
            }
        });
    }
}
