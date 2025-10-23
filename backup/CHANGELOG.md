### 2024-05-17

- **Änderung:** Das "Neue Quest"- und "Quest bearbeiten"-Fenster wurde um ein optionales Datumsfeld "Bearbeitungstag" (`scheduledAt`) erweitert. Die Logik in `questManager.js` wurde angepasst, um diesen Wert zu speichern und zu laden. Zusätzlich wird die Quest-Dauer nun in der "Meine Quests"-Liste angezeigt.
- **Backup-ID:** `20240517113000`
- **Betroffene Dateien:**
  - `index.html`
  - `js/questManager.js`
- **Grund:** Implementierung einer vom Benutzer gewünschten Funktion zur besseren Quest-Planung.

### 2024-05-21

- **Änderung:** Im "Quest bearbeiten"-Modal wurde das freie Eingabefeld für die Dauer durch Buttons (+25m, +45m, Reset) ersetzt. Die Logik in `_populateEditModal` und dem zugehörigen Event-Listener in `questManager.js` wurde angepasst, um die Dauer über eine neue Eigenschaft `editingQuestDuration` zu verwalten.
- **Betroffene Dateien:**
  - `js/questManager.js`
- **Grund:** Verbesserung der Benutzerfreundlichkeit und Vereinheitlichung der Dauer-Eingabe, basierend auf der Anforderung des Benutzers.

### 2024-05-21

- **Änderung:** Die Initialisierungsreihenfolge der Manager-Klassen in `js/main.js` wurde korrigiert. `questManager` und `timerManager` werden nun vor `testToolsManager` initialisiert, um sicherzustellen, dass Abhängigkeiten korrekt übergeben werden.
- **Betroffene Dateien:**
  - `js/main.js`
- **Grund:** Behebung des Bugs, bei dem der "Alle Quests erledigen"-Button im Test-Tool nicht funktionierte, da der `questManager` zum Zeitpunkt der Initialisierung `undefined` war.

# Änderungsprotokoll (Changelog)

### 2024-05-21

- **Änderung:** Die Gantt-Chart-Funktionalität wurde in `questManager.js` implementiert. Eine neue Methode `_renderGanttChart` wurde hinzugefügt, um Quests für ein ausgewähltes Datum zu filtern und auf einer 24-Stunden-Timeline anzuzeigen. Event-Listener für die Datums- und Ansichts-Steuerelemente wurden ebenfalls hinzugefügt.
- **Betroffene Dateien:**
  - `js/questManager.js`
- **Grund:** Behebung des gemeldeten Bugs, dass das Gantt-Chart keine Quests für den heutigen Tag anzeigt.

### 2024-05-21

- **Änderung:** Ein Event-Listener für den Button `#test-add-today-quests-btn` in `testToolsManager.js` hinzugefügt. Die Logik erstellt 5 neue Quest-Dokumente in Firestore mit dem aktuellen Datum als Deadline.
- **Betroffene Dateien:**
  - `js/testToolsManager.js`
- **Grund:** Behebung des gemeldeten Bugs, dass der Button keine Funktion hatte.

### 2024-05-21

- **Änderung:** In `questManager.js` wurde ein "Heute"-Button zur Quest-Listenansicht hinzugefügt (`_renderMyQuests`). Ein entsprechender Event-Listener wurde in `_attachEventListeners` implementiert, der die Deadline der Quest auf den heutigen Tag setzt. Zusätzlich wurde der "Fokus"-Button so erweitert, dass er ebenfalls die Deadline auf heute setzt.
- **Betroffene Dateien:**
  - `js/questManager.js`
- **Grund:** Implementierung der vom Benutzer gewünschten Funktion, eine Quest schnell für den aktuellen Tag zu markieren.

### 2024-05-21

- **Änderung:** Eine Platzhalterdatei `questManager.js` wurde erstellt, um einen 404-Fehler beim Laden der Anwendung zu beheben. Die Datei enthält eine leere `QuestManager`-Klasse mit den Methoden, die von anderen Teilen der Anwendung erwartet werden.
- **Betroffene Dateien:**
  - `js/questManager.js`
- **Grund:** Behebung eines kritischen Ladefehlers, der durch eine fehlende Datei verursacht wurde.


### 2024-05-21

- **Änderung:** Der `submit`-Event-Listener in `questManager.js` wurde korrigiert, um auf die UI-Elemente des `questWizardManager` zuzugreifen, anstatt auf nicht mehr existente lokale Eigenschaften. Dies behebt einen `TypeError` beim Erstellen einer neuen Quest.
- **Betroffene Dateien:**
  - `js/questManager.js`
- **Grund:** Behebung eines kritischen Konsolenfehlers nach dem Refactoring des Quest-Wizards.

### 2024-05-21

- **Änderung:** Die `render`-Aufrufe für die Quest-Liste und die Fokus-Quest wurden in `_listenToQuests` in `questManager.js` wiederhergestellt. Zusätzlich wurde die Validierung im `questWizardManager` so angepasst, dass sie nach einem Klick auf den "Heute"-Button manuell ausgelöst wird.
- **Betroffene Dateien:**
  - `js/questManager.js`
  - `js/questWizardManager.js`
- **Grund:** Behebung von zwei Bugs: Die Quest-Liste wurde nach dem Refactoring nicht mehr angezeigt und der "Weiter"-Button im Wizard funktionierte nicht korrekt.

### 2024-05-21

- **Änderung:** Die Methoden `_getXpForPriority`, `_renderFocusQuest`, `_handleFocusRequest` und `_handleQuestCompletion` wurden wieder in `questManager.js` eingefügt, um `TypeError: Cannot read properties of undefined (reading 'bind')` bei der Initialisierung des `QuestListManager` zu beheben.
- **Betroffene Dateien:**
  - `js/questManager.js`
- **Grund:** Behebung eines kritischen Konsolenfehlers nach dem Refactoring.

### 2024-05-17

- **Änderung:** Das "Neue Quest"- und "Quest bearbeiten"-Fenster wurde um ein optionales Datumsfeld "Bearbeitungstag" (`scheduledAt`) erweitert. Die Logik in `questManager.js` wurde angepasst, um diesen Wert zu speichern und zu laden. Zusätzlich wird die Quest-Dauer nun in der "Meine Quests"-Liste angezeigt.
