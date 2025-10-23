# Gamification App - JavaScript Dokumentation

Diese Anwendung nutzt eine modulare Architektur, die in verschiedene `Manager`-Klassen unterteilt ist. Jede Manager-Klasse ist für einen bestimmten Teil der Anwendungslogik verantwortlich. `main.js` dient als zentraler Orchestrator, der die Manager initialisiert und die Benutzerauthentifizierung sowie den globalen Status verwaltet.

---

## 1. `main.js` - Der Orchestrator

Diese Datei ist der Haupteinstiegspunkt der Anwendung. Sie initialisiert Firebase, alle Manager-Module und behandelt den globalen Anwendungsstatus.

### Globale Buttons & Interaktionen

- **`#login-btn`**
  - **Beschreibung:** Meldet einen Benutzer anonym an.
  - **Interaktion:** Klick
  - **Logik:** Ruft `signIn()` in `main.js` auf, was `signInAnonymously` von Firebase Auth verwendet. Nach erfolgreicher Anmeldung wird die `handleAuthState`-Logik ausgelöst.

- **`#logout-btn`**
  - **Beschreibung:** Meldet den Benutzer ab und löscht alle zugehörigen Benutzerdaten aus der Datenbank.
  - **Interaktion:** Klick
  - **Logik:** Ruft `deleteUserAndData()` in `main.js` auf. Diese Funktion löscht die Subkollektionen des Benutzers (z.B. `inventory`, `journal`), das Benutzerdokument selbst und ruft schließlich `deleteUser` von Firebase Auth auf.

- **`#modal-keep-btn`** (Item Found Modal)
  - **Beschreibung:** Behält einen gefundenen Gegenstand und fügt ihn dem Inventar hinzu.
  - **Interaktion:** Klick
  - **Logik:** Ruft `_handleKeepItem()` in `main.js` auf. Diese Methode delegiert die Logik an `inventoryManager.addItemToInventory()`.

- **`#modal-discard-btn`** (Item Found Modal)
  - **Beschreibung:** Verwirft einen gefundenen Gegenstand.
  - **Interaktion:** Klick
  - **Logik:** Ruft `_handleDiscardItem()` in `main.js` auf, was eine Benachrichtigung anzeigt und das Modal schließt.

- **`#delete-confirm-btn`** (Delete Confirmation Modal)
  - **Beschreibung:** Bestätigt eine Löschaktion.
  - **Interaktion:** Klick
  - **Logik:** Führt einen zuvor in `main.js` gespeicherten `onDeleteConfirmCallback` aus. Dieser Callback wird von dem Manager gesetzt, der die Bestätigung angefordert hat (z.B. `InventoryManager` beim Verwerfen von Items).

- **`#delete-cancel-btn`** (Delete Confirmation Modal)
  - **Beschreibung:** Bricht eine Löschaktion ab.
  - **Interaktion:** Klick
  - **Logik:** Schließt das Bestätigungsmodal.

---

## 2. `QuestManager` (`questManager.js`)

Verwaltet die Erstellung, Anzeige, den Abschluss und die Interaktion mit Quests.

### Buttons & Interaktionen

- **`#menu-btn-new-quest`**
  - **Beschreibung:** Öffnet das "Neue Quest erstellen"-Modal (Wizard).
  - **Interaktion:** Klick
  - **Logik:** Gesteuert in `_attachEventListeners()`. Setzt den Wizard zurück und zeigt das `#new-quest-modal` an.

- **`#menu-btn-my-quests`**
  - **Beschreibung:** Öffnet das "Meine Quests"-Modal, das alle aktiven Quests anzeigt.
  - **Interaktion:** Klick
  - **Logik:** Gesteuert in `_attachEventListeners()`. Zeigt das `#my-quests-modal` an.

- **`#menu-btn-simple-quest`**
  - **Beschreibung:** Öffnet ein vereinfachtes Modal zum Erstellen einer Test-Quest.
  - **Interaktion:** Klick
  - **Logik:** Gesteuert in `_attachEventListeners()`. Zeigt das `#simple-quest-modal` an.

- **`#simple-quest-form` (Submit)**
  - **Beschreibung:** Erstellt eine einfache Test-Quest.
  - **Interaktion:** Formular-Submit
  - **Logik:** Gesteuert in `_attachEventListeners()`. Erstellt ein neues Dokument in der `todos`-Kollektion in Firestore mit Standardwerten.

- **`#add-todo-form` (Submit)**
  - **Beschreibung:** Erstellt eine detaillierte Quest aus dem Quest-Wizard.
  - **Interaktion:** Formular-Submit
  - **Logik:** Gesteuert in `_attachEventListeners()`. Sammelt alle Daten aus dem Wizard, validiert sie und erstellt ein neues Dokument in der `todos`-Kollektion.

- **`.complete-btn`** (in Quest-Liste und Fokus-Ansicht)
  - **Beschreibung:** Schließt eine Quest ab.
  - **Interaktion:** Klick
  - **Logik:** Ruft `_handleQuestCompletion(questId)` auf. Diese Methode löscht die Quest aus Firestore, vergibt XP und Währung an den Benutzer und triggert das Drop-System.

