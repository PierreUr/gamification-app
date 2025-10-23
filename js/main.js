/**
 * Main Application Entry Point
 */
// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged, signOut, deleteUser } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, doc, onSnapshot, getDoc, writeBatch, collection, Timestamp, getDocs, deleteDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// App Module Imports
import { SkillTreeManager } from './skillTree.js';
import { PetManager } from './petManager.js';
import { CharacterSheetManager } from './characterSheetManager.js';
import { InventoryManager } from './inventoryManager.js';
import { ModalManager } from './modalManager.js';
import { TestToolsManager } from './testToolsManager.js';
import { QuestManager } from './questManager.js';
import { TimerManager } from './timerManager.js';
import { AchievementManager } from './achievementManager.js';
import { JournalManager } from './journalManager.js';
import { GanttSortManager } from './ganttSortManager.js';
import { formatDuration } from './utils.js';

class GamificationApp {
    constructor() {
        // Firebase Setup
        this.firebaseConfig = { apiKey: "AIzaSyBJgfy6sgA5HyNhFZDuzAaMCi16UyDtazA", authDomain: "gamification-core.firebaseapp.com", projectId: "gamification-core", storageBucket: "gamification-core.appspot.com", messagingSenderId: "187541389621", appId: "1:187541389621:web:7d9acbd0ea15a953188c7c", measurementId: "G-GG9Y71NFYG" };
        this.app = initializeApp(this.firebaseConfig);
        this.auth = getAuth(this.app);
        this.db = getFirestore(this.app);
        console.log("Firebase client initialized.");

        // Configuration
        this.config = {
            rarityTiers: {
                common: { name: 'Gewöhnlich', color: 'text-gray-300' },
                magic: { name: 'Magisch', color: 'text-green-400' },
                rare: { name: 'Selten', color: 'text-blue-400' },
                uniq: { name: 'Einzigartig', color: 'text-yellow-400' },
                legendary: { name: 'Legendär', color: 'text-orange-500' },
                epic: { name: 'Episch', color: 'text-purple-500' }
            },
            rarityColors: {
                common: 'border-gray-500', magic: 'border-green-500', rare: 'border-blue-500',
                uniq: 'border-yellow-500', legendary: 'border-orange-500', epic: 'border-purple-500'
            },
            itemDatabase: [
                { id: 'potion_hp_small', name: 'Heiltrank', icon: '🧪', type: 'consumable', slot: 'consumable', rarity: 'common', effect: { type: 'heal', amount: 50 }, baseStats: {} },
                { id: 'potion_mana_small', name: 'Manatrank', icon: '💧', type: 'consumable', slot: 'consumable', rarity: 'common', effect: { type: 'mana', amount: 30 }, baseStats: {} },
                { id: 'claymore_common', name: 'Großer Zweihänder', icon: '⚔️', type: 'weapon', rarity: 'magic', bonuses: { strength: 25, vitality: 5 }, slot: 'weapon1', hands: 2, baseStats: { physDmg: 25, eleDmg: 0 } },
                { id: 'starter_set_chest', name: 'Starter-Rüstung', icon: '👕', type: 'armor', slot: 'chest', rarity: 'common', bonuses: { vitality: 3, strength: 3 }, baseStats: { armor: 10, eleRes: 2 } },
                { id: 'starter_set_legs', name: 'Starter-Hose', icon: '👖', type: 'armor', slot: 'legs', rarity: 'common', bonuses: { vitality: 2 }, baseStats: { armor: 6, eleRes: 1 } },
                { id: 'starter_set_head', name: 'Starter-Helm', icon: '🎓', type: 'armor', slot: 'head', rarity: 'common', bonuses: { int: 2 }, baseStats: { armor: 4, eleRes: 1 } },
                { id: 'starter_set_feet', name: 'Starter-Schuhe', icon: '👟', type: 'armor', slot: 'feet', rarity: 'common', bonuses: { agility: 2 }, baseStats: { armor: 3, eleRes: 1 } },
                { id: 'starter_set_hands', name: 'Starter-Handschuhe', icon: '🧤', type: 'armor', slot: 'hands', rarity: 'common', bonuses: { strength: 1 }, baseStats: { armor: 2, eleRes: 1 } },
                { id: 'starter_set_ring1', name: 'Starter-Ring', icon: '💍', type: 'armor', slot: 'ring1', rarity: 'common', bonuses: { luck: 5 } , baseStats: {} },
                { id: 'starter_set_ring2', name: 'Starter-Ring', icon: '💍', type: 'armor', slot: 'ring2', rarity: 'common', bonuses: { luck: 5 } , baseStats: {} },
                { id: 'starter_set_weapon', name: 'Starter-Dolch', icon: '🔪', type: 'weapon', slot: 'weapon1', rarity: 'common', bonuses: { agility: 3 }, baseStats: { physDmg: 5, eleDmg: 0 } },
                { id: 'offhand_sword', name: 'Linkhand-Schwert', icon: '🗡️', type: 'weapon', slot: 'weapon2', rarity: 'common', bonuses: { agility: 5 }, baseStats: { physDmg: 8, eleDmg: 0 } },
                { id: 'starter_set_amulet', name: 'Starter-Amulett', icon: '🧿', type: 'armor', slot: 'amulet', rarity: 'common', bonuses: { luck: 2 }, baseStats: {} },
                { id: 'starter_set_bracers', name: 'Starter-Armschienen', icon: '💪', type: 'armor', slot: 'bracers', rarity: 'common', bonuses: { strength: 1 }, baseStats: { armor: 1 } },
                { id: 'starter_set_tool1', name: 'Angelrute', icon: '🎣', type: 'tool', slot: 'tool1', rarity: 'common', bonuses: {}, baseStats: {} },
                { id: 'starter_set_tool2', name: 'Spitzhacke', icon: '⛏️', type: 'tool', slot: 'tool2', rarity: 'common', bonuses: {}, baseStats: {} },
                { id: 'pet_rock', name: 'Rocky', icon: '🪨', type: 'pet', rarity: 'common', element: 'Erde', baseStats: { vitality: 5 }, skills: ['Steinschlag', 'Härtner', 'Einigeln'] },
                { id: 'pet_sparky', name: 'Sparky', icon: '⚡️', type: 'pet', rarity: 'common', element: 'Elektro', baseStats: { agility: 3 }, skills: ['Tackle', 'Funkenschlag', 'Donnerwelle'] },
                { id: 'pet_blaze', name: 'Blaze', icon: '🔥', type: 'pet', rarity: 'rare', element: 'Feuer', baseStats: { strength: 5, vitality: 2 }, skills: ['Glut', 'Feuerwirbel', 'Rauchwolke'] },
                { id: 'pet_frosty', name: 'Frosty', icon: '❄️', type: 'pet', rarity: 'rare', element: 'Eis', baseStats: { int: 5, vitality: 2 }, skills: ['Eissplitter', 'Froststrahl', 'Nebel'] },
                { id: 'pet_shadow', name: 'Shadow', icon: '🌑', type: 'pet', rarity: 'epic', element: 'Dunkel', baseStats: { strength: 4, agility: 4, int: 4 }, skills: ['Schattenstoß', 'Dunkelklaue', 'Verfolgung'] },
            ],
            achievementDatabase: [
                { id: 'quests_1', name: 'Erste Schritte', description: 'Schließe deine erste Quest ab.', icon: '📜', condition: { type: 'questsCompleted', value: 1 }, reward: { type: 'xp', amount: 25 } },
                { id: 'quests_10', name: 'Fleißiger Arbeiter', description: 'Schließe 10 Quests ab.', icon: '📚', condition: { type: 'questsCompleted', value: 10 }, reward: { type: 'xp', amount: 100 } },
                { id: 'level_5', name: 'Aufstrebend', description: 'Erreiche Level 5.', icon: '⭐', condition: { type: 'level', value: 5 }, reward: { type: 'statPoints', amount: 2 } },
                { id: 'pomodoro_1', name: 'Zeitmanagement-Anfänger', description: 'Benutze den Pomodoro Timer einmal.', icon: '🍅', condition: { type: 'pomodorosCompleted', value: 1 }, reward: { type: 'xp', amount: 15 } }
            ]
        };

        // DOM Elements
        this.authView = document.getElementById('auth-view');
        this.appView = document.getElementById('app-view');
        this.loginBtn = document.getElementById('login-btn');
        this.logoutBtn = document.getElementById('logout-btn');
        this.notificationArea = document.getElementById('notification-area');
        this.itemFoundModal = document.getElementById('div-4000');
        this.goldAmountDisplay = document.getElementById('gold-amount');
        this.silverAmountDisplay = document.getElementById('silver-amount');
        this.bronzeAmountDisplay = document.getElementById('bronze-amount');
        this.crystalsAmountDisplay = document.getElementById('crystals-amount');
        this.modalItemIcon = document.getElementById('modal-item-icon');
        this.modalItemName = document.getElementById('modal-item-name');
        this.modalKeepBtn = document.getElementById('modal-keep-btn');
        this.modalDiscardBtn = document.getElementById('modal-discard-btn');
        this.deleteConfirmModal = document.getElementById('div-4010');
        this.deleteConfirmText = document.getElementById('delete-confirm-text');
        this.deleteConfirmBtn = document.getElementById('delete-confirm-btn');
        this.deleteCancelBtn = document.getElementById('delete-cancel-btn');
        this.characterAchievementsDisplay = document.getElementById('character-achievements-display');


        // State
        this.currentUser = null;
        this.userProfileUnsubscribe = null;
        this.ganttScrollPosition = 0;

        this.managersInitialized = false;
        this.managers = [];
    }

