import { formatDuration } from './utils.js';

/**
 * Timer Manager
 * Handles the Pomodoro Timer functionality.
 */
export class TimerManager {
    constructor(showNotificationCallback, onTimerCompleteCallback, modalManager) {
        this.showNotification = showNotificationCallback; // General notifications
        this.onTimerComplete = onTimerCompleteCallback; // For Pomodoro modal logic
        this.modalManager = modalManager;

        // State
         this.questTimer = {
            interval: null,
            timeLeft: 0, // in seconds
            workSessionTimeLeft: 0, // in seconds, for the 45-min rule
            maxWorkSessionDuration: 45 * 60, // 45 minutes in seconds
            totalDuration: 0,
            questId: null,
            isRunning: false
        };

        this.breakTimer = {
            interval: null,
            timeLeft: 0,
            isPaused: false,
            isRunning: false
        };
    }
    
    setQuestManager(questManager) {
        // This is called from main.js after all managers are instantiated
        this.questManager = questManager;
    }

    prepareQuestTimer(questId, durationMinutes) {
        // If a timer for another quest was running, stop it.
        if (this.questTimer.questId && this.questTimer.questId !== questId) {
            this.stopQuestTimer();
        }
        this.questTimer.questId = questId;
        this.questTimer.totalDuration = durationMinutes * 60;
        this.questTimer.timeLeft = this.questTimer.totalDuration;
        this.questTimer.isPaused = true;
        this.questTimer.isRunning = false;
    }

    pauseQuestTimer() {
        if (this.questTimer.interval) {
            clearInterval(this.questTimer.interval);
            this.questTimer.interval = null; // Important to clear the interval ID
            this.questTimer.isRunning = false;
            this.questTimer.isPaused = true;
        }
    }

    stopQuestTimer() {
        this.pauseQuestTimer();
        this.questTimer.questId = null;
        this.questTimer.timeLeft = 0;
        this.questTimer.totalDuration = 0;
    }

    isQuestTimerRunning(questId) {
        return this.questTimer.questId === questId && this.questTimer.isRunning;
    }

    startBreak(minutes) {
        this.breakTimer.timeLeft = minutes * 60;
        this.isBreakActive = true;
        this.breakTimer.isRunning = true;
        this.modalManager.showBreakPopup(this.breakTimer.timeLeft);
        this._emitTimerComplete(); // Notify that the work session is over

        if (this.breakTimer.interval) clearInterval(this.breakTimer.interval);
        this.breakTimer.interval = setInterval(() => {
            this.breakTimer.timeLeft--;
            this._emitBreakTimerUpdate();

            if (this.breakTimer.timeLeft < 0) {
                clearInterval(this.breakTimer.interval);
                this.breakTimer.isRunning = false;
                this.isBreakActive = false;
                this.modalManager.hideBreakPopup();
                this.modalManager.showContinuePopup();
            }
        }, 1000);
    }

    extendBreak(minutes) {
        this.breakTimer.timeLeft = minutes * 60;
        this._emitBreakTimerUpdate(); // Update UI immediately
        // No need to restart the interval, as it's already running and will pick up the new timeLeft.
        this.showNotification(`Pause auf ${minutes} Minuten gesetzt.`, "info");
    }

    continueQuestTimer() {
        const quest = this.questManager?.localQuests.find(q => q.id === this.questTimer.questId);
        if (!quest) return;
        // When continuing, we don't reset the total duration. We just start a new session.
        // The timeLeft is already correct from the previous session.
        this.isBreakActive = false; // Break is over
        this.startQuestTimer(); // Automatically start the timer again
    }

    setBreakTimer(seconds) {
        this.breakTimer.timeLeft = seconds;
        this._emitBreakTimerUpdate();
    }

    setQuestTimer(seconds) {
        this.questTimer.timeLeft = seconds;
        this._emitTimerUpdate();
    }

    _emitTimerUpdate() {
        const event = new CustomEvent('questTimerUpdate', { detail: { ...this.questTimer } });
        document.dispatchEvent(event);
    }

    _emitTimerComplete() {
        const event = new CustomEvent('questTimerComplete', { detail: { questId: this.questTimer.questId } });
        document.dispatchEvent(event);
    }

    _emitBreakTimerUpdate() {
        const event = new CustomEvent('breakTimerUpdate', {
            detail: { ...this.breakTimer }
        });
        document.dispatchEvent(event);
    }

    _attachEventListeners() {
        // Currently no listeners needed directly in this manager for the quest timer
        // as it's controlled by QuestManager.
    }
}
