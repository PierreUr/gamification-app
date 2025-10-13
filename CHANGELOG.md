### 2025-10-12

- **Änderung:** Die Initialisierungsreihenfolge der Manager-Klassen in `js/main.js` wurde korrigiert. `questManager` und `timerManager` werden nun vor `testToolsManager` initialisiert, um sicherzustellen, dass Abhängigkeiten korrekt übergeben werden.
- **Betroffene Dateien:**
  - `js/main.js`
- **Grund:** Behebung des Bugs, bei dem der "Alle Quests erledigen"-Button im Test-Tool nicht funktionierte, da der `questManager` zum Zeitpunkt der Initialisierung `undefined` war.

# Änderungsprotokoll (Changelog)

### 2025-10-12

- **Änderung:** Die Gantt-Chart-Funktionalität wurde in `questManager.js` implementiert. Eine neue Methode `_renderGanttChart` wurde hinzugefügt, um Quests für ein ausgewähltes Datum zu filtern und auf einer 24-Stunden-Timeline anzuzeigen. Event-Listener für die Datums- und Ansichts-Steuerelemente wurden ebenfalls hinzugefügt.
- **Betroffene Dateien:**
  - `js/questManager.js`
- **Grund:** Behebung des gemeldeten Bugs, dass das Gantt-Chart keine Quests für den heutigen Tag anzeigt.

### 2025-10-12

- **Änderung:** Ein Event-Listener für den Button `#test-add-today-quests-btn` in `testToolsManager.js` hinzugefügt. Die Logik erstellt 5 neue Quest-Dokumente in Firestore mit dem aktuellen Datum als Deadline.
- **Betroffene Dateien:**
  - `js/testToolsManager.js`
- **Grund:** Behebung des gemeldeten Bugs, dass der Button keine Funktion hatte.

### 2025-10-12

- **Änderung:** In `questManager.js` wurde ein "Heute"-Button zur Quest-Listenansicht hinzugefügt (`_renderMyQuests`). Ein entsprechender Event-Listener wurde in `_attachEventListeners` implementiert, der die Deadline der Quest auf den heutigen Tag setzt. Zusätzlich wurde der "Fokus"-Button so erweitert, dass er ebenfalls die Deadline auf heute setzt.
- **Betroffene Dateien:**
  - `js/questManager.js`
- **Grund:** Implementierung der vom Benutzer gewünschten Funktion, eine Quest schnell für den aktuellen Tag zu markieren.

### 2025-10-12

- **Änderung:** Eine Platzhalterdatei `questManager.js` wurde erstellt, um einen 404-Fehler beim Laden der Anwendung zu beheben. Die Datei enthält eine leere `QuestManager`-Klasse mit den Methoden, die von anderen Teilen der Anwendung erwartet werden.
- **Betroffene Dateien:**
  - `js/questManager.js`
- **Grund:** Behebung eines kritischen Ladefehlers, der durch eine fehlende Datei verursacht wurde.