    init() {
        this.attachAuthEventListeners();
        this.handleAuthState();
    }

    attachAuthEventListeners() {
        this.loginBtn.addEventListener('click', () => this.signIn());
    }

    _initializeManagersAndEventListeners() {
        if (this.managersInitialized) return;

        this.modalManager = new ModalManager(this._continueQuest.bind(this), this._extendBreak.bind(this), this._endFocus.bind(this));
        this.skillTreeManager = new SkillTreeManager(this.db, this.showNotification.bind(this));
        this.petManager = new PetManager(this.db, this.showNotification.bind(this), this.config);
        this.characterSheetManager = new CharacterSheetManager(this.db, this.auth);
        this.inventoryManager = new InventoryManager(this.db, this.showNotification.bind(this), this.config, this.showDeleteConfirm.bind(this));
        this.timerManager = new TimerManager(this.showNotification.bind(this), this.handleTimerCompletion.bind(this), this.modalManager);
        
        // GanttManager needs to be initialized before QuestManager if QuestManager depends on it.
        // Let's adjust the structure slightly for clarity.
        this.questManager = new QuestManager(this.db, this.showNotification.bind(this), this.handleXpGain.bind(this), this.processQuestDrop.bind(this), this.showDeleteConfirm.bind(this));
        this.questManager.setTimerManager(this.timerManager);
        this.questManager.ganttManager.setDependencies(this.questManager);
        this.testToolsManager = new TestToolsManager(this.db, this.auth, this.showNotification.bind(this), this.config, this.handleXpGain.bind(this), this.questManager, this.timerManager);
        this.journalManager = new JournalManager(this.db);
        this.achievementManager = new AchievementManager(this.db, this.showNotification.bind(this), this.config);
        this.managers = [this.modalManager, this.questManager, this.characterSheetManager, this.inventoryManager, this.petManager, this.skillTreeManager, this.testToolsManager, this.timerManager, this.achievementManager, this.journalManager];

        this._attachAllEventListeners();
        this.managersInitialized = true;
    }

