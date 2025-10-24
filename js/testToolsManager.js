import { doc, updateDoc, increment, getDoc, runTransaction, addDoc, collection, serverTimestamp, Timestamp, writeBatch } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

export class TestToolsManager {
    constructor(db, auth, showNotificationCallback, config, handleXpGainCallback, questManager, timerManager, ganttManager) {
        this.db = db;
        this.auth = auth;
        this.showNotification = showNotificationCallback;
        this.achievementDatabase = config.achievementDatabase;
        this.timerManager = timerManager;
        this.ganttManager = ganttManager;
        this.handleXpGain = handleXpGainCallback;
        this.questManager = questManager;
        
        this.currentUser = null;
        this.userProfile = null;

        // New DB Query Tool elements
        this.dbPathSelect = document.getElementById('db-path-select');
        this.dbQueryBtn = document.getElementById('test-db-query-btn');
    }

    updateUserData(user, userProfile) {
        this.currentUser = user;
        this.userProfile = userProfile;
    }

    async _gainPetXp(petId, amount) {
        const userId = this.currentUser?.uid;
        if (!userId || !petId) return;
        const userDocRef = doc(this.db, 'users', userId);
        try {
            await runTransaction(this.db, async (transaction) => {
                const userDoc = await transaction.get(userDocRef);
                if (!userDoc.exists()) throw "User document does not exist!";

                const userData = userDoc.data();
                let pet = userData.pets?.[petId];
                if (!pet) throw `Pet with ID ${petId} not found!`;

                pet.xp += amount;
                let leveledUp = false;
                while (pet.xp >= pet.maxXp) {
                    leveledUp = true;
                    pet.xp -= pet.maxXp;
                    pet.level += 1;
                    pet.maxXp = pet.level * 100;
                    const possibleStats = Object.keys(pet.currentStats);
                    if (possibleStats.length > 0) {
                        const randomStat = possibleStats[Math.floor(Math.random() * possibleStats.length)];
                        pet.currentStats[randomStat] += 1;
                    }
                }

                transaction.update(userDocRef, { [`pets.${petId}`]: pet });

                if (leveledUp) {
                    this.showNotification(`${pet.name} ist auf Level ${pet.level} aufgestiegen!`, "success");
                }
            });
        } catch (error) {
            console.error("Pet XP Transaction failed: ", error);
        }
    }

