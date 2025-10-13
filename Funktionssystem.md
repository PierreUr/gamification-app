# Funktionssystem Dokumentation

Dieses Dokument beschreibt die UI-Elemente und die zugehörige Logik der Gamification-Anwendung im Detail.

## 1. Globale Systeme & Haupt-UI

### 1.1. Authentifizierung (`main.js`)
- **Zweck:** Handhabt den Lebenszyklus der Benutzeranmeldung.
- **UI-Elemente:**
    - `#auth-view`: Container, der nur vor der Anmeldung sichtbar ist.
    - `#login-btn`: Button, um den anonymen Anmeldeprozess zu starten.
    - `#logout-btn`: Button im Hauptmenü, um den Benutzer abzumelden und alle seine Daten zu löschen.
- **Funktionen:**
    - `signIn()`: Nutzt Firebase Authentication, um einen anonymen Benutzer zu erstellen und anzumelden.
    - `deleteUserAndData()`: Löscht den aktuellen Firebase-Benutzer und ruft eine Funktion auf, um alle zugehörigen Daten (Profil, Inventar, Quests) aus Firestore zu entfernen.
    - `handleAuthState()`: Ein Listener, der auf Änderungen des Anmeldestatus reagiert und zwischen `#auth-view` und `#app-view` umschaltet.

### 1.2. Haupt-Layout & Datenfluss (`index.html`, `main.js`)
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

### 1.3. Benachrichtigungen & Pop-ups (`main.js`)
- **Zweck:** Stellt Feedback-Mechanismen für Benutzeraktionen bereit.
- **UI-Elemente:**
    - `#notification-area`: Ein Bereich oben rechts, in dem kurzlebige Text-Benachrichtigungen (z.B. "Quest abgeschlossen") erscheinen.
    - `#item-found-modal`: Ein modales Fenster, das erscheint, wenn ein Gegenstand als Quest-Belohnung gefunden wird.
    - `#delete-confirm-modal`: Ein generisches Bestätigungsfenster für Löschaktionen.
- **Funktionen:**
    - `showNotification()`: Zeigt eine Benachrichtigung mit anpassbarem Text, Typ (Erfolg, Info, Fehler) und Dauer an.
    - `_showItemFoundPopup()`: Zeigt das "Gegenstand gefunden"-Modal mit den Item-Details an.
    - `showDeleteConfirm()`: Zeigt das Löschen-Modal mit einer spezifischen Nachricht und einem Callback für die Bestätigungsaktion an.

### 1.4. Fenster-Management (`modalManager.js`)
- **Zweck:** Bietet globale Funktionalität für alle modalen Fenster.
- **Funktionen:**
    - `_attachDragListeners()`: Fügt allen Fenstern mit der Klasse `.modal` und einem `.modal-header` eine Drag-and-Drop-Funktionalität hinzu.
    - `_attachGlobalKeyListeners()`: Fügt einen globalen Listener hinzu, der das oberste sichtbare modale Fenster schließt, wenn die `Escape`-Taste gedrückt wird.

---

## 2. Quest-System (`questManager.js`)

### 2.1. Meine Quests (Modal)
- **Zweck:** Anzeige, Filterung und Verwaltung aller Quests des Benutzers.
- **UI-Elemente:**
    - `#my-quests-modal`: Das Hauptfenster für die Quest-Liste.
    - `#menu-btn-my-quests`: Button im Hauptmenü zum Öffnen des Fensters.
    - `#todo-list`: Der Container, in den die einzelnen Quest-Einträge gerendert werden.
    - `#quest-list-filters`: Eine Leiste mit Steuerelementen zum Sortieren (`#quest-sort-select`) und Filtern (`.quest-filter-btn`) der Quests.
- **Buttons pro Quest:**
    - `.complete-btn`: Eine Checkbox/Button zum Abschließen der Quest.
    - `.delete-btn`: Ein Button zum Löschen der Quest (mit Bestätigung).
    - `.focus-btn`: Setzt die Quest in den Fokusbereich der Haupt-UI.
    - `.today-btn`: Ändert das Fälligkeitsdatum der Quest auf den heutigen Tag.
- **Funktionen:**
    - `_listenToQuests()`: Abonniert die `todos`-Sammlung in Firestore und aktualisiert die lokale `localQuests`-Liste bei Änderungen.
    - `_renderMyQuests()`: Zeichnet die Quest-Liste basierend auf den aktuellen Sortier- und Filter-Einstellungen neu.
    - `_handleQuestCompletion()`: Die Kernlogik zum Abschließen einer Quest. Löscht den Eintrag aus der DB, vergibt XP und Währung und stößt die Drop-Verarbeitung an.

### 2.2. Neue Quest (Wizard-Modal)
- **Zweck:** Ein mehrstufiger Prozess zur Erstellung von neuen, detaillierten Quests.
- **UI-Elemente:**
    - `#new-quest-modal`: Das Fenster für den Erstellungs-Wizard.
    - `#menu-btn-new-quest`: Button im Hauptmenü zum Starten.
    - `.quest-wizard-step`: Fünf separate `div`-Container für die Schritte: 1. Typ, 2. Titel/Beschreibung, 3. Dauer, 4. Deadline/Wiederholung, 5. Details (Priorität/Tags).
    - `#quest-wizard-nav`: Navigationsleiste mit `#quest-back-btn`, `#quest-next-btn`, und `#quest-submit-btn`.