    _extendBreak(minutes) {
        // This function will be called from modalManager
        this.timerManager.extendBreak(minutes);
    }

    _endFocus() {
        // This function will be called from modalManager
        if (this.questManager) {
            const questId = this.questManager.focusedQuestId;
            if (this.timerManager && this.timerManager.isQuestTimerRunning(questId)) {
                this.timerManager.stopQuestTimer();
            }
            this.questManager.focusedQuestId = null;
            this.questManager._renderFocusQuest();
        }
    }

    _continueQuest() {
        // This function will be called from modalManager
        if (this.timerManager) {
            // This will now reset the timer and automatically start it.
            this.timerManager.continueQuestTimer();
            // A short delay ensures that the timerManager has updated its state before rendering.
            setTimeout(() => {
                this.questManager._renderFocusQuest();
            }, 50);
        }
    }

    _attachAllEventListeners() {
        // Global Listeners that are always active after login
        this.logoutBtn.addEventListener('click', () => this.deleteUserAndData());
        this.modalKeepBtn.addEventListener('click', () => this._handleKeepItem());
        this.modalDiscardBtn.addEventListener('click', () => this._handleDiscardItem());
        this.deleteCancelBtn.addEventListener('click', () => {
            this.deleteConfirmModal.classList.add('hidden');
        });
        this.deleteConfirmBtn.addEventListener('click', () => {
            this.onDeleteConfirmCallback?.();
            this.deleteConfirmModal.classList.add('hidden');
        });

        document.addEventListener('breakTimerUpdate', (e) => {
            const { timeLeft } = e.detail;
            // Update all relevant UI parts from one central place
            if (this.timerManager.isBreakActive) {
                this.modalManager.updateBreakPopupTime(timeLeft); // For the main popup
                this.questManager._renderBreakFocus(timeLeft); // For the focus view when popup is closed
            }
            
            const minimizedTimerDisplay = document.getElementById('minimized-break-timer-display');
            if (minimizedTimerDisplay) {
                minimizedTimerDisplay.textContent = formatDuration(timeLeft);
            }
        });
        
        // Attach listeners for each manager
        this.managers.forEach(manager => {
            if (manager && typeof manager._attachEventListeners === 'function') {
                try {
                    manager._attachEventListeners();
                } catch (error) {
                    console.error(`Error attaching listeners for ${manager.constructor.name}:`, error);
                }
            }
        });
    }

