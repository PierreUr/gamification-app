import { doc, getDoc, updateDoc, deleteDoc, increment, runTransaction, arrayRemove, deleteField, collection, onSnapshot, query, setDoc, addDoc, where, getDocs } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

export class InventoryManager {
    constructor(db, showNotificationCallback, config, showDeleteConfirmCallback) {
        this.db = db;
        this.showNotification = showNotificationCallback;
        this.showDeleteConfirm = showDeleteConfirmCallback;
        this.rarityTiers = config.rarityTiers;

        // DOM Elements
        this.equipmentModal = document.getElementById('div-2410');
        this.inventoryModal = document.getElementById('div-2420');
        this.equipmentSlotsContainer = document.getElementById('div-2411');
        this.equipmentItemDetails = document.getElementById('div-2414');
        this.inventoryListContainer = document.getElementById('div-2421');
        this.inventoryItemDetails = document.getElementById('div-2425');
        this.hpPotionCountEl = document.getElementById('hp-potion-count');
        this.manaPotionCountEl = document.getElementById('mana-potion-count');
        this.unequipAllBtn = document.getElementById('unequip-all-btn');
        this.useHpPotionBtn = document.getElementById('use-hp-potion-btn');
        this.useManaPotionBtn = document.getElementById('use-mana-potion-btn');

        // Pagination and Sorting
        this.inventoryPagePrev = document.getElementById('inventory-page-prev');
        this.inventoryPageNext = document.getElementById('inventory-page-next');
        this.inventoryPageInfo = document.getElementById('inventory-page-info');
        this.inventorySortButtons = document.getElementById('div-2423');

        // Zustand
        this.currentUser = null;
        this.userProfile = null;
        this.allInventoryItems = [];
        this.inventoryUnsubscribe = null;
        this.inventoryCurrentPage = 1;
        this.inventoryItemsPerPage = 6;
        this.inventorySortCategory = 'all';
        this.defaultSlotTexts = {
            weapon1: 'Waffe 1', weapon2: 'Waffe 2', tool1: 'Werkzeug 1', tool2: 'Werkzeug 2',
            head: 'Kopf', amulet: 'Amulett', chest: 'Brust', bracers: 'Armschienen',
            hands: 'Hände', legs: 'Beine', feet: 'Füße', ring1: 'Ring 1', ring2: 'Ring 2'
        };

    }

    updateUserData(user, userProfile) {
        this.currentUser = user;
        this.userProfile = userProfile;

        if (user) {
            this.listenToInventory(user.uid);
        } else {
            if (this.inventoryUnsubscribe) this.inventoryUnsubscribe();
        }

        this.renderEquipmentSlots();

        if (userProfile.itemsToAddToInventory) {
            this.processInitialInventory(user.uid, userProfile.itemsToAddToInventory);
        }
    }

    listenToInventory(userId) {
        if (this.inventoryUnsubscribe) this.inventoryUnsubscribe();
        const inventoryQuery = query(collection(this.db, 'users', userId, 'inventory'));
        this.inventoryUnsubscribe = onSnapshot(inventoryQuery, (snapshot) => {
            this.allInventoryItems = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
            this.updatePotionCounts();
            if (!this.inventoryModal.classList.contains('hidden')) {
                this.renderInventoryPage();
            }
        });
    }

    updatePotionCounts() {
        const hpPotions = this.allInventoryItems.find(item => item.id === 'potion_hp_small');
        const manaPotions = this.allInventoryItems.find(item => item.id === 'potion_mana_small');
        this.hpPotionCountEl.textContent = hpPotions ? hpPotions.quantity : 0;
        this.manaPotionCountEl.textContent = manaPotions ? manaPotions.quantity : 0;
    }

    renderEquipmentSlots() {
        if (!this.userProfile || !this.equipmentSlotsContainer) return;
        this.equipmentSlotsContainer.querySelectorAll('.equipment-slot').forEach(slotEl => {
            const slotType = slotEl.dataset.slotType;
            const equippedItem = this.userProfile.equipment?.[slotType];
            if (equippedItem && equippedItem.id !== 'blocked_slot') {
                slotEl.innerHTML = `<span class="text-4xl" title="${equippedItem.name}">${equippedItem.icon}</span>`;
                slotEl.classList.remove('text-gray-400');
                slotEl.dataset.itemId = equippedItem.docId || equippedItem.id;
            } else if (equippedItem && equippedItem.id === 'blocked_slot') {
                slotEl.innerHTML = `<span>🚫</span>`;
                slotEl.classList.add('bg-gray-700', 'blocked');
                delete slotEl.dataset.itemId;
            } else {
                const defaultText = this.defaultSlotTexts[slotType] || 'Slot';
                slotEl.innerHTML = `<span>${defaultText}</span>`;
                slotEl.classList.add('text-gray-400');
                slotEl.classList.remove('bg-gray-700', 'blocked');
                delete slotEl.dataset.itemId;
            }
        });
    }

