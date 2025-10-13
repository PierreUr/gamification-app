/**
 * Timer Functions (Break Timer, Pomodoro, etc.)
 */

import { modalManager } from './modalManager.js';
import { formatTime, showNotification } from './utils.js';

export class TimerManager {
    constructor() {
        this.breakTimerInterval = null;
        this.breakTimeRemaining = 0;
        this.isBreakTimerActive = false;
    }

    showBreakTimer(duration = 300) {
        this.breakTimeRemaining = duration;
        this.isBreakTimerActive = true;
        
        const content = `
            <div class="break-timer-display" id="break-timer-display">
                ${formatTime(this.breakTimeRemaining)}
            </div>
            <div class="break-timer-buttons">
                <button id="start-break-btn" class="modal-close-btn" style="background: #10b981;">Start</button>
                <button id="pause-break-btn" class="modal-close-btn" style="background: #f59e0b;">Pause</button>
                <button id="minimize-break-btn" class="modal-close-btn" style="background: #6366f1;">Minimieren</button>
            </div>
        `;
        
        modalManager.showModal('break-timer', 'Pausentimer', content, {
            width: '400px',
            closeOnBackdrop: false,
            onOpen: (modal) => this.attachBreakTimerListeners(modal)
        });
    }

    attachBreakTimerListeners(modal) {
        const startBtn = modal.querySelector('#start-break-btn');
        const pauseBtn = modal.querySelector('#pause-break-btn');
        const minimizeBtn = modal.querySelector('#minimize-break-btn');
        
        startBtn.addEventListener('click', () => this.startBreakTimer());
        pauseBtn.addEventListener('click', () => this.pauseBreakTimer());
        minimizeBtn.addEventListener('click', () => this.minimizeBreakTimer());
    }

    startBreakTimer() {
        if (this.breakTimerInterval) return;
        
        this.breakTimerInterval = setInterval(() => {
            this.breakTimeRemaining--;
            this.updateBreakTimerDisplay();
            
            if (this.breakTimeRemaining <= 0) {
                this.stopBreakTimer();
                showNotification('Pause beendet!', 'success');
                modalManager.closeModal('break-timer');
            }
        }, 1000);
    }

    pauseBreakTimer() {
        if (this.breakTimerInterval) {
            clearInterval(this.breakTimerInterval);
            this.breakTimerInterval = null;
        }
    }

    stopBreakTimer() {
        this.pauseBreakTimer();
        this.breakTimeRemaining = 0;
        this.isBreakTimerActive = false;
    }

    updateBreakTimerDisplay() {
        const display = document.getElementById('break-timer-display');
        if (display) {
            display.textContent = formatTime(this.breakTimeRemaining);
        }
        
        const minimizedDisplay = document.getElementById('minimized-break-timer-display');
        if (minimizedDisplay) {
            minimizedDisplay.textContent = formatTime(this.breakTimeRemaining);
        }
    }

    minimizeBreakTimer() {
        modalManager.closeModal('break-timer');
        const minimizedTimer = document.getElementById('minimized-break-timer');
        minimizedTimer.classList.remove('hidden');
    }
}
