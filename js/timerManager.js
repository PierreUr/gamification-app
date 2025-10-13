/**
 * Timer Manager
 * Handles the Pomodoro Timer functionality.
 */
export class TimerManager {
    constructor(showNotificationCallback, onTimerCompleteCallback) {
        this.showNotification = showNotificationCallback;
        this.onTimerComplete = onTimerCompleteCallback;

        // DOM Elements
        // We get these dynamically now as they can be in different places (modal vs focus view)
        this.timerDisplay = null;
        this.timerStartBtn = null;
        this.timerPauseBtn = null;

        // State
        this.timerInterval = null;
        this.timeLeftInSeconds = 25 * 60;
        this.defaultTime = 25 * 60;
        this.isTimerPaused = true;
        this.currentMode = 'Arbeit';
        this.associatedQuestId = null;
    }

    isBusy() {
        return this.timerInterval !== null;
    }

    _formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    _updateDisplay() {
        if (this.timerDisplay) this.timerDisplay.textContent = this._formatTime(this.timeLeftInSeconds);
        // No mode display in focus view
    }

    _startTimer() {
        if (this.timerInterval) return;
        this.isTimerPaused = false;
        this.timerInterval = setInterval(() => {
            this.timeLeftInSeconds--;
            this._updateDisplay();
            if (this.timeLeftInSeconds <= 0) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
                this.showNotification(`Timer für "${this.currentMode}" abgelaufen!`, 'success', 5000);
                // Inform the main app that a timer (and potentially a quest) is done
                if (this.onTimerComplete) this.onTimerComplete(this.associatedQuestId);
                // Here you could trigger a sound or other notifications
            }
        }, 1000);
    }

    _pauseTimer() {
        this.isTimerPaused = true;
        clearInterval(this.timerInterval);
        this.timerInterval = null;
    }

    _resetTimer() {
        this._pauseTimer();
        this.timeLeftInSeconds = this.defaultTime;
        this._updateDisplay();
    }

    startQuestTimer(quest) {
        if (this.isBusy()) {
            this.showNotification("Ein anderer Timer läuft bereits!", "error");
            return;
        }
        this.associatedQuestId = quest.id;
        this.timeLeftInSeconds = quest.durationMinutes * 60;
        this.currentMode = quest.text;

        // Get DOM elements from the focus view
        this.timerDisplay = document.getElementById('focus-timer-display');
        this.timerStartBtn = document.getElementById('focus-timer-start-btn');
        this.timerPauseBtn = document.getElementById('focus-timer-pause-btn');

        this._updateDisplay();
        this._startTimer();
    }

    _attachEventListeners() {
        // We need to use event delegation because the buttons are created dynamically
        document.body.addEventListener('click', (e) => {
            if (e.target.id === 'focus-timer-start-btn') {
                this._startTimer();
            } else if (e.target.id === 'focus-timer-pause-btn') {
                this._pauseTimer();
            }
        });
    }
}