    _restoreGanttScrollPosition() {
        const scrollContainer = document.querySelector('#gantt-timeline-scroll-container');
        if (scrollContainer) {
            scrollContainer.scrollLeft = this.ganttScrollPosition;
        }
    }

    handleAuthState() {
        onAuthStateChanged(this.auth, (user) => {
            if (user) {
                this.currentUser = user;
                this.listenToUserProfile(user.uid);
            } else {
                this.currentUser = null;
                this.authView.classList.remove('hidden');
                this.appView.classList.add('hidden');
                if (this.userProfileUnsubscribe) {
                    this.userProfileUnsubscribe();
                }
            }
        });
    }

    async signIn() {
        try {
            await signInAnonymously(this.auth);
        } catch (error) {
            console.error("Anonymous sign-in failed:", error);
            this.showNotification("Anmeldung fehlgeschlagen.", "error");
        }
    }

    async deleteUserAndData() {
        const user = this.auth.currentUser;
        if (!user) {
            signOut(this.auth).catch(console.error);
            return;
        }
        try {
            document.querySelectorAll('.modal').forEach(modal => modal.classList.add('hidden'));
            const userId = user.uid;
            const userDocRef = doc(this.db, 'users', userId);
            const subcollections = ['inventory', 'journal'];
            for (const sub of subcollections) {
                const subRef = collection(this.db, 'users', userId, sub);
                const snapshot = await getDocs(subRef);
                const batch = writeBatch(this.db);
                snapshot.forEach(doc => batch.delete(doc.ref));
                await batch.commit();
            }
            await deleteDoc(userDocRef);
            await deleteUser(user);
            await signOut(this.auth);
            window.location.reload();
        } catch (error) {
            console.error("Error deleting user data:", error);
            this.showNotification("Fehler beim Löschen. Melde dich manuell ab.", "error");
            await signOut(this.auth);
        }
    }

