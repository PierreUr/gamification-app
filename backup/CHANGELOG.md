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

### 2024-05-23

- **Änderung:** Die Layout-Klassen des Haupt-App-Containers (`div-4000`) in `index.html` wurden korrigiert. Die feste Höhenberechnung und die Zentrierung (`mx-auto`) wurden entfernt und durch ein Padding ersetzt.
- **Backup-ID:** `20240523110000`
- **Betroffene Dateien:**
  - `index.html`
- **Grund:** Behebung eines Layout-Fehlers, bei dem die Anwendung breiter als der Bildschirm war und Elemente nach oben verschoben wurden. Die Korrektur stellt ein flexibles, korrektes Drei-Spalten-Layout wieder her.

### 2024-05-23

- **Änderung:** Die HTML-Struktur in `index.html` wurde korrigiert, indem der überflüssige Wrapper `div-4200` entfernt wurde. Die Layout-Klassen wurden direkt auf die Container für das Gantt-Chart (`div-4300`) und die Fokus-Quest (`div-4400`) angewendet.
- **Backup-ID:** `20240523100000`
- **Betroffene Dateien:**
  - `index.html`
- **Grund:** Behebung des Layout-Fehlers, bei dem die mittleren Inhaltselemente übereinander gestapelt wurden. Die Wiederherstellung der flachen Layout-Struktur aus der `index - OLD.html` korrigiert die Flexbox-Anordnung.

### 2024-05-22

- **Änderung:** Die fehlende `flex`-Klasse wurde zum Haupt-App-Container (`div-4000`) in `index.html` hinzugefügt.
- **Backup-ID:** `20240522220000`
- **Betroffene Dateien:**
  - `index.html`
- **Grund:** Behebung des grundlegenden Layout-Fehlers, bei dem die drei Hauptspalten der Anwendung vertikal gestapelt statt horizontal angeordnet wurden.

### 2024-05-22

- **Änderung:** Die Breitenangabe (`w-[60vw]`) und die horizontale Zentrierung (`mx-auto`) wurden vom Gantt-Chart-Container (`div-4300`) in `index.html` entfernt.
- **Backup-ID:** `20240522210000`
- **Betroffene Dateien:**
  - `index.html`
- **Grund:** Behebung eines Layout-Fehlers, bei dem Elemente im mittleren Bereich übereinander gestapelt wurden. Die feste Breitenangabe eines Flex-Items führte zu Konflikten mit dem übergeordneten Flex-Container.

### 2024-05-22

- **Änderung:** Die Reihenfolge der Elemente in der rechten Charakter-Seitenleiste (`div-2000`) in `index.html` wurde korrigiert, um die gewünschte visuelle Hierarchie (Charakterdetails -> Menü-Buttons -> Statusleisten/Attribute) wiederherzustellen.
- **Backup-ID:** `20240522200000`
- **Betroffene Dateien:**
  - `index.html`
- **Grund:** Behebung eines Layout-Fehlers, bei dem die Elemente in der rechten Spalte nicht in der vorgesehenen Reihenfolge angeordnet waren.

### 2024-05-22

- **Änderung:** Dem Gantt-Chart-Container (`div-4300`) in `index.html` wurde eine feste Höhe (`h-[350px]`) hinzugefügt.
- **Backup-ID:** `20240522190000`
- **Betroffene Dateien:**
  - `index.html`
- **Grund:** Behebung eines Layout-Fehlers, bei dem das Gantt-Chart und der Fokus-Quest-Container übereinander gerendert wurden. Die feste Höhe stellt die korrekte vertikale Anordnung im Flex-Container wieder her.

### 2024-05-22

- **Änderung:** Die Breiten- und Flex-Klassen für die Haupt-Layout-Container (`div-1000`, `div-4200`, `div-2000`) in `index.html` wurden wiederhergestellt.
- **Backup-ID:** `20240522180000`
- **Betroffene Dateien:**
  - `index.html`
- **Grund:** Behebung eines defekten UI-Layouts. Nach vorherigen Aufräumarbeiten fehlten den Hauptspalten die Breitenangaben, wodurch die gesamte Anwendungsansicht kollabierte.

### 2024-05-22

