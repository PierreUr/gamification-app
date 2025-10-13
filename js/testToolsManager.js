import { doc, updateDoc, increment, getDoc, runTransaction, addDoc, collection, serverTimestamp, Timestamp, writeBatch } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

export class TestToolsManager {
    constructor(db, auth, showNotificationCallback, config, handleXpGainCallback, questManager) {
        this.db = db;
        this.auth = auth;
        this.showNotification = showNotificationCallback;
        this.achievementDatabase = config.achievementDatabase;
        this.handleXpGain = handleXpGainCallback;
        this.questManager = questManager;
        
        this.currentUser = null;
        this.userProfile = null;

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
                    // Simple stat increase on level up
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
        document.getElementById('test-levelup-btn').addEventListener('click', () => {
            if (this.currentUser && this.handleXpGain) this.handleXpGain(this.currentUser.uid, 100);
        });

        document.getElementById('test-add-bronze-btn').addEventListener('click', async () => {
            if (this.currentUser) {
                await updateDoc(doc(this.db, 'users', this.currentUser.uid), { 'currency.bronze': increment(125) });
                this.showNotification("+125 Bronze hinzugefügt.");
            }
        });

        document.getElementById('test-gantt-btn').addEventListener('click', () => {
            const modal = document.getElementById('gantt-test-modal');
            modal.classList.remove('hidden');
            // Add a one-time listener for the close button
            const closeBtn = modal.querySelector('.modal-close-btn');
            closeBtn.onclick = () => modal.classList.add('hidden');
            this.questManager._renderTestGanttChart();
        });


        document.getElementById('test-add-today-quests-btn').addEventListener('click', async () => {
            if (!this.currentUser) return;
            const count = 5;
            const priority = 'Mittel';
            const userId = this.currentUser.uid;
            
            this.showNotification(`Füge ${count} Quests für heute hinzu...`);

            const batch = writeBatch(this.db);
            const today = new Date();
            const deadline = new Date(today);
            deadline.setHours(23, 59, 59, 999);

            for (let i = 0; i < count; i++) {
                const newQuestRef = doc(collection(this.db, 'todos'));
                batch.set(newQuestRef, {
                     userId: userId,
                     text: `Test Quest Heute #${i + 1}`,
                     priority: priority,
                     taskType: 'Aufgabe',
                     tags: ['Test'],
                     createdAt: serverTimestamp(),
                     deadline: Timestamp.fromDate(deadline)
                });
            }
            await batch.commit();
        });

        document.getElementById('test-gain-pet-xp-btn').addEventListener('click', () => {
            if (this.userProfile?.activePets?.length > 0) {
                const petId = this.userProfile.activePets[0]; // Simple: just use the first pet
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
            // Erstelle ein Dummy-Quest-Objekt, um es an die Drop-Funktion zu übergeben
            const dummyQuest = { priority: 'Mittel' }; // 'Mittel' für durchschnittliche Chancen
            this.questManager.processQuestDrop(dummyQuest, this.userProfile);
        });

        document.getElementById('test-complete-all-quests-btn').addEventListener('click', async () => {
            console.log('localQuests in testToolsManager:', this.questManager.localQuests); // DEBUG
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

        document.querySelectorAll('.add-test-quests-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!this.currentUser) return;
                const count = parseInt(btn.dataset.count, 10);
                const priority = btn.dataset.priority;
                const userId = this.currentUser.uid;
                
                this.showNotification(`Füge ${count} ${priority} Quests hinzu...`);

                const batch = writeBatch(this.db);
                const today = new Date();
                const deadline = new Date();
                deadline.setDate(today.getDate() + 7);

                for (let i = 0; i < count; i++) {
                    const newQuestRef = doc(collection(this.db, 'todos'));
                    batch.set(newQuestRef, {
                         userId: userId,
                         text: `Test Quest ${priority} #${i + 1}`,
                         priority: priority,
                         taskType: 'Aufgabe',
                         tags: ['Test'],
                         createdAt: serverTimestamp(),
                         deadline: Timestamp.fromDate(deadline)
                    });
                }
                await batch.commit();
            });
        });
    }
}