    listenToUserProfile(userId) {
        const userDocRef = doc(this.db, 'users', userId);
        if (this.userProfileUnsubscribe) {
            this.userProfileUnsubscribe();
        }
        this.userProfileUnsubscribe = onSnapshot(userDocRef, (doc) => {
            this._initializeManagersAndEventListeners(); // Ensure managers are ready
            if (doc.exists()) {
                this._updateAllManagers(doc.data());
            } else {
                this.createNewUserProfile(userId);
            }
        }, (error) => {
            console.error("Error listening to user profile:", error);
        });
    }

    _updateAllManagers(userProfile) {
        this.authView.classList.add('hidden');
        this.appView.classList.remove('hidden');
        if (!this.managersInitialized) {
            this.appView.classList.remove('hidden');
            this._initializeManagersAndEventListeners();
            this.authView.classList.add('hidden');
        }
        this.managers.forEach(manager => {
            if (manager && typeof manager.updateUserData === 'function') {
                manager.updateUserData(this.currentUser, userProfile);
            }
        });
        // TODO: Move these direct UI updates into their own managers
        this.updateCurrencyDisplay(userProfile.currency, userProfile.crystals);
        this.renderDisplayedAchievements(userProfile);
    }

    async createNewUserProfile(userId) {
        console.log("No Firebase user profile found, creating one...");
        const userDocRef = doc(this.db, 'users', userId);
        try {
            const batch = writeBatch(this.db);
            const defaultEquipment = {};
            const starterItemMap = {
                head: 'starter_set_head', chest: 'starter_set_chest', legs: 'starter_set_legs',
                feet: 'starter_set_feet', hands: 'starter_set_hands', ring1: 'starter_set_ring1',
                ring2: 'starter_set_ring2', weapon1: 'starter_set_weapon', weapon2: 'offhand_sword',
                amulet: 'starter_set_amulet', bracers: 'starter_set_bracers',
                tool1: 'starter_set_tool1', tool2: 'starter_set_tool2',
            };

            const totalInitialStats = { vitality: 10, strength: 10, stamina: 10, agility: 10, int: 10, luck: 10 };

            Object.entries(starterItemMap).forEach(([slot, itemId]) => {
                const itemData = this.config.itemDatabase.find(i => i.id === itemId);
                if (itemData) {
                    defaultEquipment[slot] = { ...itemData, docId: `starter_${slot}` };
                    if (itemData.bonuses) {
                        for (const [stat, value] of Object.entries(itemData.bonuses)) {
                            totalInitialStats[stat] = (totalInitialStats[stat] || 0) + value;
                        }
                    }
                }
            });

            const initialMaxHp = this.characterSheetManager._calculateMaxHp(totalInitialStats.vitality);
            const initialMaxMana = this.characterSheetManager._calculateMaxMana(totalInitialStats.int);
            const initialMaxStamina = this.characterSheetManager._calculateMaxStamina(totalInitialStats.stamina);
            
            const starterPetIds = ['pet_rock', 'pet_sparky', 'pet_blaze', 'pet_frosty', 'pet_shadow'];
            const starterPets = {};
            starterPetIds.forEach(petId => {
                const petData = this.config.itemDatabase.find(i => i.id === petId);
                if (petData) {
                    const docId = `starter_${petId}`;
                    starterPets[docId] = { ...petData, docId, level: 1, xp: 0, maxXp: 100, currentStats: { ...(petData.baseStats || {}) } };
                }
            });

            batch.set(userDocRef, {
                xp: 0, level: 1, statPoints: 50, skillPoints: 0, questsCompleted: 0, pomodorosCompleted: 0,
                achievements: {}, displayedAchievements: [], currency: { gold: 0, silver: 0, bronze: 250 },
                skills: [], crystals: 5,
                hp: { current: initialMaxHp, max: initialMaxHp },
                mana: { current: initialMaxMana, max: initialMaxMana },
                stamina: { current: initialMaxStamina, max: initialMaxStamina },
                stats: { vitality: 10, strength: 10, stamina: 10, agility: 10, int: 10, luck: 10 },
                equipment: defaultEquipment, pets: starterPets, activePets: ['starter_pet_rock']
            });

            const inventoryColRef = collection(this.db, 'users', userId, 'inventory');
            const hpPotionRef = doc(inventoryColRef, 'stack_potion_hp_small');
            batch.set(hpPotionRef, { ...this.config.itemDatabase.find(i => i.id === 'potion_hp_small'), docId: 'stack_potion_hp_small', quantity: 3 });
            const manaPotionRef = doc(inventoryColRef, 'stack_potion_mana_small');
            batch.set(manaPotionRef, { ...this.config.itemDatabase.find(i => i.id === 'potion_mana_small'), docId: 'stack_potion_mana_small', quantity: 3 });
            const claymoreRef = doc(inventoryColRef);
            batch.set(claymoreRef, { ...this.config.itemDatabase.find(i => i.id === 'claymore_common'), docId: claymoreRef.id, quantity: 1 });

            await batch.commit();
            this.showNotification("Neuer Charakter erstellt!", "success");
        } catch (error) {
            console.error("Error creating user profile:", error);
            this.showNotification("Fehler bei der Charaktererstellung.", "error");
        }
    }

