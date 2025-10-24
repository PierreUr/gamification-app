import { collection, query, onSnapshot, orderBy } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

export class JournalManager {
    constructor(db) {
        this.db = db;
        this.currentUser = null;
        this.journalUnsubscribe = null;

        // DOM Elements
        this.journalModal = document.getElementById('div-1130');
        this.journalListContainer = document.getElementById('div-1132');
        this.openBtn = document.getElementById('menu-btn-journal');
        this.closeBtn = this.journalModal?.querySelector('.modal-close-btn');
    }

    updateUserData(user, userProfile) {
        if (this.currentUser?.uid !== user?.uid) {
            this.currentUser = user;
            if (user) {
                this._listenToJournal(user.uid);
            } else {
                if (this.journalUnsubscribe) this.journalUnsubscribe();
                this._renderJournal([]);
            }
        }
    }

    _listenToJournal(userId) {
        if (this.journalUnsubscribe) this.journalUnsubscribe();
        const journalRef = collection(this.db, 'users', userId, 'journal');
        const q = query(journalRef, orderBy('completedAt', 'desc'));

        this.journalUnsubscribe = onSnapshot(q, (snapshot) => {
            const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this._renderJournal(entries);
        });
    }

    _renderJournal(entries) {
        if (!this.journalListContainer) return;

        if (entries.length === 0) {
            this.journalListContainer.innerHTML = '<p class="text-gray-400 text-center">Noch keine Quests erledigt.</p>';
            return;
        }

        this.journalListContainer.innerHTML = entries.map(entry => {
            const completedDate = entry.completedAt?.toDate().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) || 'Unbekannt';
            return `
                <div class="p-2 bg-gray-700 rounded-lg text-sm">
                    <p class="font-semibold text-gray-300">${entry.text}</p>
                    <p class="text-xs text-gray-500">Abgeschlossen am: ${completedDate}</p>
                </div>
            `;
        }).join('');
    }

    _attachEventListeners() {
        if (this.openBtn) this.openBtn.addEventListener('click', () => this.journalModal.classList.remove('hidden'));
        if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.journalModal.classList.add('hidden'));
    }
}