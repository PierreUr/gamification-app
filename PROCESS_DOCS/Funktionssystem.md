# Funktionssystem Dokumentation

Dieses Dokument beschreibt die UI-Elemente und die zugehörige Logik der Gamification-Anwendung im Detail. Es dient als Referenz, um zu verstehen, welcher Button welche Funktion in welchem JavaScript-Manager auslöst.

## 1. Globale Systeme & Haupt-UI

### 1.1. Authentifizierung
- **Zweck:** Handhabt den Lebenszyklus der Benutzeranmeldung.
- **UI-Elemente:**
    - `#auth-view`: Container, der nur vor der Anmeldung sichtbar ist.
    - `#login-btn`: Button, um den anonymen Anmeldeprozess zu starten.
    - `#logout-btn`: Button im Hauptmenü, um den Benutzer abzumelden und alle seine Daten zu löschen.
- **Funktionen:**
    - `signIn()`: Startet den anonymen Anmeldeprozess.
    - `deleteUserAndData()`: Löscht den Benutzer und alle seine Daten.
    - `handleAuthState()`: Reagiert auf Änderungen des Anmeldestatus und schaltet die Ansichten um.

### 1.2. Haupt-Layout & Datenfluss (`main.js`)
- **Zweck:** Definiert die Hauptstruktur der App und orchestriert den Datenfluss zwischen den Modulen.
- **UI-Elemente:**
    - `#app-view`: Hauptcontainer, der nach dem Login die gesamte Anwendung umschließt.
    - `#main-menu-container`: Linke Seitenleiste, die als primäres Navigationsinstrument dient.
    - `#main-content-container`: Der mittlere Bereich, der das Gantt-Chart und die fokussierte Quest anzeigt.
    - `#character-sidebar`: Rechte Seitenleiste, die eine Übersicht über den Charakterstatus gibt.
    - `#global-currency-display`: Globale Anzeige der Währungen (Gold, Silber, Bronze, Kristalle) oben rechts.
- **Funktionen:**
    - `GamificationApp.constructor()`: Initialisiert alle Manager-Klassen (QuestManager, PetManager etc.) und übergibt notwendige Abhängigkeiten wie die Datenbankverbindung oder Callback-Funktionen.
    - `listenToUserProfile()`: abonniert Echtzeit-Updates des Benutzerprofils in Firestore. Bei jeder Änderung werden die neuen Profildaten an alle relevanten Manager (`updateUserData`) verteilt, um die gesamte UI konsistent zu halten.
    - `createNewUserProfile()`: Wird aufgerufen, wenn ein neuer Benutzer zum ersten Mal anmeldet. Erstellt ein Standard-Benutzerprofil in Firestore mit Startwerten für Stats, Währung, und einem Satz an Starter-Ausrüstung und Pets.

### 1.3. Globale Benachrichtigungen & Pop-ups (`main.js`, `modalManager.js`)
- **Zweck:** Stellt Feedback-Mechanismen für Benutzeraktionen bereit.
- **UI-Elemente:**
    - `#notification-area`: Ein Bereich oben rechts für kurzlebige Text-Benachrichtigungen.
    - `#item-found-modal`: Modales Fenster, das erscheint, wenn ein Gegenstand gefunden wird.
    - `#delete-confirm-modal`: Generisches Bestätigungsfenster für Löschaktionen.
    - `#break-popup-modal`, `#post-break-modal`: Modals zur Steuerung von Pausenzeiten.
- **Funktionen:**
    - `showNotification()`: Zeigt eine Benachrichtigung an.
    - `_showItemFoundPopup()`: Zeigt das "Gegenstand gefunden"-Modal an.
    - `showDeleteConfirm()`: Zeigt das Löschen-Modal mit einem Callback an.
    - `modalManager`: Verwaltet das Öffnen, Schließen und Verschieben aller Modals.

---

## 2. Quest-System (`questManager.js`)

### 2.1. Meine Quests (Modal)
- **Zweck:** Anzeige, Filterung und Verwaltung aller Quests des Benutzers.
- **UI-Elemente:**
    - `#my-quests-modal`: Das Hauptfenster für die Quest-Liste.
    - `#menu-btn-my-quests`: Button im Hauptmenü zum Öffnen des Fensters.
    - `#todo-list`: Der Container, in den die einzelnen Quest-Einträge gerendert werden.
    - `#quest-list-filters`: Eine Leiste mit Steuerelementen zum Sortieren (`#quest-sort-select`) und Filtern (`.quest-filter-btn`) der Quests.

### 2.2. Neue Quest (Wizard-Modal)
- **Zweck:** Ein mehrstufiger Prozess zur Erstellung von neuen, detaillierten Quests.
- **UI-Elemente:**
    - `#new-quest-modal`: Das Fenster für den Erstellungs-Wizard.
    - `#menu-btn-new-quest`: Button im Hauptmenü zum Starten.
    - `.quest-wizard-step`: Fünf separate `div`-Container für die Schritte: 1. Typ, 2. Titel/Beschreibung, 3. Dauer, 4. Deadline/Wiederholung, 5. Details (Priorität/Tags).
    - `#quest-wizard-nav`: Navigationsleiste mit `#quest-back-btn`, `#quest-next-btn`, und `#quest-submit-btn`.
    - `#add-todo-form` (submit listener): Sammelt bei Klick auf "Quest Hinzufügen" alle Daten aus dem Formular und erstellt ein neues Dokument in der `todos`-Sammlung.