    // --- Central Game Logic ---

    async handleXpGain(userId, xpGained) {
        const userRef = doc(this.db, "users", userId);
        try {
            await updateDoc(userRef, { xp: increment(xpGained) });
            const userDoc = await getDoc(userRef);
            const userData = userDoc.data();

            let currentLevel = userData.level;
            let currentXp = userData.xp;
            const getXpForLevel = (level) => (level - 1) * 100;

            let hasLeveledUp = false;
            let levelsGained = 0;
            while (currentXp >= getXpForLevel(currentLevel + 1)) {
                currentLevel++;
                levelsGained++;
                hasLeveledUp = true;
            }

            if (hasLeveledUp) {
                const newLevel = currentLevel;
                const statPointsGained = levelsGained * 5;
                const skillPointsGained = levelsGained;

                await updateDoc(userRef, {
                    level: newLevel,
                    statPoints: increment(statPointsGained),
                    skillPoints: increment(skillPointsGained)
                });
                this.showNotification(`Level Up! Du bist jetzt Level ${newLevel}!`, 'success', 5000);
            }
            const updatedUserDoc = await getDoc(userRef);
            await this.checkAndGrantAchievements(userId, updatedUserDoc.data());
        } catch (error) {
            console.error("Error handling XP gain:", error);
        }
    }

    async checkAndGrantAchievements(userId, userProfile) {
        if (!userProfile) return;
        const userDocRef = doc(this.db, 'users', userId);
        const updatePayload = {};
        let hasNewAchievements = false;

        for (const achievement of this.config.achievementDatabase) {
            const isAlreadyAchieved = userProfile.achievements && userProfile.achievements[achievement.id];
            if (isAlreadyAchieved) continue;

            // Simplified condition check
            const conditionMet = (userProfile[achievement.condition.type] || 0) >= achievement.condition.value;

            if (conditionMet) {
                hasNewAchievements = true;
                this.showNotification(`Erfolg freigeschaltet: ${achievement.name}`);
                updatePayload[`achievements.${achievement.id}`] = true;
            }
        }

        if (hasNewAchievements) {
            await updateDoc(userDocRef, updatePayload);
        }
    }