    _attachEventListeners() {
        this.modal = document.getElementById('div-5100');
        this.openBtn = document.getElementById('menu-btn-test-tools');
        this.closeBtn = this.modal.querySelector('.modal-close-btn');

        this._loadDbPaths();

        this.openBtn.addEventListener('click', () => this.modal.classList.remove('hidden'));
        this.closeBtn.addEventListener('click', () => this.modal.classList.add('hidden'));

        this.modal.addEventListener('click', async (e) => {
            const button = e.target.closest('button.test-btn');
            if (!button || !this.currentUser) return;

            const userId = this.currentUser.uid;

            if (button.id === 'test-levelup-btn') {
                if (this.handleXpGain) this.handleXpGain(userId, 100);
            } else if (button.id === 'test-add-bronze-btn') {
                await updateDoc(doc(this.db, 'users', userId), { 'currency.bronze': increment(125) });
                this.showNotification("+125 Bronze hinzugefügt.");
            } else if (button.id === 'toggle-ui-borders-btn') {
                document.body.classList.toggle('debug-borders-active');
            } else if (button.id === 'test-add-hp-btn' || button.id === 'test-add-mana-btn') {
                const isHp = button.id === 'test-add-hp-btn';
                const type = isHp ? 'hp' : 'mana';
                await updateDoc(doc(this.db, 'users', userId), { [`${type}.current`]: increment(50) });
                this.showNotification(`+50 ${isHp ? 'HP' : 'Mana'} hinzugefügt.`);
            } else if (button.id === 'test-add-break-bars-btn') {
                console.log("Test-Button 'Pausenbalken hinzufügen' wurde geklickt.");
                if (!this.ganttManager) {
                    console.error("GanttManager konnte im TestToolsManager nicht gefunden werden.");
                    return;
                }
                const testSettings = {
                    startTime: '09:00',
                    workInterval: 45,
                    shortBreak: 5,
                    longBreak: 30,
                    longBreakInterval: 4
                };
                this.ganttManager.renderPomodoroGrid(testSettings);
                this.showNotification('Pomodoro-Testraster wurde generiert und gerendert.', 'success');
            } else if (button.id === 'test-db-query-btn') {
                const path = this.dbPathSelect.value;
                if (path) this._queryDbValue(path);
            } else if (button.id === 'test-delete-breaks-btn') {
                if (!this.ganttManager) return;
                this.ganttManager.pomodoroBreaks = [];
                this.ganttManager.pomodoroSchedule = [];
                this.ganttManager.render(this.ganttManager.localQuests);
                this.showNotification("Alle Test-Pausen und Zeitpläne wurden entfernt.", "info");
            } else if (button.id === 'test-date-plus-one-day-btn' || button.id === 'test-date-today-btn') {
                if (!this.ganttManager) return;
                const isToday = button.id === 'test-date-today-btn';
                const newDate = new Date(this.ganttManager.currentGanttDate);
                if (isToday) {
                    this.ganttManager.currentGanttDate = new Date();
                } else {
                    newDate.setDate(newDate.getDate() + 1);
                    this.ganttManager.currentGanttDate = newDate;
                }
                this.ganttManager.render(this.ganttManager.localQuests);
                this.showNotification(`Gantt-Datum auf ${this.ganttManager.currentGanttDate.toLocaleDateString()} gesetzt.`, "success");
            }
        });

        document.getElementById('test-add-today-quests-btn').addEventListener('click', async () => {
            if (!this.currentUser || !this.questManager) return;
            
            const questsToSchedule = this.questManager.localQuests.slice(0, 5);
            if (questsToSchedule.length === 0) {
                this.showNotification("Keine Quests zum Planen vorhanden.", "info");
                return;
            }

            this.showNotification(`Setze ${questsToSchedule.length} Quests auf heute...`);
            const batch = writeBatch(this.db);
            const today = new Date();
            questsToSchedule.forEach(quest => {
                const questRef = doc(this.db, 'todos', quest.id);
                batch.update(questRef, { ganttScheduledAt: Timestamp.fromDate(today) });
            });
            await batch.commit();
        });

        // Other listeners that are less critical for the Firebase error
        document.getElementById('test-gain-pet-xp-btn').addEventListener('click', () => {
            if (this.userProfile?.activePets?.length > 0) {
                const petId = this.userProfile.activePets[0];
                if (petId) {
                    this._gainPetXp(petId, 50);
                    this.showNotification(`+50 XP für ${this.userProfile.pets[petId].name} hinzugefügt.`);
                }
            } else {
                this.showNotification("Kein aktives Pet zum Trainieren ausgewählt.", "error");
            }
        });

        document.getElementById('test-simulate-drop-btn').addEventListener('click', () => {
            if (!this.currentUser || !this.questManager?.processQuestDrop) {
                this.showNotification("Drop-System nicht bereit.", "error");
                return;
            }
            this.showNotification("Simuliere Drop...", "info");
            const dummyQuest = { priority: 'Mittel' };
            this.questManager.processQuestDrop(dummyQuest, this.userProfile);
        });

        const testFocusTimerBtn = document.getElementById('test-focus-timer-btn');
        if (testFocusTimerBtn && this.timerManager) {
            testFocusTimerBtn.addEventListener('click', () => {
                if (this.timerManager.isBreakActive) {
                    this.timerManager.setBreakTimer(1);
                    this.showNotification("Pausen-Timer auf 1 Sekunde gesetzt.", "info");
                } else {
                    this.timerManager.setQuestTimer(1);
                    this.showNotification("Fokus-Timer auf 1 Sekunde gesetzt.", "info");
                }
            });
        }

        const fastForwardTimerBtn = document.getElementById('test-timer-ff-btn');
        if (fastForwardTimerBtn && this.timerManager) {
            fastForwardTimerBtn.addEventListener('click', () => {
                if (this.timerManager.questTimer.isRunning) {
                    const newTime = Math.max(0, this.timerManager.questTimer.timeLeft - (44 * 60 + 57));
                    this.timerManager.setQuestTimer(newTime);
                    this.showNotification("Timer um 44:57 vorgespult.", "info");
                }
            });
        }

        document.getElementById('test-complete-all-quests-btn').addEventListener('click', async () => {
            if (!this.currentUser || !this.questManager || this.questManager.localQuests.length === 0) {
                this.showNotification("Keine Quests zum Erledigen vorhanden.", "info");
                return;
            }
            this.showNotification("Erledige alle Quests...", "info");
            const questsToComplete = [...this.questManager.localQuests];
            const completionPromises = questsToComplete.map(quest => this.questManager._handleQuestCompletion(quest.id));
            await Promise.all(completionPromises);
            this.showNotification("Alle Quests wurden erledigt!", "success");
        });
    }

    async _loadDbPaths() {
        try {
            // In a real app, this would be a fetch to a file. For this context, we hardcode it.
            const paths = [
                "level", "xp", "statPoints", "skillPoints", "currency.bronze", "currency.silver",
                "currency.gold", "crystals", "stats.strength", "stats.vitality", "stats.agility",
                "stats.int", "stats.stamina", "stats.luck", "pomodoroSettings.longBreakDuration",
                "pomodoroSettings.startTime", "pomodoroSettings.workInterval", "pomodoroSettings.initialBreakMinutes"
            ];
            this.dbPathSelect.innerHTML = paths.map(p => `<option value="${p}">${p}</option>`).join('');
        } catch (error) {
            console.error("Could not load DB paths for test tool:", error);
            this.dbPathSelect.innerHTML = '<option>Fehler beim Laden</option>';
        }
    }

    _queryDbValue(path) {
        if (!this.userProfile) {
            this.showNotification("Benutzerprofil nicht geladen.", "error");
            return;
        }
        // Simple object traversal using the dot notation path
        const value = path.split('.').reduce((obj, key) => (obj && obj[key] !== 'undefined') ? obj[key] : undefined, this.userProfile);

        const resultMessage = `Pfad: ${path}\nWert: ${JSON.stringify(value, null, 2)}`;
        
        // Using a simple alert as a popup for this test tool
        alert(resultMessage);

        if (typeof value !== 'undefined') {
            this.showNotification(`Wert für '${path}' gefunden.`, "success");
        } else {
            this.showNotification(`Kein Wert für '${path}' gefunden.`, "info");
        }
    }
}