    renderInventoryPage() {
        let filteredItems;
        if (this.inventorySortCategory === 'all') {
            filteredItems = this.allInventoryItems;
        } else if (this.inventorySortCategory === 'accessory') {
            const accessorySlots = ['amulet', 'ring1', 'ring2', 'bracers'];
            filteredItems = this.allInventoryItems.filter(item => item.type === 'armor' && accessorySlots.includes(item.slot));
        } else {
            filteredItems = this.allInventoryItems.filter(item => item.type === this.inventorySortCategory);
        }

        const totalPages = Math.max(1, Math.ceil(filteredItems.length / this.inventoryItemsPerPage));
        this.inventoryCurrentPage = Math.min(this.inventoryCurrentPage, totalPages);

        const startIndex = (this.inventoryCurrentPage - 1) * this.inventoryItemsPerPage;
        const itemsToShow = filteredItems.slice(startIndex, startIndex + this.inventoryItemsPerPage);

        this.inventoryListContainer.innerHTML = '';
        if (itemsToShow.length === 0) {
            this.inventoryListContainer.innerHTML = `<p class="text-gray-400 text-sm text-center">Keine Items in dieser Kategorie.</p>`;
        } else {
            itemsToShow.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'group flex justify-between items-center p-2 bg-gray-700 rounded hover:bg-gray-600 cursor-pointer';
                itemEl.dataset.itemId = item.docId;

                let buttonsHtml = `<div class="flex-shrink-0 flex gap-1">`;
                if (item.type === 'weapon' || item.type === 'armor' || item.type === 'tool') {
                    buttonsHtml += `<button data-action="equip" data-item-id="${item.docId}" class="text-xs bg-blue-600 hover:bg-blue-500 p-1 rounded">Ausrüsten</button>`;
                }
                if (item.type === 'consumable') {
                    buttonsHtml += `<button data-action="use" data-item-id="${item.docId}" class="text-xs bg-green-600 hover:bg-green-500 p-1 rounded">Benutzen</button>`;
                }
                buttonsHtml += `<button data-action="delete" data-item-id="${item.docId}" title="Verwerfen" class="text-xs bg-red-600 hover:bg-red-500 px-2 py-1 rounded">🗑️</button>`;
                buttonsHtml += `</div>`;

                const rarityColor = this.rarityTiers[item.rarity]?.color || 'text-gray-300';
                itemEl.innerHTML = `
                    <div class="flex-grow flex items-center gap-2">
                        <span class="font-bold text-lg">${item.icon}</span>
                        <div>
                            <span class="font-bold ${rarityColor}">${item.name}</span> 
                            <span class="text-gray-400">${item.quantity > 1 ? `(x${item.quantity})` : ''}</span>
                        </div>
                    </div>
                    ${buttonsHtml}
                `;
                this.inventoryListContainer.appendChild(itemEl);
            });
        }

        this.inventoryPageInfo.textContent = `Seite ${this.inventoryCurrentPage} / ${totalPages}`;
        this.inventoryPagePrev.disabled = this.inventoryCurrentPage === 1;
        this.inventoryPageNext.disabled = this.inventoryCurrentPage >= totalPages;
    }

    updateItemDetails(detailsContainer, item, options = {}) {
        let contentHtml;
        if (!item || item.id === 'blocked_slot') {
            contentHtml = `<p class="text-gray-400 text-center flex-grow">Wähle ein Item aus</p>`;
        } else {
            const rarity = this.rarityTiers[item.rarity] || this.rarityTiers.common;
            const bonusesHtml = Object.entries(item.bonuses || {}).map(([stat, val]) => `<li>${stat}: +${val}</li>`).join('');
            const baseStatsHtml = Object.entries(item.baseStats || {}).map(([stat, val]) => `<li>${stat}: ${val}</li>`).join('');
            const effectHtml = item.effect ? `<li>Effekt: ${item.effect.type} (+${item.effect.amount})</li>` : '';

            let buttons = [];
            if (options.equip) buttons.push(`<button data-action="equip" data-item-id="${item.docId}" class="w-full text-sm bg-blue-500 hover:bg-blue-600 rounded px-2 py-1">Ausrüsten</button>`);
            if (options.use) buttons.push(`<button data-action="use" data-item-id="${item.docId}" class="w-full text-sm bg-green-500 hover:bg-green-600 rounded px-2 py-1">Benutzen</button>`);
            if (options.unequip) buttons.push(`<button data-action="unequip" data-slot-type="${item.slot}" class="w-full text-sm bg-yellow-500 hover:bg-yellow-600 rounded px-2 py-1">Ablegen</button>`);
            buttons.push(`<button data-action="delete" data-item-id="${item.docId}" class="w-full text-sm bg-red-800 hover:bg-red-700 rounded px-2 py-1 mt-4">Verwerfen</button>`);

            contentHtml = `
                <div class="flex-grow">
                    <div class="text-center"><span class="text-5xl">${item.icon}</span></div>
                    <h4 class="font-bold text-center my-2 ${rarity.color}">${item.name}</h4>
                    <p class="text-xs text-center text-gray-400 -mt-2 mb-2">${rarity.name}</p>
                    <ul class="text-xs text-gray-300 space-y-1">${baseStatsHtml}${bonusesHtml}${effectHtml}</ul>
                </div>
                <div class="mt-4 space-y-2">${buttons.join('')}</div>
            `;
        }
        detailsContainer.innerHTML = contentHtml;
    }

    async equipItem(userId, itemDocId) {
        const userRef = doc(this.db, 'users', userId);
        const itemInventoryRef = doc(this.db, 'users', userId, 'inventory', itemDocId);

        // Get the item's name for the notification *before* the transaction
        const itemToEquipDoc = await getDoc(itemInventoryRef);
        if (!itemToEquipDoc.exists()) {
            this.showNotification("Gegenstand nicht im Inventar gefunden.", "error");
            return;
        }
        const itemName = itemToEquipDoc.data().name;

        try {
            await runTransaction(this.db, async (transaction) => {
                const userDoc = await transaction.get(userRef);
                const invItemDoc = await transaction.get(itemInventoryRef);

                if (!userDoc.exists() || !invItemDoc.exists()) throw "User or Item not found.";

                const itemToEquipData = { docId: invItemDoc.id, ...invItemDoc.data() };
                const slotToOccupy = itemToEquipData.slot;
                if (!slotToOccupy) throw "Item has no slot defined.";

                const currentEquipment = userDoc.data().equipment || {};
                const newEquipment = { ...currentEquipment };
                let itemsToUnequip = [];

                if (itemToEquipData.hands === 2) {
                    if (currentEquipment.weapon1) itemsToUnequip.push(currentEquipment.weapon1);
                    if (currentEquipment.weapon2 && currentEquipment.weapon2.id !== 'blocked_slot') itemsToUnequip.push(currentEquipment.weapon2);
                    newEquipment.weapon1 = { ...itemToEquipData, quantity: 1 };
                    newEquipment.weapon2 = { id: 'blocked_slot', name: 'Blockiert', icon: '🚫', slot: 'weapon2' };
                } else {
                    if (currentEquipment[slotToOccupy]) itemsToUnequip.push(currentEquipment[slotToOccupy]);
                    newEquipment[slotToOccupy] = { ...itemToEquipData, quantity: 1 };
                }

                // Handle unequipped items
                for (const item of itemsToUnequip) {
                    if (item.id === 'blocked_slot') continue;
                    const existingStackQuery = query(collection(this.db, 'users', userId, 'inventory'), where("id", "==", item.id));
                    const existingStackSnapshot = await getDocs(existingStackQuery); // This is problematic in a transaction
                    // Simplified: always create a new item. Stacking on unequip is complex.
                    const newItemRef = doc(collection(this.db, 'users', userId, 'inventory'));
                    transaction.set(newItemRef, { ...item, docId: newItemRef.id, quantity: 1 });
                }

                if (itemToEquipData.quantity > 1) {
                    transaction.update(itemInventoryRef, { quantity: increment(-1) });
                } else {
                    transaction.delete(itemInventoryRef);
                }

                transaction.update(userRef, { equipment: newEquipment });
            });
            this.showNotification(`${itemName} ausgerüstet.`);
        } catch (error) {
            console.error("Equip Transaction failed:", error);
            this.showNotification(`Ausrüsten fehlgeschlagen: ${error.message || error}`, "error");
        }
    }

    async unequipItem(userId, slot) {
        const userRef = doc(this.db, 'users', userId);
        try {
            const userDoc = await getDoc(userRef);
            if (!userDoc.exists()) return;

            const equipment = userDoc.data().equipment || {};
            const itemToUnequip = equipment[slot];
            if (!itemToUnequip) return;

            const updatePayload = { [`equipment.${slot}`]: deleteField() };
            if (itemToUnequip.hands === 2) {
                updatePayload['equipment.weapon2'] = deleteField();
            }

            await updateDoc(userRef, updatePayload);
            await this.addItemToInventory(userId, itemToUnequip, true);
            this.showNotification(`${itemToUnequip.name} abgelegt.`);
        } catch (error) { console.error("Unequip failed:", error); }
    }

    async unequipAllItems(userId) {
        const userRef = doc(this.db, 'users', userId);
        try {
            await runTransaction(this.db, async (transaction) => {
                const userDoc = await transaction.get(userRef);
                if (!userDoc.exists()) throw "User not found.";

                const currentEquipment = userDoc.data().equipment || {};
                if (Object.keys(currentEquipment).length === 0) {
                    this.showNotification("Nichts zum Ablegen vorhanden.", "info");
                    return;
                }

                const itemsToAddBack = [];
                for (const slot in currentEquipment) {
                    const item = currentEquipment[slot];
                    if (item && item.id !== 'blocked_slot') {
                        // Avoid duplicating 2-handed weapon
                        if (slot === 'weapon2' && currentEquipment.weapon1?.hands === 2) {
                            continue;
                        }
                        itemsToAddBack.push(item);
                    }
                }

                if (itemsToAddBack.length === 0) {
                    this.showNotification("Nichts zum Ablegen vorhanden.", "info");
                    return;
                }

                // Add items back to inventory
                const inventoryRef = collection(this.db, 'users', userId, 'inventory');
                for (const item of itemsToAddBack) {
                    const newItemRef = doc(inventoryRef);
                    transaction.set(newItemRef, { ...item, docId: newItemRef.id, quantity: 1 });
                }

                // Clear equipment
                transaction.update(userRef, { equipment: {} });
            });

            this.showNotification("Alle Gegenstände wurden abgelegt.", "success");
            this.equipmentItemDetails.innerHTML = '<p class="text-gray-400 text-center flex-grow">Wähle ein Item aus</p>';
        } catch (error) {
            console.error("Unequip All Transaction failed:", error);
            this.showNotification(`Fehler beim Ablegen: ${error.message || error}`, "error");
        }
    }

    async addItemToInventory(userId, itemData, quantity = 1) {
        if (!userId || !itemData) {
            console.error("addItemToInventory: Missing userId or itemData");
            return;
        }
    
        const inventoryColRef = collection(this.db, 'users', userId, 'inventory');

        // For stackable items, use a predictable document ID to enable safe transactions
        if (itemData.type === 'consumable') {
            const predictableDocId = `stack_${itemData.id}`;
            const itemRef = doc(inventoryColRef, predictableDocId);

            try {
                await runTransaction(this.db, async (transaction) => {
                    const itemDoc = await transaction.get(itemRef);
                    if (itemDoc.exists()) {
                        // If the stack exists, increment its quantity.
                        transaction.update(itemRef, { quantity: increment(quantity) });
                    } else {
                        // If the stack doesn't exist, create it with the predictable docId.
                        transaction.set(itemRef, { ...itemData, docId: predictableDocId, quantity: quantity }); // Ensure docId is set correctly
                    }
                });
            } catch (e) {
                console.error("Item stacking transaction failed: ", e);
                this.showNotification("Fehler beim Stapeln des Gegenstands.", "error");
            }
        } else {
            // For non-stackable items (equipment), always add a new document with a unique ID.
            const newItemRef = doc(inventoryColRef);
            await setDoc(newItemRef, { ...itemData, docId: newItemRef.id, quantity: 1 }); // Ensure docId is set correctly
        }
    }

    async processInitialInventory(userId, items) {
        if (!items || Object.keys(items).length === 0) return;

        this.showNotification("Füge Start-Gegenstände zum Inventar hinzu...", "info");
        const itemPromises = Object.values(items).map(item => this.addItemToInventory(userId, item));
        
        try {
            await Promise.all(itemPromises);
            // Clean up the temporary field
            await updateDoc(doc(this.db, 'users', userId), { itemsToAddToInventory: deleteField() });
        } catch (error) {
            console.error("Error processing initial inventory:", error);
        }
    }

    _attachEventListeners() {
        document.getElementById('menu-btn-equipment').addEventListener('click', () => this.equipmentModal.classList.remove('hidden'));
        this.equipmentModal.querySelector('.modal-close-btn').addEventListener('click', () => this.equipmentModal.classList.add('hidden'));

        document.getElementById('menu-btn-inventory').addEventListener('click', () => {
            this.renderInventoryPage();
            this.inventoryModal.classList.remove('hidden');
        });
        this.inventoryModal.querySelector('.modal-close-btn').addEventListener('click', () => this.inventoryModal.classList.add('hidden'));
        
        this.equipmentSlotsContainer.addEventListener('click', (e) => {
            const slot = e.target.closest('.equipment-slot');
            if (slot && this.currentUser) {
                this.equipmentSlotsContainer.querySelectorAll('.equipment-slot.selected').forEach(el => el.classList.remove('selected'));
                slot.classList.add('selected');
                const slotType = slot.dataset.slotType;
                const item = this.userProfile.equipment?.[slotType];
                this.updateItemDetails(this.equipmentItemDetails, item, { unequip: true });
            }
        });
        
        if (this.unequipAllBtn) {
            this.unequipAllBtn.addEventListener('click', () => {
                const userId = this.currentUser?.uid;
                if (userId) this.unequipAllItems(userId);
            });
        }

        this.equipmentItemDetails.addEventListener('click', e => {
            const button = e.target.closest('button[data-action="unequip"]');
            if (button && this.currentUser) {
                this.unequipItem(this.currentUser.uid, button.dataset.slotType);
                this.updateItemDetails(this.equipmentItemDetails, null);
            }
        });

        this.inventorySortButtons.addEventListener('click', e => {
            const button = e.target.closest('button');
            if (button) {
                this.inventorySortCategory = button.dataset.sortCategory;
                this.inventoryCurrentPage = 1;
                this.inventorySortButtons.querySelectorAll('button').forEach(btn => btn.classList.replace('bg-indigo-600', 'bg-gray-600'));
                button.classList.replace('bg-gray-600', 'bg-indigo-600');
                this.renderInventoryPage();
                this.updateItemDetails(this.inventoryItemDetails, null);
            }
        });

        this.inventoryListContainer.addEventListener('click', async (event) => {
            const userId = this.currentUser.uid;
            if (!userId) return;

            const equipBtn = event.target.closest('button[data-action="equip"]');
            if (equipBtn) {
                this.equipItem(userId, equipBtn.dataset.itemId);
                return;
            }

            const useBtn = event.target.closest('button[data-action="use"]');
            if (useBtn) {
                this.useItem(userId, useBtn.dataset.itemId);
                return;
            }

            const deleteBtn = event.target.closest('button[data-action="delete"]');
            if (deleteBtn) {
                const item = this.allInventoryItems.find(i => i.docId === deleteBtn.dataset.itemId);
                if (item && item.quantity > 1) {
                    const amount = prompt(`Wie viele von ${item.quantity} "${item.name}" möchtest du verwerfen?`, item.quantity);
                    const amountToDelete = parseInt(amount, 10);
                    if (!isNaN(amountToDelete) && amountToDelete > 0) {
                        this.showDeleteConfirm(`${amountToDelete}x "${item.name}" wirklich verwerfen?`, () => this.deleteItem(userId, deleteBtn.dataset.itemId, amountToDelete));
                    }
                } else {
                    this.showDeleteConfirm('Gegenstand wirklich verwerfen?', () => this.deleteItem(userId, deleteBtn.dataset.itemId, 1));
                }
                return;
            }

            // Handle selecting an item to show its details
            const itemEl = event.target.closest('.group[data-item-id]');
            if (itemEl) {
                this.inventoryListContainer.querySelectorAll('.group.selected').forEach(el => el.classList.remove('selected'));
                itemEl.classList.add('selected');

                const itemId = itemEl.dataset.itemId;
                const item = this.allInventoryItems.find(i => i.docId === itemId);
                if (item) {
                    const options = { equip: item.type === 'weapon' || item.type === 'armor' || item.type === 'tool', use: item.type === 'consumable' };
                    this.updateItemDetails(this.inventoryItemDetails, item, options);
                }
            }
        });

        this.inventoryPagePrev.addEventListener('click', () => {
            if (this.inventoryCurrentPage > 1) {
                this.inventoryCurrentPage--;
                this.renderInventoryPage();
            }
        });

        this.inventoryPageNext.addEventListener('click', () => {
            const totalItems = this.allInventoryItems.filter(item => this.inventorySortCategory === 'all' || item.type === this.inventorySortCategory).length;
            const totalPages = Math.ceil(totalItems / this.inventoryItemsPerPage);
            if (this.inventoryCurrentPage < totalPages) {
                this.inventoryCurrentPage++;
                this.renderInventoryPage();
            }
        });

        this.useHpPotionBtn.addEventListener('click', () => {
            const hpPotion = this.allInventoryItems.find(item => item.id === 'potion_hp_small');
            const userId = this.currentUser?.uid;
            if (hpPotion && userId) {
                this.useItem(userId, hpPotion.docId);
            } else {
                this.showNotification("Keine Heiltränke vorhanden!", "error");
            }
        });

        this.useManaPotionBtn.addEventListener('click', () => {
            const manaPotion = this.allInventoryItems.find(item => item.id === 'potion_mana_small');
            const userId = this.currentUser?.uid;
            if (manaPotion && userId) {
                this.useItem(userId, manaPotion.docId);
            } else {
                this.showNotification("Keine Manatränke vorhanden!", "error");
            }
        });
    }

    async deleteItem(userId, itemDocId, amount = 1) {
        const itemRef = doc(this.db, 'users', userId, 'inventory', itemDocId);
        try {
            const itemDoc = await getDoc(itemRef);
            if (!itemDoc.exists()) return;

            const currentQuantity = itemDoc.data().quantity;
            if (amount >= currentQuantity) {
                await deleteDoc(itemRef);
            } else {
                await updateDoc(itemRef, { quantity: increment(-amount) });
            }

            this.showNotification(`${amount}x Gegenstand verworfen.`, "info");
        } catch (error) {
            console.error("Error deleting item:", error);
            this.showNotification("Fehler beim Verwerfen.", "error");
        }
    }

    async useItem(userId, itemDocId) {
        const itemRef = doc(this.db, 'users', userId, 'inventory', itemDocId);
        const userRef = doc(this.db, 'users', userId);

        try {
            const transactionResult = await runTransaction(this.db, async (transaction) => {
                const itemDoc = await transaction.get(itemRef);
                const userDoc = await transaction.get(userRef);

                if (!itemDoc.exists() || !userDoc.exists()) throw "Item oder Benutzer nicht gefunden.";

                const item = itemDoc.data();
                const user = userDoc.data();

                if (item.quantity <= 0) throw "Keine Tränke mehr übrig.";

                let wasUsed = false;

                if (item.effect?.type === 'heal') {
                    if (user.hp.current < user.hp.max) {
                        const newHp = Math.min(user.hp.current + item.effect.amount, user.hp.max);
                        transaction.update(userRef, { 'hp.current': newHp });
                        wasUsed = true;
                    }
                } else if (item.effect?.type === 'mana') {
                     if (user.mana.current < user.mana.max) {
                        const newMana = Math.min(user.mana.current + item.effect.amount, user.mana.max);
                        transaction.update(userRef, { 'mana.current': newMana });
                        wasUsed = true;
                    }
                }

                if (wasUsed) {
                    // Decrement quantity or delete if it's the last one
                    if (item.quantity > 1) {
                        transaction.update(itemRef, { quantity: increment(-1) });
                    } else {
                        transaction.delete(itemRef);
                    }
                    return true; // Signal success to the caller
                }
                // If not used, signal failure
                return false;
            });

            // The onSnapshot listener in main.js will handle the UI update.
            // We only show a notification based on the transaction's outcome.
            if (transactionResult) this.showNotification("Trank benutzt!", "success");
            else this.showNotification("Bereits volle Lebenspunkte/Mana!", "info");

        } catch (error) {
            console.error("Error using item:", error);
            this.showNotification(`Benutzen fehlgeschlagen: ${error.message}`, "error");
        }
    }
}