    renderDisplayedAchievements(userProfile) {
        if (!this.characterAchievementsDisplay) return;

        this.characterAchievementsDisplay.innerHTML = '';
        const displayedIds = userProfile.displayedAchievements || [];
        const unlockedAchievements = userProfile.achievements || {};

        displayedIds.forEach(id => {
            if (unlockedAchievements[id]) {
                const achievementData = this.config.achievementDatabase.find(ach => ach.id === id);
                if (achievementData) {
                    const iconEl = document.createElement('span');
                    iconEl.className = 'text-lg';
                    iconEl.textContent = achievementData.icon;
                    iconEl.title = achievementData.name;
                    this.characterAchievementsDisplay.appendChild(iconEl);
                }
            }
        });
    }

    updateCurrencyDisplay(currencyData, crystalsData) {
        const totalBronzeFromObject = (currencyData?.bronze || 0) + (currencyData?.silver || 0) * 100 + (currencyData?.gold || 0) * 10000;
        const crystals = crystalsData || 0;
        
        const gold = Math.floor(totalBronzeFromObject / 10000);
        let remaining = totalBronzeFromObject % 10000;
        
        const silver = Math.floor(remaining / 100);
        const bronze = remaining % 100;

        this.goldAmountDisplay.textContent = gold;
        this.silverAmountDisplay.textContent = silver;
        this.bronzeAmountDisplay.textContent = bronze;
        this.crystalsAmountDisplay.textContent = crystals;
    }

    processQuestDrop(quest, userProfile) {
        const luck = userProfile.stats?.luck || 10;
        const priority = quest.priority;
        
        // 1. Calculate if a drop occurs at all
        const baseChance = 0.2; // Increased for testing/fun
        const priorityMultipliers = { 'Leicht': 1.0, 'Mittel': 1.2, 'Schwer': 1.5 };
        const multiplier = priorityMultipliers[priority] || 1.0;
        const finalChance = Math.min((baseChance + (luck * 0.01)) * multiplier, 1.0);

        if (Math.random() > finalChance) return; // No drop

        // 2. If drop occurs, determine rarity
        const luckFactor = luck / 100; // e.g., 10 luck = 0.1
        const rarityChances = {
            epic: 0.005 + (luckFactor * 0.005),
            legendary: 0.01 + (luckFactor * 0.01),
            uniq: 0.05 + (luckFactor * 0.05),
            rare: 0.15 + (luckFactor * 0.1),
            magic: 0.30 + (luckFactor * 0.1),
            common: 1.0
        };
        
        const roll = Math.random();
        let chosenRarity = 'common';
        if (roll < rarityChances.epic) chosenRarity = 'epic';
        else if (roll < rarityChances.legendary) chosenRarity = 'legendary';
        else if (roll < rarityChances.uniq) chosenRarity = 'uniq';
        else if (roll < rarityChances.rare) chosenRarity = 'rare';
        else if (roll < rarityChances.magic) chosenRarity = 'magic';

        // 3. Find an item of that rarity (excluding pets)
        const possibleItems = this.config.itemDatabase.filter(item => item.rarity === chosenRarity && item.type !== 'pet');
        if (possibleItems.length > 0) {
            const droppedItem = possibleItems[Math.floor(Math.random() * possibleItems.length)];
            this._showItemFoundPopup(droppedItem);
        }
    }

    _showItemFoundPopup(item) {
        this.currentItemFound = item;
        this.modalItemIcon.textContent = item.icon;
        this.modalItemName.textContent = item.name;
        const rarity = this.config.rarityTiers[item.rarity] || this.config.rarityTiers.common;
        this.modalItemName.className = `font-bold mb-4 ${rarity.color}`;
        this.itemFoundModal.classList.remove('hidden');
    }