### 2.3. Fokus & Gantt-Chart
- **Zweck:** Visuelle Planung und Konzentration auf eine einzelne Aufgabe.
- **UI-Elemente:**
    - `#focus-quest-container`: Ein Bereich auf der Hauptseite, der die Details der als "Fokus" markierten Quest anzeigt.
    - `#gantt-chart-container`: Ein Bereich, der Quests mit einer Deadline auf einer Zeitleiste darstellt.
    - `#gantt-controls`: Eingabefelder für Datum (`#gantt-date`), Ansichtsoptionen etc.
- **Funktionen:**
    - `_renderFocusQuest()`: Zeichnet die fokussierte Quest.
    - `_renderGanttChart()`: Zeichnet das Gantt-Diagramm.

### 2.4. Pomodoro-System im Gantt-Chart (`ganttManager.js`)
- **Zweck:** Steuert die regelbasierte Pausenplanung im Gantt-Chart.
- **UI-Elemente:**
    - `#gantt-pomodoro-toggle`: Checkbox zur Aktivierung/Deaktivierung des Modus.
    - `#gantt-pomodoro-settings-btn`: Zahnrad-Icon (`⚙️`), das bei aktivem Modus erscheint und das Konfigurations-Modal öffnet.
    - `#div-7120` (Pomodoro Aktivierungs-Modal): Ein Informations-Dialog, der beim ersten Aktivieren erscheint.
        - `#pomodoro-initial-break-duration`: Dropdown zur Auswahl der Standard-Pausenlänge.
        - `#pomodoro-activate-btn`: Button, um den Modus mit der gewählten Einstellung zu starten.
    - `#div-7130` (Pomodoro Einstellungs-Modal):
        - `#pomodoro-long-break-duration`: Eingabefeld für die Dauer der langen Pause.
        - `#pomodoro-start-time`: Eingabefeld für die globale Startzeit des Arbeitstages.
        - `#pomodoro-fixed-breaks-container`: Container zur dynamischen Verwaltung von festen Pausenblöcken (z.B. Mittagspause).
        - `#pomodoro-add-fixed-break-btn`: Button zum Hinzufügen eines neuen festen Pausenblocks.
        - `#pomodoro-settings-save-btn`: Button zum Speichern der Einstellungen.
- **Funktionen:**
    - `_activatePomodoroMode(initialBreakMinutes)`: Wird nach der Bestätigung im Aktivierungs-Modal aufgerufen, setzt den Modus auf aktiv und speichert die initiale Pausenlänge.
    - `sortAllQuests()` / `applyPomodoroRules()`: (In Planung) Die zentrale Methode, die alle Quests unter Berücksichtigung der Pomodoro-Regeln und -Einstellungen neu anordnet.

---

## 3. Charakter & Stats (`characterSheetManager.js`)

- **Zweck:** Verwaltung und Anzeige aller Charakter-Attribute und -Werte.
- **UI-Elemente:**
    - `#character-sidebar`: Die rechte Seitenleiste, die alle Charakterinformationen enthält.
    - `#character-name`, `#character-level`: Anzeige für Name und Level.
    - `#hp-bar-fill`, `#mana-bar-fill`, `#stamina-bar-fill`: Fortschrittsbalken für Lebenspunkte, Mana und Ausdauer.
    - `#xp-bar-progress`: Fortschrittsbalken für Erfahrungspunkte.
    - `.stat-increase-btn`: Buttons zum Erhöhen von Attributen.
    - `#sidebar-derived-stats`: Anzeige der abgeleiteten Kampfwerte.

---

## 4. Inventar & Ausrüstung (`inventoryManager.js`)

### 4.1. Ausrüstung (Modal)
- **Zweck:** Visuelle Darstellung der ausgerüsteten Gegenstände.
- **UI-Elemente:**
    - `#equipment-modal`: Das Fenster, das die Ausrüstungsslots anzeigt.
    - `#menu-btn-equipment`: Button im Charakter-Menü zum Öffnen.
    - `.equipment-slot`: 13 Slots für verschiedene Ausrüstungs-Typen (Waffe, Kopf, etc.).
    - `#equipment-item-details`: Zeigt die Details eines angeklickten, ausgerüsteten Gegenstands an.

### 4.2. Inventar (Modal)
- **Zweck:** Anzeige aller nicht ausgerüsteten Gegenstände.
- **UI-Elemente:**
    - `#inventory-modal`: Das Fenster für das Inventar.
    - `#menu-btn-inventory`: Button im Charakter-Menü zum Öffnen.
    - `#inventory-list-container`: Die Liste, die die Inventar-Items enthält.
    - `#inventory-item-details`: Zeigt Details zu einem ausgewählten Item an.
    - `#inventory-sort-buttons`: Buttons zum Filtern der Liste nach Item-Typ.

---

