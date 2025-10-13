/**
 * Modal Manager
 * Handles global modal behaviors like dragging and closing with ESC.
 */
export class ModalManager {
    constructor() {
        this.init();
    }

    init() {
        this._attachGlobalKeyListeners();
        this._attachDragListenersToAllModals();
    }

    _attachDragListeners() {
        this.allModals.forEach(modal => {
            const header = modal.querySelector('.modal-header');
            if (header) {
                let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
                header.onmousedown = (e) => {
                    e.preventDefault();
                    pos3 = e.clientX;
                    pos4 = e.clientY;
                    // Bring the clicked modal to the front
                    this.allModals.forEach(m => m.style.zIndex = 40);
                    modal.style.zIndex = 41;

                    document.onmouseup = () => {
                        document.onmouseup = null;
                        document.onmousemove = null;
                    };
                    document.onmousemove = (e) => {
                        e.preventDefault();
                        pos1 = pos3 - e.clientX;
                        pos2 = pos4 - e.clientY;
                        pos3 = e.clientX;
                        pos4 = e.clientY;
                        modal.style.top = (modal.offsetTop - pos2) + "px";
                        modal.style.left = (modal.offsetLeft - pos1) + "px";
                    };
                };
            }
        });
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
}