    async _handleKeepItem() {
        await this.inventoryManager.addItemToInventory(this.currentUser.uid, this.currentItemFound);
        this.showNotification(`${this.currentItemFound.name} zum Inventar hinzugefügt.`, 'success');
        this.itemFoundModal.classList.add('hidden');
        this.currentItemFound = null;
    }

    _handleDiscardItem() {
        this.showNotification(`${this.currentItemFound.name} verworfen.`, 'info');
        this.itemFoundModal.classList.add('hidden');
        this.currentItemFound = null;
    }

    async handleTimerCompletion(questId) {
        if (questId) {
            this.showNotification("Quest-Timer abgelaufen! Schließe die Quest ab.", "success");
            // Optional: Automatically complete the quest
            // await this.questManager._handleQuestCompletion(questId);
        } else {
            this.showNotification("Timer abgelaufen!", "info");
        }
    }

    showDeleteConfirm(message, onConfirm) {
        this.deleteConfirmText.textContent = message;
        this.onDeleteConfirmCallback = onConfirm;
        this.deleteConfirmModal.classList.remove('hidden');
    }


    /**
     * Zeigt eine Benachrichtigung an. Diese Funktion wird an Module weitergegeben.
     * @param {string} message - Die anzuzeigende Nachricht.
     * @param {string} type - 'info', 'success', oder 'error'.
     * @param {number} duration - Anzeigedauer in Millisekunden.
     */
    showNotification(message, type = 'info', duration = 3000) {
        const colors = { 'info': 'bg-blue-500', 'success': 'bg-green-500', 'error': 'bg-red-500' };
        this.notificationArea.textContent = message;
        this.notificationArea.className = `fixed top-5 right-5 text-white p-3 rounded-lg shadow-lg transition-opacity duration-500 z-50 ${colors[type] || colors.info}`;
        this.notificationArea.style.opacity = '1';
        setTimeout(() => { this.notificationArea.style.opacity = '0'; }, duration);
    }

     /**
      * Fügt eine eindeutige, sichtbare ID zu jedem div-Element hinzu.
      * Dies dient der einfachen Identifizierung von UI-Komponenten.
      * @private
      */
    _injectUiIds() {
        console.log("Injecting UI-IDs into major UI containers...");

        // Explizite Liste der wichtigsten Container, um Stabilität zu gewährleisten
        const selectors = [
            '#main-menu-container', '#main-content-container', '#character-sidebar',
            '#gantt-chart-container', '#focus-quest-container',
            '#my-quests-modal', '#new-quest-modal', '#equipment-modal', '#inventory-modal',
            '#pets-modal', '#skill-tree-modal', '#test-tools-modal', '#achievements-modal',
            '#ui-block-player-info', '#ui-block-character-stats', '#sidebar-derived-stats'
        ];

        selectors.forEach((selector, index) => {
            const element = document.querySelector(selector);
            if (element && !element.dataset.uiId) {
                element.dataset.uiId = index;

                if (window.getComputedStyle(element).position === 'static') {
                    element.style.position = 'relative';
                }

                // Standardmäßig unten rechts, aber für Gantt oben rechts
                let idStyle = 'color: #ffd700; background-color: rgba(0,0,0,0.7); padding: 0 2px; border-radius: 2px; font-size: 7px; line-height: 1; z-index: 9999; position: absolute; right: 0;';
                if (selector === '#gantt-chart-container') {
                    idStyle += 'top: 0;';
                } else {
                    idStyle += 'bottom: 0;';
                }

                const idElement = document.createElement('span');
                idElement.textContent = `UI-ID#${index}`;
                idElement.className = 'ui-id-label';
                idElement.style.cssText = idStyle;
                idElement.onclick = (e) => e.stopPropagation();
                element.appendChild(idElement);
            }
        });
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new GamificationApp();
    app.init();
});