## 5. Pet-System (`petManager.js`)

- **Zweck:** Verwaltung von aktiven und inaktiven Begleitern (Pets).
- **UI-Elemente:**
    - `#pets-modal`: Das Hauptfenster zur Pet-Verwaltung.
    - `#menu-btn-pets`: Button im Hauptmenü zum Öffnen.
    - `#pets-inventory-list`: Liste der "gelagerten" Pets.
    - `#pets-details-view`: Eine Vergleichsansicht, die ein ausgewähltes Pet aus dem Inventar neben einem aktiven Pet anzeigt.
    - `#active-pets-sidebar`: Kleine Anzeige der aktiven Pets in der Charakter-Seitenleiste.

---

## 6. Skill-System (`skillTree.js`)

- **Zweck:** Ermöglicht dem Spieler, Skill-Punkte auszugeben, um passive Boni oder aktive Fähigkeiten freizuschalten.
- **UI-Elemente:**
    - `#skill-tree-modal`: Das Fenster für den Skill-Baum.
    - `#open-skills-btn`: Button im Charakter-Menü zum Öffnen.
    - `#skill-list-panel`: Die linke Spalte, die alle verfügbaren Skills als klickbare Knoten anzeigt.
    - `#skill-detail-panel`: Die rechte Spalte, die Details, Voraussetzungen und den "Lernen"-Button für den ausgewählten Skill anzeigt.

---

## 7. Test-Werkzeuge (`testToolsManager.js`)

- **Zweck:** Bietet Entwickler-Buttons, um schnell Spielzustände zu testen.
- **UI-Elemente:**
    - `#test-buttons-container`: Ein Bereich im Hauptmenü, der alle Test-Buttons enthält.
- **Buttons und ihre Funktionen:**
    - `#test-levelup-btn`: Gibt dem Spieler 100 XP.
    - `#test-add-bronze-btn`: Fügt 125 Bronze hinzu.
    - `#test-timer-usage-btn`: Erhöht den Zähler für abgeschlossene Pomodoro-Timer.
    - `#test-add-today-quests-btn`: Erstellt 5 Test-Quests, die heute fällig sind.
    - `#test-complete-all-quests-btn`: Schließt alle aktuell im `questManager.localQuests` Array befindlichen Quests ab.
    - `#test-gain-pet-xp-btn`: Gibt dem ersten aktiven Pet 50 XP.
    - `.add-test-quests-btn`: Buttons, die jeweils 5 Quests einer bestimmten Priorität erstellen.

### 7.1. Datenbank-Abfrage (Test-Tool)
- **Zweck:** Ermöglicht das direkte Abfragen und Anzeigen von Werten aus dem `userProfile`-Objekt, um den Zustand der Datenbank schnell zu überprüfen.
- **UI-Elemente:**
    - `#db-path-select`: Eine Auswahlliste, die dynamisch mit bekannten Datenbankpfaden aus `DATABASE_PATHS.md` befüllt wird.
    - `#test-db-query-btn`: Button, um die Abfrage für den ausgewählten Pfad zu starten.
- **Funktionen:**
    - `_loadDbPaths()`: Lädt die Liste der Pfade und füllt die Auswahlliste.
    - `_queryDbValue(path)`: Liest den Wert für den angegebenen Pfad (z.B. `pomodoroSettings.workInterval`) aus dem lokalen `userProfile`-Objekt und zeigt ihn in einem System-Popup (`alert`) an.

---

## 8. Timer-System (`timerManager.js`)

- **Zweck:** Stellt Pomodoro-Timer und Pausen-Timer bereit.
- **UI-Elemente:**
    - `#pomodoro-modal`: Ein modales Fenster mit Bedienelementen für einen Pomodoro-Timer.
    - `#focus-quest-container`: Wenn eine Quest mit Dauer fokussiert wird, kann hier ein Timer gestartet werden.
    - `#break-popup-modal`: Ein großes Overlay, das erscheint, wenn eine Pause gestartet wird.
    - `#minimized-break-timer`: Eine kleine, persistente Anzeige des Pausen-Timers, wenn das große Popup geschlossen wird.
    - `#post-break-modal`: Ein Modal, das nach einer Pause erscheint, um den Benutzer zum Weitermachen aufzufordern.

---

## 9. Journal (`journalManager.js`)

- **Zweck:** Zeigt eine Liste der abgeschlossenen Quests an.
- **UI-Elemente:**
    - `#journal-modal`: Das Modal für das Journal.
    - `#menu-btn-journal`: Button im Hauptmenü zum Öffnen des Journals.
    - `#journal-list`: Container für die Liste der erledigten Quests.

---

## 10. Achievements (`achievementManager.js`)

- **Zweck:** Zeigt freigeschaltete Erfolge an und ermöglicht die Auswahl von Symbolen.
- **UI-Elemente:**
    - `#achievements-modal`: Das Modal für die Erfolge.
    - `#menu-btn-achievements`: Button im Charakter-Menü zum Öffnen.
    - `#achievements-list`: Liste der Erfolge.
    - `#achievement-icons-selection`: Bereich zur Auswahl der angezeigten Erfolgssymbole.