- **Änderung:** Die DOM-Element-Zuweisungen im `GanttManager` wurden vom `_attachEventListeners` in eine neue `_initializeDOMElements`-Methode verschoben und werden nun direkt im Konstruktor aufgerufen.
- **Backup-ID:** `20240522170000`
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Behebung einer Race Condition (`TypeError: Cannot read properties of undefined (reading 'parentElement')`). Sub-Manager haben auf DOM-Referenzen zugegriffen, bevor diese initialisiert waren.

### 2024-05-22

- **Änderung:** Die fehlenden `div`-Container (`gantt-sidebar-container`, `gantt-timeline-scroll-container`, `gantt-timeline-container`) für das Gantt-Chart wurden in `index.html` innerhalb von `div-4320` hinzugefügt.
- **Backup-ID:** `20240522160000`
- **Betroffene Dateien:**
  - `index.html`
- **Grund:** Behebung eines `TypeError: Cannot read properties of null (reading 'appendChild')` im `GanttManager`. Der Fehler trat auf, weil die Ziel-Container für die Gantt-UI-Elemente (Sidebar, Timeline) nicht im DOM vorhanden waren.

### 2024-05-22

- **Änderung:** Die veralteten Inline-`<style>`-Blöcke in `index-1.html` wurden entfernt und durch Links zu den zentralen CSS-Dateien (`global.css`, `character.css`, etc.) ersetzt.
- **Backup-ID:** `20240522150000`
- **Betroffene Dateien:**
  - `index-1.html`
- **Grund:** Vereinheitlichung des CSS-Styling-Systems in der gesamten Anwendung. Die redundanten und inkonsistenten Inline-Stile wurden entfernt, um die Wartbarkeit zu verbessern und Styling-Konflikte zu vermeiden.

### 2024-05-22

- **Änderung:** Die `index.html` wurde bereinigt, um doppelte `<body>`- und `<head>`-Tags sowie mehrfach vergebene IDs zu entfernen. Die DOM-Abfragen im Konstruktor von `GamificationApp` in `js/main.js` wurden korrigiert, um auf die nun eindeutigen IDs zu verweisen.
- **Backup-ID:** `20240522140000`
- **Betroffene Dateien:**
  - `index.html`
  - `js/main.js`
- **Grund:** Behebung des `TypeError: Cannot read properties of null (reading 'addEventListener')` in `main.js`. Der Fehler wurde durch inkonsistente und doppelte IDs in der `index.html` verursacht, was zu fehlerhaften DOM-Abfragen führte.

### 2024-05-22

- **Änderung:** Fehlerhafte HTML-Strukturen und Kommentare wurden aus dem `<script type="module">`-Block in `index.html` entfernt.
- **Backup-ID:** `20240522120000`
- **Betroffene Dateien:**
  - `index.html`
- **Grund:** Behebung eines `SyntaxError: HTML comments are not allowed in modules`. Durch einen Kopierfehler war HTML-Code in den JavaScript-Block geraten, was das Laden der Anwendung verhinderte.

### 2024-05-22

- **Änderung:** Die fehlende `import`-Anweisung für den `GanttManager` wurde in `js/main.js` hinzugefügt.
- **Backup-ID:** `20240522110000`
- **Betroffene Dateien:**
  - `js/main.js`
- **Grund:** Behebung eines `ReferenceError`, der beim Initialisieren der Manager-Klassen auftrat. Die Klasse `GanttManager` wurde verwendet, bevor sie importiert wurde, was zu einem Absturz der Anwendung führte.

### 2024-05-22

- **Änderung:** Die IDs der `div`-Container für die Schritte des Quest-Wizards in `index.html` wurden korrigiert, um mit den in der `Anwendungsarchitektur.json` definierten `div-XXXX`-IDs übereinzustimmen (z.B. `quest-step-1` zu `div-1123`).
- **Backup-ID:** `20240522101500`
- **Betroffene Dateien:**
  - `index.html`
- **Grund:** Behebung des Konsolenfehlers `TypeError: Cannot read properties of null (reading 'appendChild')`. Der Fehler trat auf, weil die JavaScript-Module auf die dokumentierten, aber im HTML falsch benannten `div`-Container zugreifen wollten.

### 2024-05-17

- **Änderung:** Das "Neue Quest"- und "Quest bearbeiten"-Fenster wurde um ein optionales Datumsfeld "Bearbeitungstag" (`scheduledAt`) erweitert. Die Logik in `questManager.js` wurde angepasst, um diesen Wert zu speichern und zu laden. Zusätzlich wird die Quest-Dauer nun in der "Meine Quests"-Liste angezeigt.
