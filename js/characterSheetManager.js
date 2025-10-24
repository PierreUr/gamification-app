import { doc, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

export class CharacterSheetManager {
    constructor(db, auth) {
        this.db = db;
        this.auth = auth;

        // Konfiguration für Berechnungen
        this.vitalityToHpCaps = [{ threshold: 0, multiplier: 10 }, { threshold: 10, multiplier: 15 }, { threshold: 20, multiplier: 20 }];
        this.intToManaMultiplier = 8;
        this.staminaToValueMultiplier = 10;
        this.baseMana = 20;
        
        // DOM-Elemente direkt im Konstruktor initialisieren
        this.characterNameDisplay = document.getElementById('character-name');
        this.characterLevelDisplay = document.getElementById('character-level');
        this.hpBarFill = document.getElementById('hp-bar-fill');
        this.hpBarText = document.getElementById('hp-bar-text');
        this.manaBarFill = document.getElementById('mana-bar-fill');
        this.manaBarText = document.getElementById('mana-bar-text');
        this.staminaBarFill = document.getElementById('stamina-bar-fill');
        this.staminaBarText = document.getElementById('stamina-bar-text');
        this.xpBarProgress = document.getElementById('xp-bar-progress');
        this.xpCurrentInLevel = document.getElementById('xp-current-in-level');
        this.xpNeededForLevel = document.getElementById('xp-needed-for-level');
        this.statPointsContainer = document.getElementById('div-2700');
        this.statPointsDisplayFooter = document.getElementById('stat-points-display-footer');
        this.statsContainer = document.getElementById('div-2500');
        this.derivedStatPhysDmg = document.getElementById('derived-stat-phys-dmg');
        this.derivedStatDef = document.getElementById('derived-stat-def');
        this.derivedStatDodge = document.getElementById('derived-stat-dodge');
        this.derivedStatEleDmg = document.getElementById('derived-stat-ele-dmg');
    }

    updateUserData(user, userProfile) {
        if (!userProfile || !this.characterNameDisplay) return; // Guard clause

        // 1. Berechne die kombinierten Stats von Charakter und Ausrüstung.
        const totalCharacterStats = { ...(userProfile.stats || {}) };
        if (userProfile.equipment) {
            Object.values(userProfile.equipment).forEach(item => {
                if (item && item.bonuses) {
                    Object.entries(item.bonuses).forEach(([stat, value]) => {
                        totalCharacterStats[stat] = (totalCharacterStats[stat] || 0) + value;
                    });
                }
            });
        }

        // 2. UI-UPDATE
        this.characterNameDisplay.textContent = this.auth.currentUser?.uid.substring(0, 8);
        this.characterLevelDisplay.textContent = userProfile.level || 1;

        // HP, Mana, Stamina
        const maxHp = this._calculateMaxHp(totalCharacterStats.vitality || 0);
        const currentHp = Math.min(userProfile.hp?.current || maxHp, maxHp);
        this.hpBarFill.style.width = `${maxHp > 0 ? (currentHp / maxHp) * 100 : 0}%`;
        this.hpBarText.textContent = `${Math.round(currentHp)} / ${maxHp}`;

        const maxMana = this._calculateMaxMana(totalCharacterStats.int || 0);
        const currentMana = Math.min(userProfile.mana?.current || maxMana, maxMana);
        this.manaBarFill.style.width = `${maxMana > 0 ? (currentMana / maxMana) * 100 : 0}%`;
        this.manaBarText.textContent = `${Math.round(currentMana)} / ${maxMana}`;

        const maxStamina = this._calculateMaxStamina(totalCharacterStats.stamina || 0);
        const currentStamina = Math.min(userProfile.stamina?.current || maxStamina, maxStamina);
        this.staminaBarFill.style.width = `${maxStamina > 0 ? (currentStamina / maxStamina) * 100 : 0}%`;
        this.staminaBarText.textContent = `${Math.round(currentStamina)} / ${maxStamina}`;

        // XP
        const currentLevel = userProfile.level || 1;
        const getXpForLevel = (level) => (level - 1) * 100;
        const xpNeededInTotal = getXpForLevel(currentLevel + 1) - getXpForLevel(currentLevel);
        const xpProgressInLevel = (userProfile.xp || 0) - getXpForLevel(currentLevel);
        this.xpBarProgress.style.width = `${xpNeededInTotal > 0 ? (xpProgressInLevel / xpNeededInTotal) * 100 : 0}%`;
        this.xpCurrentInLevel.textContent = xpProgressInLevel;
        this.xpNeededForLevel.textContent = xpNeededInTotal;

        // Attribute
        Object.keys(userProfile.stats || {}).forEach(stat => {
            const el = document.getElementById(`stat-${stat}`);
            if (el) el.textContent = totalCharacterStats[stat] || 0;
        });

        // Attributpunkte
        const currentStatPoints = userProfile.statPoints || 0;
        this.statPointsDisplayFooter.textContent = currentStatPoints;
        this.statPointsContainer.classList.toggle('hidden', currentStatPoints <= 0);
        document.querySelectorAll('.stat-increase-btn').forEach(el => {
            const amount = parseInt(el.dataset.amount || '1', 10);
            el.classList.toggle('hidden', currentStatPoints < amount);
        });

        // Abgeleitete Werte
        this.derivedStatPhysDmg.textContent = ((totalCharacterStats.strength || 0) * 0.5).toFixed(1);
        this.derivedStatDef.textContent = ((totalCharacterStats.strength || 0) * 0.1).toFixed(1);
        this.derivedStatDodge.textContent = `${((totalCharacterStats.agility || 0) * 0.05).toFixed(1)}%`;
        this.derivedStatEleDmg.textContent = `${((totalCharacterStats.int || 0) * 0.05).toFixed(1)}`;
    }

    _calculateMaxHp(vitality) {
        let maxHp = 100;
        let pointsToCalculate = vitality;
        for (let i = this.vitalityToHpCaps.length - 1; i >= 0; i--) {
            const cap = this.vitalityToHpCaps[i];
            if (pointsToCalculate > cap.threshold) {
                maxHp += (pointsToCalculate - cap.threshold) * cap.multiplier;
                pointsToCalculate = cap.threshold;
            }
        }
        return maxHp;
    }

    _calculateMaxMana(intelligence) {
        return this.baseMana + (intelligence * this.intToManaMultiplier);
    }

    _calculateMaxStamina(stamina) {
        return stamina * this.staminaToValueMultiplier;
    }

    _attachEventListeners() {
        this.statsContainer.addEventListener('click', async (event) => {
            const target = event.target.closest('.stat-increase-btn');
            const userId = this.auth.currentUser?.uid;
            if (!userId || !target) return;

            const statToIncrease = target.dataset.stat;
            const amount = parseInt(target.dataset.amount || '1', 10);

            const userDocRef = doc(this.db, 'users', userId);
            const userDoc = await getDoc(userDocRef);
            const userProfile = userDoc.data();

            if ((userProfile.statPoints || 0) < amount) return;

            try {
                if (statToIncrease === 'vitality') {
                    const baseVitality = userProfile.stats.vitality || 10;
                    let hpGained = 0;
                    for (let i = 0; i < amount; i++) {
                        hpGained += this._calculateMaxHp(baseVitality + i + 1) - this._calculateMaxHp(baseVitality + i);
                    }
                    await updateDoc(userDocRef, {
                        statPoints: increment(-amount),
                        'stats.vitality': increment(amount),
                        'hp.current': increment(hpGained),
                        'hp.max': increment(hpGained)
                    });
                } else if (statToIncrease === 'int') {
                    const manaGained = this.intToManaMultiplier * amount;
                    await updateDoc(userDocRef, {
                        statPoints: increment(-amount),
                        'stats.int': increment(amount),
                        'mana.current': increment(manaGained),
                        'mana.max': increment(manaGained)
                    });
                } else if (statToIncrease === 'stamina') {
                    const staminaGained = this.staminaToValueMultiplier * amount;
                    await updateDoc(userDocRef, {
                        statPoints: increment(-amount),
                        'stats.stamina': increment(amount),
                        'stamina.current': increment(staminaGained),
                        'stamina.max': increment(staminaGained)
                    });
                } else {
                    await updateDoc(userDocRef, {
                        statPoints: increment(-amount),
                        [`stats.${statToIncrease}`]: increment(amount)
                    });
                }
            } catch (error) {
                console.error("Error updating stats:", error);
            }
        });
    }
}