- **`.delete-btn`**
  - **Beschreibung:** Löscht eine Quest nach Bestätigung.
  - **Interaktion:** Klick
  - **Logik:** Gesteuert in `_attachEventListeners()`. Löscht das Quest-Dokument aus Firestore.

- **`.focus-btn`**
  - **Beschreibung:** Setzt den Fokus auf eine bestimmte Quest und verschiebt deren Deadline auf heute.
  - **Interaktion:** Klick
  - **Logik:** Gesteuert in `_attachEventListeners()`. Setzt `this.focusedQuestId`, aktualisiert die Deadline der Quest in Firestore und rendert die UI neu.

- **`.today-btn`**
  - **Beschreibung:** Setzt die Deadline einer Quest auf den heutigen Tag.
  - **Interaktion:** Klick
  - **Logik:** Gesteuert in `_attachEventListeners()`. Aktualisiert das `deadline`-Feld der Quest in Firestore auf das Ende des aktuellen Tages.

- **`.stop-focus-btn`**
  - **Beschreibung:** Beendet den Fokus auf eine Quest.
  - **Interaktion:** Klick
  - **Logik:** Gesteuert in `_attachEventListeners()`. Setzt `this.focusedQuestId` auf `null` und rendert die UI neu.

---

## 3. `TestToolsManager` (`testToolsManager.js`)

Stellt Schaltflächen und Logik für Test- und Debugging-Zwecke bereit.

### Buttons & Interaktionen

- **`#test-levelup-btn`**: Gibt dem Spieler 100 XP.
- **`#test-add-bronze-btn`**: Fügt dem Spieler 125 Bronze hinzu.
- **`#test-timer-usage-btn`**: Inkrementiert die Anzahl der abgeschlossenen Pomodoro-Timer.
- **`#test-add-today-quests-btn`**: Erstellt 5 Test-Quests mit heutiger Deadline.
- **`#test-complete-all-quests-btn`**: Schließt alle aktuell im `QuestManager` geladenen Quests ab.
- **`#test-simulate-drop-btn`**: Löst die `processQuestDrop`-Logik in `main.js` aus.
- **`#test-gain-pet-xp-btn`**: Gibt dem aktiven Pet 50 XP.
- **`.add-test-quests-btn`**: Erstellt 5 Test-Quests mit einer bestimmten Priorität.

---

## 4. `CharacterSheetManager` (`characterSheetManager.js`)

Verwaltet die Anzeige und Aktualisierung der Charakterwerte in der Seitenleiste.

### Buttons & Interaktionen

- **`.stat-increase-btn`**
  - **Beschreibung:** Erhöht ein Charakter-Attribut (z.B. Stärke, Intelligenz).
  - **Interaktion:** Klick
  - **Logik:** Gesteuert in `_attachEventListeners()`. Zieht einen Attributpunkt ab und erhöht den entsprechenden Stat in Firestore. Berechnet und aktualisiert abgeleitete Werte wie HP und Mana.

---

## 5. `InventoryManager` (`inventoryManager.js`)

Verwaltet das Inventar und die Ausrüstung des Spielers.

### Buttons & Interaktionen

- **`#menu-btn-equipment`**: Öffnet das Ausrüstungs-Modal.
- **`#menu-btn-inventory`**: Öffnet das Inventar-Modal.
- **`#unequip-all-btn`**: Legt alle ausgerüsteten Gegenstände ab (noch nicht implementiert).
- **`.equipment-slot`**: Zeigt Details für einen ausgerüsteten Gegenstand an.
- **`[data-action="unequip"]`**: Legt einen einzelnen Gegenstand ab.
- **`[data-action="equip"]`**: Rüstet einen Gegenstand aus dem Inventar aus.
- **`[data-action="use"]`**: Benutzt einen konsumierbaren Gegenstand (z.B. Trank).
- **`[data-action="delete"]`**: Löscht einen Gegenstand aus dem Inventar.
- **`#use-hp-potion-btn`**: Benutzt einen Heiltrank aus dem Schnellzugriff.
- **`#use-mana-potion-btn`**: Benutzt einen Manatrank aus dem Schnellzugriff.

---

## 6. Weitere Manager

- **`PetManager` (`petManager.js`):** Verwaltet die Interaktionen im "Meine Pets"-Modal, inklusive Aktivieren, Deaktivieren und Vergleichen von Pets.
- **`SkillTreeManager` (`skillTree.js`):** Verwaltet die Logik zum Erlernen und Zurücksetzen von Skills im Skill-Tree-Modal.
- **`TimerManager` (`timerManager.js`):** Steuert die Funktionalität des Pomodoro-Timers, der mit einer Fokus-Quest verbunden sein kann.
- **`ModalManager` (`modalManager.js`):** Stellt globale Funktionalität für alle Modals bereit, wie z.B. das Verschieben per Drag-and-Drop und das Schließen mit der `ESC`-Taste.