- **Funktionen:**
    - `_showQuestStep()`: Blendet den aktuellen Schritt ein und die anderen aus.
    - `_validateCurrentQuestStep()`: Prüft bei jeder Eingabe, ob die Anforderungen des aktuellen Schritts erfüllt sind, und aktiviert/deaktiviert den "Weiter"-Button.
    - `addDoc()`: Bei Klick auf "Quest Hinzufügen" werden alle Daten aus dem Formular gesammelt und ein neues Dokument in der `todos`-Sammlung erstellt.

### 2.3. Fokus & Gantt-Chart
- **Zweck:** Visuelle Planung und Konzentration auf eine einzelne Aufgabe.
- **UI-Elemente:**
    - `#focus-quest-container`: Ein Bereich auf der Hauptseite, der die Details der als "Fokus" markierten Quest anzeigt.
    - `#gantt-chart-container`: Ein Bereich, der Quests mit einer Deadline am ausgewählten Datum auf einer 24-Stunden-Zeitleiste darstellt.
    - `#gantt-controls`: Eingabefelder für Datum (`#gantt-date`) und andere Ansichtsoptionen.
- **Funktionen:**
    - `_renderFocusQuest()`: Zeichnet die fokussierte Quest.
    - `_renderGanttChart()`: Filtert `localQuests` nach dem Datum und stellt sie als Balken im Diagramm dar.

---

## 3. Charakter & Stats (`characterSheetManager.js`)

- **Zweck:** Verwaltung und Anzeige aller Charakter-Attribute und -Werte.
- **UI-Elemente:**
    - `#character-sidebar`: Die rechte Seitenleiste, die alle Charakterinformationen enthält.
    - `#character-name`, `#character-level`: Anzeige für Name und Level.
    - `#hp-bar-fill`, `#mana-bar-fill`, `#stamina-bar-fill`: Fortschrittsbalken für Lebenspunkte, Mana und Ausdauer.
    - `#xp-bar-progress`: Fortschrittsbalken für Erfahrungspunkte.
    - `#stat-vitality`, `#stat-strength`, etc.: Anzeige der Basis-Attribute.
    - `.stat-increase-btn`: `+`-Buttons, die erscheinen, wenn Attributpunkte (`statPoints`) verfügbar sind.
    - `#derived-stat-phys-dmg`, etc.: Anzeige der abgeleiteten Kampfwerte.
- **Funktionen:**
    - `update()`: Wird bei jeder Änderung des `userProfile` aufgerufen. Berechnet die Gesamtattribute (Basis + Ausrüstung) und aktualisiert alle UI-Elemente in der Seitenleiste.
    - `_calculateMaxHp()`, `_calculateMaxMana()`, `_calculateMaxStamina()`: Berechnen die Maximalwerte basierend auf den Attributen.
    - Event-Listener für `.stat-increase-btn`: Erhöht bei Klick ein Attribut in der Datenbank und dekrementiert die verfügbaren `statPoints`.

---

## 4. Inventar & Ausrüstung (`inventoryManager.js`)

### 4.1. Ausrüstung (Modal)
- **Zweck:** Visuelle Darstellung der ausgerüsteten Gegenstände.
- **UI-Elemente:**
    - `#equipment-modal`: Das Fenster, das die Ausrüstungsslots anzeigt.
    - `#menu-btn-equipment`: Button im Charakter-Menü zum Öffnen.
    - `.equipment-slot`: 13 Slots für verschiedene Ausrüstungs-Typen (Waffe, Kopf, etc.).
    - `#equipment-item-details`: Zeigt die Details eines angeklickten, ausgerüsteten Gegenstands an.
    - `#unequip-all-btn`: Button, um alle Gegenstände auf einmal abzulegen.
- **Funktionen:**
    - `renderEquipmentSlots()`: Füllt die Slots mit den Icons der im `userProfile.equipment` hinterlegten Items.
    - `unequipItem()`: Verschiebt einen Gegenstand von `equipment` zurück ins Inventar.
    - `unequipAllItems()`: Legt alle Gegenstände ab.

### 4.2. Inventar (Modal)
- **Zweck:** Anzeige aller nicht ausgerüsteten Gegenstände.
- **UI-Elemente:**
    - `#inventory-modal`: Das Fenster für das Inventar.
    - `#menu-btn-inventory`: Button im Charakter-Menü zum Öffnen.
    - `#inventory-list-container`: Die Liste, die die Inventar-Items enthält.
    - `#inventory-item-details`: Zeigt Details zu einem ausgewählten Item an.
    - `#inventory-sort-buttons`: Buttons zum Filtern der Liste nach Item-Typ (Waffe, Rüstung, etc.).
    - `#inventory-pagination`: Steuerung zum Blättern durch die Seiten des Inventars.
