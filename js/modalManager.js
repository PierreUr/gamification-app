import { formatDuration } from './utils.js';

/**
 * Modal Manager
 * Handles global modal behaviors like dragging and closing with ESC.
 */
export class ModalManager {
    constructor(onContinueCallback, onExtendBreakCallback, onEndFocusCallback) {
        this.onDeleteConfirmCallback = null;
        this.breakTimerInterval = null;
        this.onContinueCallback = onContinueCallback;
        this.onExtendBreakCallback = onExtendBreakCallback;
        this.onEndFocusCallback = onEndFocusCallback;
    }

    _attachEventListeners() {
        this._initializeDOMElements();
        this._attachDragListenersToAllModals();
        this._attachGlobalKeyListeners();
        this._attachSpecificModalListeners();
    }

    _initializeDOMElements() {
        this.modals = document.querySelectorAll('.modal');
        if (this.modals.length === 0) {
            console.error("ModalManager: No modal elements found on DOM initialization.");
            return;
        }
        this.deleteConfirmModal = document.getElementById('div-4110');
        this.deleteConfirmText = document.getElementById('delete-confirm-text');
        this.deleteConfirmBtn = document.getElementById('delete-confirm-btn');
        this.deleteCancelBtn = document.getElementById('delete-cancel-btn');

        // Break Popup Elements
        this.breakPopup = document.getElementById('div-4020');
        this.breakTimerDisplay = document.getElementById('div-4022');
        this.closeBreakPopupBtn = document.getElementById('close-break-popup-btn');
        this.continueQuestBtn = document.getElementById('continue-quest-btn');
        this.continueQuestPopup = document.getElementById('div-4030');
        this.minimizedBreakTimer = document.getElementById('div-4040');
    }


    _attachDragListenersToAllModals() {
        // Use event delegation on the body to handle mousedown on any modal header
        document.body.addEventListener('mousedown', (e) => {
            const header = e.target.closest('.modal-header');
            if (!header) return;

            const modal = header.closest('.modal');
            if (!modal) return;

            e.preventDefault();

            let pos1 = 0, pos2 = 0, pos3 = e.clientX, pos4 = e.clientY;

            // Bring the clicked modal to the front
            document.querySelectorAll('.modal').forEach(m => m.style.zIndex = 40);
            modal.style.zIndex = 41;

            const onMouseMove = (e) => {
                e.preventDefault();
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
                modal.style.top = (modal.offsetTop - pos2) + "px";
                modal.style.left = (modal.offsetLeft - pos1) + "px";
            };

            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }

    _attachGlobalKeyListeners() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const visibleModals = Array.from(document.querySelectorAll('.modal')).filter(m => !m.classList.contains('hidden'));
                if (visibleModals.length > 0) {
                    // Find the top-most modal and close it
                    const topModal = visibleModals.sort((a, b) => (parseInt(b.style.zIndex) || 40) - (parseInt(a.style.zIndex) || 40))[0];
                    topModal.classList.add('hidden');
                }
            }
        });
    }

     _attachSpecificModalListeners() {
        if (this.closeBreakPopupBtn) {
            this.closeBreakPopupBtn.addEventListener('click', () => {
                this.breakPopup.classList.add('hidden');
            });
        }

        if (this.continueQuestPopup) {
            this.continueQuestPopup.addEventListener('click', (e) => {
                if (e.target.id === 'continue-quest-btn' || e.target.id === 'end-focus-btn' || e.target.closest('#continue-quest-btn') || e.target.closest('#end-focus-btn')) {
                    this.continueQuestPopup.classList.add('hidden');
                    if (e.target.id === 'continue-quest-btn' && this.onContinueCallback) {
                        this.onContinueCallback();
                    } else if (e.target.id === 'end-focus-btn' && this.onEndFocusCallback) {
                        this.onEndFocusCallback();
                    }
                }
            });
        }

        if (this.breakPopup) {
            this.breakPopup.addEventListener('click', (e) => {
                const extendBtn = e.target.closest('[data-extend-break]'); // Use closest to handle clicks on child elements
                if (extendBtn && this.onExtendBreakCallback) {
                    this.onExtendBreakCallback(parseInt(extendBtn.dataset.extendBreak, 10));
                }
            });
        }

    }

    showDeleteConfirm(message, onConfirm) {
        if (!this.deleteConfirmModal) return; // Add guard clause
        this.onDeleteConfirmCallback = onConfirm;
        this.deleteConfirmText.textContent = message;
        this.deleteConfirmModal.classList.remove('hidden');
    }

    showBreakPopup(durationInSeconds) {
        if (!this.breakPopup || !this.breakTimerDisplay) {
            console.error("Break popup elements not found in modalManager.");
            return;
        }
        this.breakTimerDisplay.innerHTML = formatDuration(durationInSeconds, false, true).replace('text-5xl', 'text-7xl').replace('text-lg', 'text-2xl');
        this.breakPopup.classList.remove('hidden');
    }

    hideBreakPopup() {
        if (this.breakPopup) {
            this.minimizedBreakTimer.classList.remove('hidden');
            this.breakPopup.classList.add('hidden');
        }
    }

    showContinuePopup() {
        if (this.continueQuestPopup) {
            this.continueQuestPopup.classList.remove('hidden');
            this.minimizedBreakTimer.classList.add('hidden');
        }
    }

    updateBreakPopupTime(timeLeft) {
        if (this.breakPopup && !this.breakPopup.classList.contains('hidden')) {
            this.breakTimerDisplay.innerHTML = formatDuration(timeLeft, false, true).replace('text-5xl', 'text-7xl').replace('text-lg', 'text-2xl');
        }
    }
}