- **Buttons pro Item:**
    - `Ausrüsten`: Ruft `equipItem()` auf.
    - `Benutzen`: Ruft `useItem()` auf (für Tränke).
    - `Verwerfen` (Mülleimer-Icon): Ruft `deleteItem()` auf.
- **Funktionen:**
    - `listenToInventory()`: Abonniert die `inventory`-Subkollektion des Benutzers.
    - `renderInventoryPage()`: Zeichnet die gefilterte und paginierte Inventarliste.
    - `equipItem()`: Eine komplexe Transaktion, die einen Gegenstand aus dem Inventar entfernt, ihn in den `equipment`-Slot des Benutzerprofils legt und den zuvor ausgerüsteten Gegenstand zurück ins Inventar verschiebt.
    - `useItem()`: Verwendet einen Trank, aktualisiert HP/Mana des Spielers und reduziert die Menge des Tranks.
    - `deleteItem()`: Löscht einen Gegenstand oder reduziert seine Menge.

---

## 5. Pet-System (`petManager.js`)

- **Zweck:** Verwaltung von aktiven und inaktiven Begleitern (Pets).
- **UI-Elemente:**
    - `#pets-modal`: Das Hauptfenster zur Pet-Verwaltung.
    - `#menu-btn-pets`: Button im Hauptmenü zum Öffnen.
    - `#pets-inventory-list`: Liste der "gelagerten" Pets.
    - `#pets-details-view`: Eine Vergleichsansicht, die ein ausgewähltes Pet aus dem Inventar neben einem aktiven Pet anzeigt.
    - `#active-pets-sidebar`: Eine kleine Anzeige der aktiven Pets in der rechten Charakter-Seitenleiste.
- **Funktionen:**
    - `render()`: Zeichnet die Inventarliste und die Detailansicht basierend auf dem ausgewählten Zustand neu.
    - `_swapPet()`: Tauscht ein aktives Pet gegen ein Pet aus dem Inventar aus.
    - `_unequipPet()`: Legt ein aktives Pet zurück ins Inventar.
    - `_renderPetDetailColumn()`: Eine komplexe Funktion, die eine einzelne Spalte in der Detailansicht mit allen Werten, Boni und Skills eines Pets rendert und dabei Werte farblich hervorhebt, wenn sie mit einem anderen Pet verglichen werden.

---

## 6. Skill-System (`skillTree.js`)

- **Zweck:** Ermöglicht dem Spieler, Skill-Punkte auszugeben, um passive Boni oder aktive Fähigkeiten freizuschalten.
- **UI-Elemente:**
    - `#skill-tree-modal`: Das Fenster für den Skill-Baum.
    - `#open-skills-btn`: Button im Charakter-Menü zum Öffnen.
    - `#skill-list-panel`: Die linke Spalte, die alle verfügbaren Skills als klickbare Knoten anzeigt.
    - `#skill-detail-panel`: Die rechte Spalte, die Details, Voraussetzungen und den "Lernen"-Button für den ausgewählten Skill anzeigt.
    - `#learn-skill-btn`: Button zum Erlernen eines Skills.
- **Funktionen:**
    - `render()`: Zeichnet die Skill-Liste und das Detail-Panel neu. Färbt Skills basierend auf ihrem Status (erlernt, erlernbar, gesperrt).
    - `_learnSkill()`: Prüft, ob die Voraussetzungen erfüllt sind, und fügt bei Erfolg die Skill-ID zum Benutzerprofil hinzu und zieht die Skill-Punkte ab.
    - `_loadSkillsData()`: Lädt die Skill-Definitionen aus einem JSON-Block in `index.html`.

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
    - `#test-complete-all-quests-btn`: **Sollte alle aktuell im `questManager.localQuests` Array befindlichen Quests abschließen.**
    - `#test-simulate-drop-btn`: Simuliert einen Item-Drop von einer Quest.
    - `#test-gain-pet-xp-btn`: Gibt dem ersten aktiven Pet 50 XP.
    - `.add-test-quests-btn`: Buttons, die jeweils 5 Quests einer bestimmten Priorität erstellen.

---

## 8. Timer-System (`timerManager.js`)

- **Zweck:** Stellt Pomodoro-Timer und Pausen-Timer bereit.
- **UI-Elemente:**
    - `#pomodoro-modal`: Ein modales Fenster mit Bedienelementen für einen Pomodoro-Timer (Start, Pause, Reset, Zeitauswahl).
    - `#focus-quest-container`: Wenn eine Quest mit Dauer fokussiert wird, kann hier ein Timer gestartet werden.
    - `#break-popup-modal`: Ein großes Overlay, das erscheint, wenn eine Pause gestartet wird.
    - `#minimized-break-timer`: Eine kleine, persistente Anzeige des Pausen-Timers, wenn das große Popup geschlossen wird.
- **Funktionen:**
    - `_startTimer()`, `_pauseTimer()`, `_resetTimer()`: Die grundlegenden Steuerungsfunktionen für den Timer-Countdown.
    - `startQuestTimer()`: Startet einen Timer, der mit einer bestimmten Quest-ID verknüpft ist.
    - `handleTimerCompletion()`: Ein Callback, der am Ende eines Timers ausgeführt wird.
