# Änderungsprotokoll (Changelog)

### 2024-05-24

- **Änderung:** Die Header-Buttons im Gantt-Chart wurden überarbeitet. Der "Ansicht"-Button und das Zahnrad-Symbol wurden zu einem einzigen Button "Ansicht ⚙️" zusammengefasst. Ein Fehler, der das Öffnen des zugehörigen Pop-ups verhinderte, wurde behoben und das Pop-up mit Test-Inhalt gefüllt.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Verbesserung der UI-Übersichtlichkeit und Behebung eines Funktionsfehlers auf Benutzerwunsch.

### 2024-05-24

- **Änderung:** Ein `TypeError` wurde behoben, der durch eine falsche Platzierung der Logik für die Gantt-Header-Buttons verursacht wurde. Die Funktionen `_createGanttHeaderButtons` und `_showGanttHeaderPopup` wurden korrekt in den `GanttInteractionManager` verschoben und werden von dort aufgerufen.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Finale Behebung eines kritischen JavaScript-Fehlers, der das Laden des Gantt-Charts verhinderte.

### 2024-05-24

- **Änderung:** Ein `TypeError` wurde behoben, der durch einen falschen Methodenaufruf nach einem Refactoring verursacht wurde. Der Aufruf von `_createGanttHeaderButtons` wurde in die `GanttManager`-Klasse verschoben, um sicherzustellen, dass die Header-Buttons korrekt initialisiert werden.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Behebung eines kritischen JavaScript-Fehlers, der das Laden des Gantt-Charts verhinderte.

### 2024-05-24

- **Änderung:** Ein `TypeError` wurde behoben, der beim Laden des Gantt-Charts auftrat. Die Funktion `_createGanttHeaderButtons` wurde von der `GanttManager`-Klasse in die korrekte `GanttInteractionManager`-Klasse verschoben, um den Fehler "is not a function" zu beheben.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Behebung eines kritischen JavaScript-Fehlers, der nach einer Code-Umstrukturierung auftrat.

### 2024-05-24

- **Änderung:** Neue UI-Elemente wurden zur Gantt-Chart-Steuerung hinzugefügt. Neben der Datumsanzeige befinden sich nun ein "Ansicht"-Button und ein Zahnrad-Symbol für Einstellungen. Beide öffnen bei Klick ein temporäres Pop-up-Fenster.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Implementierung einer neuen UI-Funktion auf Benutzerwunsch zur Vorbereitung zukünftiger Einstellungs- und Ansichtsoptionen.

### 2024-05-24

- **Änderung:** Ein visueller Fehler bei der Größenanpassung von Quest-Balken wurde behoben. Die prozentuale Breite des Balkens während des Ziehens wird nun korrekt auf die gesamten 24 Stunden der Timeline bezogen, was das übermäßige "Springen" der Breite verhindert.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Behebung eines visuellen Bugs für eine konsistente und intuitive UI-Interaktion beim Ändern der Quest-Dauer.

### 2024-05-24

- **Änderung:** Ein Fehler bei der Größenanpassung von Quest-Balken wurde behoben. Die Berechnung der Dauer während des Ziehens (`mousemove`) wurde an die finale Berechnung (`mouseup`) angeglichen, um das "Zurückspringen" des Balkens nach dem Loslassen zu verhindern.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Behebung des Bugs "Ungenaue Größenanpassung von Quest-Balken" für eine präzisere und intuitivere UI-Interaktion.

### 2024-05-24

- **Änderung:** Eine systematische Fehleranalyse für die ungenaue Größenanpassung von Quest-Balken wurde gestartet. Detaillierte Konsolenausgaben wurden in `ganttManager.js` hinzugefügt, um die Berechnungen zu protokollieren.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
  - `PROCESS_DOCS/BUG_GanttResize_Analyse.md` (neu)
- **Grund:** Systematische Fehlersuche bei der interaktiven Anpassung der Quest-Dauer.

### 2024-05-24

- **Änderung:** Ein Fehler wurde behoben, bei dem Quest-Balken nach der Größenänderung auf ihre ursprüngliche Größe zurücksprangen. Die Berechnung der finalen Dauer wurde korrigiert, um präziser zu sein.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Behebung eines Fehlers bei der interaktiven Anpassung der Quest-Dauer.

### 2024-05-24

- **Änderung:** Ein Fehler wurde behoben, bei dem Quest-Balken nach der Größenänderung auf ihre ursprüngliche Größe zurücksprangen. Die Berechnung der finalen Dauer wurde korrigiert, um präziser zu sein.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Behebung eines Fehlers bei der interaktiven Anpassung der Quest-Dauer.

### 2024-05-24

- **Änderung:** Die Größenanpassung von Quest-Balken im Gantt-Chart wurde verbessert. Die Dauer rastet nun in 5-Minuten-Schritten ein, um eine präzisere Planung zu ermöglichen.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Verbesserung der Benutzerfreundlichkeit auf Basis von User-Feedback.

### 2024-05-24

- **Änderung:** Ein Fehler wurde behoben, bei dem der Griff zur Größenänderung (`↔️`) an Quest-Balken nicht sichtbar war. Die Logik zum Hinzufügen des Griffs wurde aus einem `setTimeout` entfernt, um ein zuverlässiges Rendering zu gewährleisten.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Behebung eines visuellen Fehlers, der die Interaktion mit der Quest-Dauer verhinderte.

### 2024-05-24

- **Änderung:** Ein Fehler wurde behoben, bei dem der Griff zur Größenänderung (`↔️`) an Quest-Balken nicht sichtbar war. Die Logik zum Hinzufügen des Griffs wurde aus einem `setTimeout` entfernt, um ein zuverlässiges Rendering zu gewährleisten.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Behebung eines visuellen Fehlers, der die Interaktion mit der Quest-Dauer verhinderte.

### 2024-05-24

- **Änderung:** Ein Fehler wurde behoben, bei dem der "Speichern"-Button im "Quest bearbeiten"-Fenster nicht funktionierte. Der Event-Listener wird nun korrekt und nur einmal an das `submit`-Event des Formulars gebunden, anstatt bei jedem Öffnen des Modals fehlerhaft neu erstellt zu werden.
- **Betroffene Dateien:**
  - `js/questManager.js`
- **Grund:** Behebung eines kritischen UI-Fehlers, der das Speichern von Quest-Änderungen verhinderte.

### 2024-05-24

- **Änderung:** Ein Fehler wurde behoben, bei dem der "Speichern"-Button im "Quest bearbeiten"-Fenster nicht funktionierte. Ein doppelter Event-Listener wurde durch das Klonen und Ersetzen des Formulars bei jedem Öffnen des Modals verhindert.
- **Betroffene Dateien:**
  - `js/questManager.js`
- **Grund:** Behebung eines kritischen UI-Fehlers, der das Speichern von Quest-Änderungen verhinderte.

### 2024-05-24

- **Änderung:** Ein Fehler wurde behoben, bei dem der "Speichern"-Button im "Quest bearbeiten"-Fenster nicht funktionierte. Zusätzlich wurde der Griff zur Größenänderung von Quest-Balken (`↔️`) permanent sichtbar gemacht.
- **Betroffene Dateien:**
  - `js/questManager.js`
  - `js/ganttManager.js`
  - `css/gantt.css`
- **Grund:** Behebung eines kritischen UI-Fehlers und Verbesserung der Benutzerfreundlichkeit auf Benutzerwunsch.

### 2024-05-24

- **Änderung:** Die Quest-Balken im Gantt-Chart wurden visuell aufgeteilt. Sie enthalten nun ein 10% hohes oberes Segment mit einer eigenen ID, um zukünftig Projektfarben darstellen zu können.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
  - `css/gantt.css`
- **Grund:** Vorbereitung der visuellen Darstellung für das geplante "Mini-Projekte"-Feature.

### 2024-05-24

- **Änderung:** Ein Fehler wurde behoben, bei dem der "Split"-Button bei visuell aufgeteilten Quests im Pomodoro-Modus nicht mehr angezeigt wurde.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Korrektur eines Anzeigefehlers nach der Implementierung der visuellen Quest-Aufteilung.

### 2024-05-24

- **Änderung:** Ein `TypeError` wurde behoben, der beim Rendern von Quests im Pomodoro-Modus auftrat. Die fehlende Methode `calculateWorkSegmentsForQuest` wurde im `GanttSortManager` implementiert, um die visuelle Aufteilung von Quest-Balken wiederherzustellen.
- **Betroffene Dateien:**
  - `js/ganttSortManager.js`
- **Grund:** Behebung eines kritischen Fehlers, der nach einer Code-Umstrukturierung auftrat.

### 2024-05-24

- **Änderung:** Die visuelle Darstellung von Quests im Pomodoro-Modus wurde verbessert. Quest-Balken werden nun visuell aufgeteilt ("geschnitten"), wenn sie von einem Pausenblock unterbrochen werden.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Verbesserung der visuellen Klarheit im Gantt-Chart, um die tatsächlichen Arbeitsblöcke darzustellen.

### 2024-05-24

- **Änderung:** Die Anzeigebedingung für den "Split"-Button wurde präzisiert. Er erscheint nun nur noch bei Quests, die länger als 25 Minuten dauern.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Korrektur der Anzeigelogik gemäß Benutzer-Feedback.

### 2024-05-24

- **Änderung:** Der "Split"-Button für Quests im Gantt-Chart wird nun nur noch angezeigt, wenn der Pomodoro-Modus aktiv ist und die Quest eine Dauer von mindestens 25 Minuten hat.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Verbesserung der UI-Klarheit und Relevanz des Buttons auf Benutzerwunsch.

### 2024-05-24

- **Änderung:** Ein "Split"-Button wurde zu den Quest-Balken im Gantt-Chart hinzugefügt, der nur im Pomodoro-Modus sichtbar ist. Er öffnet ein neues Modal, das den Benutzer über die zukünftige Funktion zur Aufteilung von Quests informiert.
- **Betroffene Dateien:**
  - `index.html`
  - `js/ganttManager.js`
- **Grund:** Vorbereitung der Benutzeroberfläche für die Implementierung der Quest-Aufteilungsfunktion.

### 2024-05-24

- **Änderung:** Ein Fehler wurde behoben, bei dem die Buttons im Popover zur Anpassung der Pausendauer nicht angezeigt wurden. Die Aktualisierungslogik wurde korrigiert, um das Popover nicht vorzeitig zu schließen. Die Button-Anzeige ist nun intelligent und zeigt nur relevante Optionen an.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Behebung eines kritischen Fehlers bei der Interaktion mit Pausenbalken und Verbesserung der Benutzerfreundlichkeit auf Benutzerwunsch.

### 2024-05-24

- **Änderung:** Ein Fehler wurde behoben, bei dem die IDs der Pomodoro-Pausen im Test-Tool als "undefined" angezeigt wurden. Die IDs werden nun direkt nach der Generierung des Pausenrasters zugewiesen und sind somit im gesamten System verfügbar.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Behebung eines Anzeigefehlers im Test-Tool und Verbesserung der Datenkonsistenz.

### 2024-05-24

- **Änderung:** Ein Fehler wurde behoben, bei dem Pomodoro-Pausenbalken keine eindeutige ID hatten (`data-break-id="undefined"`). Die `_renderPomodoroBreaks`-Methode generiert nun eine ID für jeden Balken, was die Interaktivität (Anpassung der Dauer) wiederherstellt.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Behebung eines kritischen Fehlers, der die korrekte Interaktion mit einzelnen Pausenbalken verhinderte.

### 2024-05-24

- **Änderung:** Die Test-Werkzeuge wurden neu organisiert. Gantt-Chart-bezogene Test-Buttons sind nun in einer eigenen Kategorie "Gantt & Zeit" gruppiert. Zusätzlich wird im "Pomodoro Pausen-Liste"-Testfenster nun die ID jeder Pause angezeigt.
- **Betroffene Dateien:**
  - `index.html`
  - `js/ganttManager.js`
- **Grund:** Verbesserung der Übersichtlichkeit der Test-Werkzeuge und Erweiterung der Debugging-Möglichkeiten auf Benutzerwunsch.

### 2024-05-24

- **Änderung:** Ein Fehler wurde behoben, der das Popover zur Anpassung der Pausendauer sofort nach der Interaktion schloss. Die `_updatePomodoroBreakDuration`-Methode rendert nun das Gantt-Chart neu, nachdem die Dauer geändert wurde, was die korrekte Funktionalität wiederherstellt.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Behebung eines kritischen Fehlers, der die Interaktion mit den Pausenbalken verhinderte.

### 2024-05-24

- **Änderung:** Ein neues Test-Werkzeug wurde implementiert. Ein Button "Pomodoro Pausen-Liste" öffnet ein Modal, das alle aktiven Pausen auflistet und es ermöglicht, deren Dauer testweise zu verlängern. Die temporären Test-Buttons unter den Pausenbalken wurden entfernt.
- **Betroffene Dateien:**
  - `index.html`
  - `js/ganttManager.js`
- **Grund:** Implementierung eines robusten Test-Werkzeugs zur Fehlersuche bei der Anpassung von Pomodoro-Pausen.

### 2024-05-24

- **Änderung:** Temporäre Test-Buttons ("+5m") wurden unter den Pomodoro-Pausenbalken hinzugefügt, um die Funktionalität der Pausenanpassung zu debuggen.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Systematische Fehlersuche, um zu isolieren, ob das Problem bei der Popover-Anzeige oder der Aktualisierungslogik liegt.

### 2024-05-24

- **Änderung:** Ein Fehler wurde behoben, bei dem die Buttons im Popover zur Anpassung der Pausendauer nicht angezeigt wurden. Die `_updatePomodoroBreakDuration`-Methode hat fälschlicherweise das gesamte Gantt-Chart neu gerendert und damit das Popover geschlossen. Der fehlerhafte Aufruf wurde entfernt.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Behebung eines kritischen Fehlers, der die Interaktion mit den Pausenbalken verhinderte.

### 2024-05-24

- **Änderung:** Ein Fehler wurde behoben, bei dem die Buttons im Popover zur Anpassung der Pausendauer nicht angezeigt wurden. Die `_updatePomodoroBreakDuration`-Methode hat fälschlicherweise das gesamte Gantt-Chart neu gerendert und damit das Popover geschlossen.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Behebung eines kritischen Fehlers, der die Interaktion mit den Pausenbalken verhinderte.

### 2024-05-24

- **Änderung:** Ein Fehler wurde behoben, bei dem die Buttons im Popover zur Anpassung der Pausendauer nicht angezeigt wurden. Die `_updatePomodoroBreakDuration`-Methode hat fälschlicherweise das gesamte Gantt-Chart neu gerendert und damit das Popover geschlossen.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Behebung eines kritischen Fehlers, der die Interaktion mit den Pausenbalken verhinderte.

### 2024-05-24

- **Änderung:** Ein Fehler wurde behoben, bei dem die Buttons im Popover zur Anpassung der Pausendauer nicht angezeigt wurden. Die `_updatePomodoroBreakDuration`-Methode hat fälschlicherweise das gesamte Gantt-Chart neu gerendert und damit das Popover geschlossen.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Behebung eines kritischen Fehlers, der die Interaktion mit den Pausenbalken verhinderte.

### 2024-05-24

- **Änderung:** Ein Fehler wurde behoben, bei dem die Anpassung der Pomodoro-Pausendauer immer nur die erste Pause betraf. Die eindeutige `data-break-id` wird nun korrekt den Pausenbalken zugewiesen.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Behebung eines kritischen Fehlers, der die korrekte Interaktion mit einzelnen Pausenbalken verhinderte.

### 2024-05-24

- **Änderung:** Die Logik zur Anpassung der Pomodoro-Pausendauer wurde korrigiert. Eine Änderung der Dauer eines Pausenbalkens beeinflusst nun nicht mehr die Position der nachfolgenden Pausen.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Anpassung der Funktionalität auf Benutzerwunsch, um nur die Dauer des ausgewählten Pausenbalkens zu ändern.

### 2024-05-24

- **Änderung:** Die Funktionalität zur Anpassung der Pomodoro-Pausendauer über das Popover wurde implementiert. Beim Ändern der Dauer eines Pausenbalkens werden alle nachfolgenden Pausen entsprechend verschoben und das Gantt-Chart neu gerendert und sortiert.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Implementierung der vollständigen Funktionalität für interaktive Pomodoro-Pausenbalken auf Benutzerwunsch.

### 2024-05-24

- **Änderung:** Das Popover-Fenster (z.B. für Pausenanpassung) wurde verbessert. Es hat nun eine maximale Höhe und zeigt bei Bedarf eine Scrollleiste an, um sicherzustellen, dass alle Inhalte sichtbar sind.
- **Betroffene Dateien:**
  - `css/gantt.css`
- **Grund:** Verbesserung der UI-Robustheit, um das Abschneiden von Inhalten in Popover-Fenstern zu verhindern.

### 2024-05-24

- **Änderung:** Ein CSS-Fehler wurde behoben, der verhinderte, dass die Buttons im Popover zur Anpassung der Pomodoro-Pausendauer angezeigt wurden. Eine zu allgemeine CSS-Regel wurde entfernt und die Regel für den Schließen-Button präzisiert.
- **Betroffene Dateien:**
  - `css/gantt.css`
- **Grund:** Behebung eines visuellen Fehlers, der die Interaktivität der Pausenbalken unmöglich machte.

### 2024-05-24

- **Änderung:** Ein CSS-Fehler wurde behoben, der verhinderte, dass die Buttons im Popover zur Anpassung der Pomodoro-Pausendauer angezeigt wurden. Eine zu allgemeine CSS-Regel wurde korrigiert.
- **Betroffene Dateien:**
  - `css/gantt.css`
- **Grund:** Behebung eines visuellen Fehlers, der die Interaktivität der Pausenbalken unmöglich machte.

### 2024-05-24

- **Änderung:** Die Pomodoro-Pausenbalken sind nun interaktiv. Ein Klick öffnet ein Popover, in dem die Dauer der Pause auf 5 oder 10 Minuten gesetzt oder manuell eingegeben werden kann. Das Gantt-Chart wird danach automatisch aktualisiert.
- **Betroffene Dateien:**
  - `css/gantt.css`
  - `js/ganttManager.js`
- **Grund:** Implementierung eines Benutzerwunsches zur direkten Anpassung der Pausenzeiten im Gantt-Chart.

### 2024-05-24

- **Änderung:** Die visuelle Darstellung von geteilten Pomodoro-Pausenbalken wurde von einer vertikalen zu einer horizontalen Teilung geändert. Wenn eine Pause genau zwischen zwei Quests liegt, wird sie nun als zwei halbbreite Balken in den jeweiligen Quest-Zeilen dargestellt.
- **Betroffene Dateien:**
  - `css/gantt.css`
- **Grund:** Anpassung der visuellen Darstellung auf Benutzerwunsch.

### 2024-05-24

- **Änderung:** Ein `TypeError` wurde behoben, der beim Öffnen der Pomodoro-Einstellungen auftrat. Veraltete Aufrufe einzelner Styling-Funktionen (`_applyPomodoroStyle`) wurden entfernt, da diese bereits durch die zentrale `_applyPomodoroStyling`-Methode ersetzt wurden.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Behebung eines kritischen Fehlers nach einer Code-Umstrukturierung (Refactoring).

### 2024-05-24

- **Änderung:** Ein `TypeError` wurde behoben, der beim Öffnen der Pomodoro-Einstellungen auftrat. Veraltete Aufrufe einzelner Styling-Funktionen wurden durch den korrekten Aufruf der neuen, zentralen `_applyPomodoroStyling`-Methode ersetzt.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Behebung eines kritischen Fehlers nach einer Code-Umstrukturierung (Refactoring).

### 2024-05-24

- **Änderung:** Ein Fehler wurde behoben, bei dem die benutzerdefinierten Farben für Pomodoro-Pausenbalken nicht beim Laden der Seite angewendet wurden. Die Styling-Funktion wird nun beim Laden der Einstellungen aufgerufen.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Behebung eines visuellen Fehlers, bei dem die Farb-Einstellungen erst nach erneutem Speichern wirksam wurden.

### 2024-05-24

- **Änderung:** Die Pomodoro-Balken-Einstellungen wurden erweitert. Benutzer können nun die Farbe der Umrandung und festlegen, ob die Ecken abgerundet sein sollen.
- **Betroffene Dateien:**
  - `index.html`
  - `js/ganttManager.js`
  - `css/gantt.css`
  - `PROCESS_DOCS/DATABASE_PATHS.md`
  - `PROCESS_DOCS/Secound To do list.md`
- **Grund:** Erweiterung der visuellen Anpassungsmöglichkeiten für den Pomodoro-Modus auf Benutzerwunsch.

### 2024-05-24

- **Änderung:** Die Anzeige der Pomodoro-Pausenbalken wurde verbessert. Pausen, die genau zwischen zwei Quests liegen, werden nun visuell aufgeteilt und in beiden Quest-Zeilen mit halber Höhe dargestellt.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
  - `css/gantt.css`
- **Grund:** Verbesserung der visuellen Klarheit bei der Darstellung von Pausen zwischen Quests.

### 2024-05-24

- **Änderung:** Die Anzeige der Pomodoro-Pausenbalken wurde angepasst. Sie werden nun nur noch in der Zeile einer Quest angezeigt, wenn die Pause sich zeitlich mit der Quest überschneidet.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Verbesserung der visuellen Klarheit im Gantt-Chart auf Benutzerwunsch.

### 2024-05-24

- **Änderung:** Die visuelle Darstellung im Gantt-Chart wurde angepasst. Pomodoro-Pausenbalken liegen nun über den Quest-Balken, um Unterbrechungen deutlicher zu machen.
- **Betroffene Dateien:**
  - `css/gantt.css`
- **Grund:** Verbesserung der Lesbarkeit des Gantt-Charts im Pomodoro-Modus.

### 2024-05-24

- **Änderung:** Der Plan für die "Aufräum"-Funktion in `Secound To do list.md` wurde gemäß Benutzer-Feedback um zusätzliche Optionen ("als erledigt markieren", "ohne Bearbeitungstag") erweitert.
- **Betroffene Dateien:**
  - `PROCESS_DOCS/Secound To do list.md`
- **Grund:** Präzisierung der Anforderungen für ein zukünftiges Feature.

### 2024-05-24

- **Änderung:** Ein Fehler wurde behoben, bei dem das "Bearbeitungstag"-Feld im "Quest bearbeiten"-Fenster nicht korrekt geladen wurde. Es wird nun das `ganttScheduledAt`-Datum verwendet.
- **Betroffene Dateien:**
  - `js/questManager.js`
- **Grund:** Behebung eines Datenanzeigefehlers im Bearbeitungs-Modal.

### 2024-05-24

- **Änderung:** Die Logik des Gantt-Charts wurde angepasst, um die Navigation zwischen verschiedenen Tagen zu ermöglichen. Die Datumsanzeige ist nicht mehr statisch und die Test-Buttons ändern nun das angezeigte Datum. Eine neue "Aufräum"-Funktion wurde in der To-Do-Liste geplant.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
  - `js/testToolsManager.js`
  - `PROCESS_DOCS/Secound To do list.md`
- **Grund:** Behebung eines Fehlers bei der Datumsanzeige und Implementierung der Grundlage für eine Datumsnavigation.

### 2024-05-24

- **Änderung:** Die Datumsanzeige wurde in die Steuerungsleiste des Gantt-Charts verschoben. Ein Fehler wurde behoben, bei dem der Test-Button "+5 Quests für Heute" eine falsche Logik ausführte.
- **Betroffene Dateien:**
  - `index.html`
  - `js/testToolsManager.js`
- **Grund:** Verbesserung der UI-Anordnung und Behebung eines Fehlers in der Test-Funktionalität.

### 2024-05-24

- **Änderung:** Ein Fehler wurde behoben, bei dem der Test-Button "+5 Quests für Heute" fälschlicherweise neue Quests erstellte. Er aktualisiert nun bestehende Quests. Zusätzlich wurde die Datumsanzeige über dem Gantt-Chart aktiviert.
- **Betroffene Dateien:**
  - `js/testToolsManager.js`
  - `js/ganttManager.js`
- **Grund:** Behebung von Fehlern bei der Test-Funktionalität und der UI-Anzeige.

### 2024-05-24

- **Änderung:** Die Gantt-Chart-Anzeige wurde angepasst. Sie lädt standardmäßig nur noch Quests für den heutigen Tag. Eine Datumsanzeige wurde hinzugefügt und die Logik des Test-Buttons "+5 Quests für Heute" wurde korrigiert.
- **Betroffene Dateien:**
  - `index.html`
  - `js/ganttManager.js`
  - `js/testToolsManager.js`
- **Grund:** Verbesserung der Standardansicht und Behebung von Fehlern im Zusammenhang mit der Quest-Planung für den heutigen Tag.

### 2024-05-24

- **Änderung:** Die Logik für den "Heute"-Button in "Meine Quests" und den Test-Button "+5 Quests für Heute" wurde angepasst. Beide setzen nun das `ganttScheduledAt`-Datum auf den aktuellen Tag, um Quests im Gantt-Chart zu planen.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
  - `js/testToolsManager.js`
- **Grund:** Vereinheitlichung der Funktionalität zum Planen von Quests für den aktuellen Tag.

### 2024-05-24

- **Änderung:** Ein Fehler wurde behoben, bei dem die Startzeit im Pomodoro-Aktivierungsfenster und in den Einstellungen nicht synchronisiert war. Die Startzeit wird nun an beiden Stellen aus derselben Datenquelle geladen und beim Aktivieren gespeichert.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Behebung eines Logikfehlers, der zu inkonsistenten Zuständen führen konnte.

### 2024-05-24

- **Änderung:** Ein Fehler in der Pomodoro-Sortierlogik wurde behoben. Die Quest mit Priorität 1 wurde fälschlicherweise in die Konfliktprüfung mit Pausen einbezogen. Die Logik behandelt die erste Quest nun korrekt als separaten "Nullpunkt".
- **Betroffene Dateien:**
  - `js/ganttSortManager.js`
- **Grund:** Finale Behebung des Fehlers bei der automatischen Quest-Sortierung.

### 2024-05-24

- **Änderung:** Die Pomodoro-Sortierlogik wurde korrigiert. Die fälschlicherweise implementierte Konfliktprüfung mit Pausen wurde entfernt. Quests werden nun nahtlos aneinandergereiht, ohne die Pausen zu berücksichtigen.
- **Betroffene Dateien:**
  - `js/ganttSortManager.js`
- **Grund:** Korrektur der Sortierlogik gemäß Benutzeranweisung.

### 2024-05-24

- **Änderung:** Ein Werkzeug zum Ein- und Ausschalten der Konsolenausgaben für Quest-Positionierung und Pausen-Rendering wurde im Test-Werkzeuge-Modal implementiert.
- **Betroffene Dateien:**
  - `index.html`
  - `js/ganttManager.js`
  - `js/ganttSortManager.js`
- **Grund:** Verbesserung der Debugging-Möglichkeiten auf Benutzerwunsch.

### 2024-05-24

- **Änderung:** Die Konsolenausgabe für die automatische Quest-Sortierung wurde erweitert. Sie zeigt nun für jede Quest die Start- und Endzeit sowie die verwendete Berechnungsformel an.
- **Betroffene Dateien:**
  - `js/ganttSortManager.js`
- **Grund:** Verbesserung der Nachvollziehbarkeit der Sortierfunktion auf Benutzerwunsch.

### 2024-05-24

- **Änderung:** Ein Fehler in der Pomodoro-Sortierlogik wurde behoben. Die Logik zum Überspringen von Pausen war fehlerhaft, was zu einer falschen Platzierung der Quests führte.
- **Betroffene Dateien:**
  - `js/ganttSortManager.js`
- **Grund:** Finale Behebung des Fehlers bei der automatischen Quest-Sortierung.

### 2024-05-24

- **Änderung:** Die Pomodoro-Sortierlogik wurde korrigiert. Die Quest mit der höchsten Priorität wird nun als fester "Nullpunkt" an die Startzeit gesetzt. Alle weiteren Quests werden korrekt daran anschließend sortiert.
- **Betroffene Dateien:**
  - `js/ganttSortManager.js`
- **Grund:** Finale Behebung des Fehlers bei der automatischen Quest-Sortierung.

### 2024-05-24

- **Änderung:** Die Fehleranalyse für die Pomodoro-Sortierung wurde durch detaillierte Konsolenausgaben erweitert, um die Platzierungslogik für jede einzelne Quest nachvollziehen zu können.
- **Betroffene Dateien:**
  - `js/ganttSortManager.js`
  - `PROCESS_DOCS/BUG_PomodoroSortierung_Analyse.md`
- **Grund:** Systematische Fehlersuche bei der fehlschlagenden Quest-Sortierung.

### 2024-05-24

- **Änderung:** Die Pomodoro-Sortierlogik wurde grundlegend korrigiert. Sie platziert die Quests nun korrekt ab der eingestellten Startzeit und reiht sie nahtlos aneinander, wobei Pausen korrekt übersprungen werden.
- **Betroffene Dateien:**
  - `js/ganttSortManager.js`
- **Grund:** Finale Behebung des Fehlers bei der automatischen Quest-Sortierung.

### 2024-05-24

- **Änderung:** Der Pomodoro-Aktivierungsprozess wurde verbessert. Nach dem Aktivieren wird nun nicht mehr nur die erste Quest verschoben, sondern es wird eine vollständige automatische Sortierung aller Quests basierend auf ihrer Priorität ausgelöst.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Verbesserung der Benutzerfreundlichkeit und vollständige Automatisierung des Sortierprozesses bei Aktivierung des Pomodoro-Modus.

### 2024-05-24

- **Änderung:** Beim Aktivieren des Pomodoro-Modus wird die Quest mit der höchsten Priorität nun automatisch an die festgelegte Startzeit verschoben.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Verbesserung der Benutzerfreundlichkeit und Automatisierung des Pomodoro-Workflows.

### 2024-05-24

- **Änderung:** Die Prioritäts-Auswahlliste im Pomodoro-Modus wurde angepasst. Sie zeigt nun dynamisch so viele Optionen an, wie Quests für den Tag geplant sind.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Verbesserung der Benutzerfreundlichkeit der Priorisierungsfunktion.

### 2024-05-24

- **Änderung:** Eine Priorisierungsfunktion für den Pomodoro-Modus wurde implementiert. Im Gantt-Chart wird nun neben jeder Quest ein Auswahlfeld (1-4) angezeigt, um die Sortierreihenfolge zu steuern. Die Sortierlogik wurde entsprechend angepasst.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
  - `js/ganttSortManager.js`
  - `PROCESS_DOCS/DATABASE_PATHS.md`
- **Grund:** Implementierung eines Benutzerwunsches zur Steuerung der Pomodoro-Sortierung.

### 2024-05-24

- **Änderung:** Ein Fehler in der Pomodoro-Sortierlogik wurde behoben. Die Berechnung der Arbeitsblöcke ignorierte den ersten Block vor der ersten Pause, was zu einer falschen Platzierung der ersten Quest führte.
- **Betroffene Dateien:**
  - `js/ganttSortManager.js`
- **Grund:** Finale Behebung des Fehlers bei der automatischen Quest-Sortierung.

### 2024-05-24

- **Änderung:** Ein Fehler wurde behoben, bei dem Pomodoro-Pausenbalken bis zum Ende des Tages gerendert wurden. Die Generierung stoppt nun nach der letzten Quest. Zusätzlich wurde die Konsolenausgabe für Quest-Verschiebungen um die Endzeit erweitert.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
  - `js/ganttSortManager.js`
- **Grund:** Behebung eines visuellen Fehlers und Verbesserung der Nachvollziehbarkeit auf Benutzerwunsch.

### 2024-05-24

- **Änderung:** Eine permanente Konsolenausgabe wurde hinzugefügt, die beim Rendern der Pomodoro-Pausenbalken deren Typ und Startzeit anzeigt.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Verbesserung der Nachvollziehbarkeit der Pausen-Platzierung auf Benutzerwunsch.

### 2024-05-24

- **Änderung:** Eine permanente Konsolenausgabe wurde hinzugefügt, die beim manuellen Verschieben einer Quest im Gantt-Chart die neue Startzeit anzeigt.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Verbesserung der Nachvollziehbarkeit bei manuellen Änderungen.

### 2024-05-24

- **Änderung:** Eine permanente Konsolenausgabe wurde auf Benutzerwunsch wieder implementiert. Bei jeder automatischen Sortierung wird nun die neue Startzeit der jeweiligen Quest in der Konsole angezeigt.
- **Betroffene Dateien:**
  - `js/ganttSortManager.js`
- **Grund:** Verbesserung der Nachvollziehbarkeit der Sortierfunktion.

### 2024-05-24

- **Änderung:** Die Pomodoro-Sortierlogik wurde grundlegend korrigiert. Ein Fehler, der dazu führte, dass der erste Arbeitsblock ignoriert und Quests nicht fortlaufend platziert wurden, wurde behoben.
- **Betroffene Dateien:**
  - `js/ganttSortManager.js`
- **Grund:** Finale Behebung des Fehlers bei der automatischen Quest-Sortierung.

### 2024-05-24

- **Änderung:** Ein Fehler in der Pomodoro-Sortierlogik wurde behoben. Quests wurden fälschlicherweise immer am Anfang eines neuen Arbeitsblocks platziert, anstatt hintereinander. Die Logik wurde korrigiert, um eine fortlaufende Platzierung zu gewährleisten. Debug-Ausgaben wurden hinzugefügt.
- **Betroffene Dateien:**
  - `js/ganttSortManager.js`
  - `PROCESS_DOCS/BUG_PomodoroSortierung_Analyse.md`
- **Grund:** Finale Behebung des Fehlers bei der automatischen Quest-Sortierung.

### 2024-05-24

- **Änderung:** Ein Fehler in der Pomodoro-Sortierlogik wurde behoben. Die Berechnung der Arbeitsblöcke ignorierte den ersten Block vor der ersten Pause, was zu einer falschen Platzierung der ersten Quest führte.
- **Betroffene Dateien:**
  - `js/ganttSortManager.js`
- **Grund:** Finale Behebung des Fehlers bei der automatischen Quest-Sortierung.

### 2024-05-24

- **Änderung:** Die Logik zur Quest-Sortierung im Pomodoro-Modus wurde grundlegend überarbeitet, um eine Endlosschleife und falsche Platzierungen zu beheben. Die Methode berechnet nun zuerst die verfügbaren Arbeitsblöcke und sortiert die Quests anschließend in diese ein.
- **Betroffene Dateien:**
  - `js/ganttSortManager.js`
  - `PROCESS_DOCS/BUG_PomodoroSortierung_Analyse.md`
- **Grund:** Finale Behebung des Fehlers bei der automatischen Quest-Sortierung.

### 2024-05-24

- **Änderung:** Ein Fehler in der Pomodoro-Sortierfunktion wurde behoben, der zu einer Endlosschleife führte. Die Logik zur Erkennung von Konflikten zwischen Quests und Pausen wurde im `GanttSortManager` korrigiert.
- **Betroffene Dateien:**
  - `js/ganttSortManager.js`
  - `PROCESS_DOCS/BUG_PomodoroSortierung_Analyse.md`
- **Grund:** Finale Behebung des Fehlers bei der automatischen Quest-Sortierung im Pomodoro-Modus.

### 2024-05-24

- **Änderung:** Ein Fehler wurde behoben, der verhinderte, dass die Pomodoro-Sortierlogik aufgerufen wurde. Der Status `pomodoroModeActive` wurde im `GanttManager` nicht korrekt gesetzt.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Behebung eines logischen Fehlers, der die korrekte Auswahl der Sortiermethode verhinderte.

### 2024-05-24

- **Änderung:** Die Fehleranalyse für die Pomodoro-Sortierung wurde erweitert, um die Bedingung für den Aufruf der Pomodoro-Sortiermethode zu überprüfen. Konsolenausgaben für `pomodoroModeActive` und `pomodoroBreaks` wurden hinzugefügt.
- **Betroffene Dateien:**
  - `js/ganttSortManager.js`
  - `PROCESS_DOCS/BUG_PomodoroSortierung_Analyse.md`
- **Grund:** Systematische Fehlersuche bei der fehlschlagenden Quest-Sortierung.

### 2024-05-24

- **Änderung:** Die Fehleranalyse für die Pomodoro-Sortierung wurde auf Schritt 2.5 erweitert. Es werden nun die komplette Liste der lokalen Quests und die gefilterte Liste ausgegeben, um zu prüfen, warum keine Quests für die Sortierung gefunden werden.
- **Betroffene Dateien:**
  - `js/ganttSortManager.js`
  - `PROCESS_DOCS/BUG_PomodoroSortierung_Analyse.md`
- **Grund:** Systematische Fehlersuche bei der fehlschlagenden Quest-Sortierung.

### 2024-05-24

- **Änderung:** Die Fehleranalyse für die Pomodoro-Sortierung wurde auf Schritt 3 erweitert. Es werden nun detaillierte Konsolenausgaben zur Zeitberechnung innerhalb der Sortierschleife erzeugt.
- **Betroffene Dateien:**
  - `js/ganttSortManager.js`
  - `PROCESS_DOCS/BUG_PomodoroSortierung_Analyse.md`
- **Grund:** Systematische Fehlersuche bei der fehlschlagenden Quest-Sortierung.

### 2024-05-24

- **Änderung:** Ein Fehler in der Pomodoro-Sortierlogik wurde behoben. Die Sortierung beginnt nun korrekt bei der in den Einstellungen festgelegten Startzeit, anstatt sich an der Position der ersten Quest zu orientieren.
- **Betroffene Dateien:**
  - `js/ganttSortManager.js`
- **Grund:** Behebung eines logischen Fehlers in der Quest-Sortierfunktion.

### 2024-05-24

- **Änderung:** Ein `SyntaxError: Illegal return statement` in `ganttSortManager.js` wurde behoben. Überflüssiger Code am Ende der Datei, der den Fehler verursachte, wurde entfernt.
- **Betroffene Dateien:**
  - `js/ganttSortManager.js`
- **Grund:** Behebung eines kritischen Fehlers, der die Ausführung der Sortierfunktion verhinderte.

### 2024-05-24

- **Änderung:** Ein Fehler in der Pomodoro-Sortierfunktion wurde behoben. Die Logik im `GanttSortManager` wurde korrigiert, um die korrekten Pausendaten (`pomodoroBreaks`) zu verwenden, anstatt auf eine veraltete, leere Datenstruktur zuzugreifen.
- **Betroffene Dateien:**
  - `js/ganttSortManager.js`
  - `PROCESS_DOCS/BUG_PomodoroSortierung_Analyse.md`
- **Grund:** Finale Behebung des Fehlers bei der automatischen Quest-Sortierung im Pomodoro-Modus.

### 2024-05-24

- **Änderung:** Die Bug-Analyse für die Pomodoro-Sortierung wurde auf Schritt 2 erweitert. Es werden nun Konsolenausgaben zur Überprüfung der Eingabedaten (Zeitplan-Blöcke und Quests) erzeugt.
- **Betroffene Dateien:**
  - `js/ganttSortManager.js`
  - `PROCESS_DOCS/BUG_PomodoroSortierung_Analyse.md`
- **Grund:** Systematische Fehlersuche bei der fehlschlagenden Quest-Sortierung.

### 2024-05-24

- **Änderung:** Eine systematische Fehleranalyse für die Pomodoro-Quest-Sortierung wurde gestartet. Der erste Debugging-Schritt (Konsolenausgabe) wurde im `GanttSortManager` implementiert.
- **Betroffene Dateien:**
  - `js/ganttSortManager.js`
  - `PROCESS_DOCS/BUG_PomodoroSortierung_Analyse.md`
- **Grund:** Start der systematischen Fehlersuche für die fehlschlagende Quest-Sortierung.

### 2024-05-24

- **Änderung:** Ein Fehler wurde behoben, bei dem der "Auto-Sortieren"-Button im Pomodoro-Modus ausgeblendet wurde. Der Button ist nun in allen Modi sichtbar.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Verbesserung der Benutzerfreundlichkeit, da die Sortierfunktion nun beide Modi unterstützt.

### 2024-05-24

- **Änderung:** Die Fehleranalyse für die Pomodoro-Sortierung wurde korrigiert. Die Debug-Ausgabe wurde in die korrekte Datei `js/ganttSortManager.js` eingefügt.
- **Betroffene Dateien:**
  - `js/ganttSortManager.js`
  - `PROCESS_DOCS/BUG_PomodoroSortierung_Analyse.md`
- **Grund:** Korrektur eines Fehlers im Analyseprozess.

### 2024-05-24

- **Änderung:** Eine systematische Fehleranalyse für die Pomodoro-Quest-Sortierung wurde gestartet. Eine Analyse-Datei (`BUG_PomodoroSortierung_Analyse.md`) wurde erstellt und der erste Debugging-Schritt (Konsolenausgabe) wurde im `GanttSortManager` implementiert.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
  - `PROCESS_DOCS/BUG_PomodoroSortierung_Analyse.md` (neu)
- **Grund:** Start der systematischen Fehlersuche für die fehlschlagende Quest-Sortierung.

### 2024-05-24

- **Änderung:** Die Logik zur automatischen Sortierung von Quests im Pomodoro-Modus wurde implementiert. Die `sortAllQuests`-Methode im `GanttSortManager` sortiert Quests nun in die Lücken des Pausenrasters. Das Aufteilen von zu langen Quests ist noch nicht implementiert.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
  - `PROCESS_DOCS/Secound To do list.md`
- **Grund:** Implementierung von Schritt 3 des neuen, regelbasierten Pomodoro-Systems.

### 2024-05-24

- **Änderung:** Die systematische Bug-Analyse für den Pomodoro-Anzeigefehler wurde abgeschlossen. Temporäre Debug-Ausgaben wurden aus dem Code entfernt und die Analyse-Datei wurde mit der finalen Lösung aktualisiert.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
  - `PROCESS_DOCS/BUG_PomodoroAnzeige_Analyse.md`
- **Grund:** Abschluss der Fehlerbehebung und Bereinigung des Codes.

### 2024-05-24

- **Änderung:** Ein Anzeigefehler wurde behoben, bei dem benutzerdefinierte Pomodoro-Stile erst nach einer Interaktion und nicht beim initialen Laden angewendet wurden. Die Logik zum Anwenden der Stile wurde in die zentrale `render`-Methode verschoben.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Behebung eines visuellen Fehlers (Flickering) beim Rendern der Pomodoro-Pausenbalken.

### 2024-05-24

- **Änderung:** Ein Anzeigefehler wurde behoben, bei dem Pomodoro-Pausenbalken als 1px breite Striche am Anfang der Zeitleiste erschienen. Die Positionsberechnung in `_renderPomodoroBreaks` wurde auf eine robustere prozentuale Methode umgestellt, um Timing-Probleme im Browser-Rendering zu umgehen.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Finale Behebung des Pomodoro-Anzeigefehlers.

### 2024-05-24

- **Änderung:** Ein Fehler wurde behoben, bei dem die Pomodoro-Pausenbalken nicht angezeigt wurden. Die Referenz auf das `timelineGrid`-Element wurde nun korrekt durch die Rendering-Methoden (`_renderGanttRow` zu `_renderPomodoroBreaks`) weitergereicht, anstatt erfolglos im DOM gesucht zu werden.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
  - `PROCESS_DOCS/BUG_PomodoroAnzeige_Analyse.md`
- **Grund:** Finale Behebung des Pomodoro-Anzeigefehlers.

### 2024-05-24

- **Änderung:** Die Bug-Analyse für den Pomodoro-Anzeigefehler wurde auf Schritt 2 erweitert. Es werden nun Konsolenausgaben zur Überprüfung der HTML-Elemente (`parentCell` und `timelineGrid`) erzeugt.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
  - `PROCESS_DOCS/BUG_PomodoroAnzeige_Analyse.md`
- **Grund:** Systematische Fehlersuche beim Rendern der Pomodoro-Pausenbalken.

### 2024-05-24

- **Änderung:** Eine Debugging-Ausgabe (`console.log`) wurde zum `dragstart`-Event im `GanttInteractionManager` hinzugefügt. Sie gibt die horizontale Scroll-Position des Gantt-Charts aus, wenn ein Quest-Balken gezogen wird.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Fehlersuche bei der Positionierung von Elementen im Gantt-Chart.

### 2024-05-24

- **Änderung:** Detaillierte Debugging-Ausgaben (`console.log`) wurden zur `_renderPomodoroBreaks`-Methode hinzugefügt, um die Berechnung der horizontalen Position der Pausenbalken zu analysieren.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Fehlersuche bei der visuellen Positionierung der Pomodoro-Pausenbalken.

### 2024-05-24

- **Änderung:** Ein visueller Fehler wurde behoben, bei dem die Pomodoro-Pausenbalken an der falschen Uhrzeit gerendert wurden. Die Positionsberechnung in `_renderPomodoroBreaks` wurde korrigiert, um die Startstunde der Gantt-Ansicht zu berücksichtigen.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Finale Behebung des Bugs "Pausenbalken ignorieren Startzeit".

### 2024-05-24

- **Änderung:** Ein visueller Fehler wurde behoben, bei dem die Pomodoro-Pausenbalken an der falschen Uhrzeit gerendert wurden. Die Positionsberechnung in `_renderPomodoroBreaks` wurde korrigiert, um die Startstunde der Gantt-Ansicht zu berücksichtigen.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Finale Behebung des Bugs "Pausenbalken ignorieren Startzeit".

### 2024-05-24

- **Änderung:** Ein visueller Fehler wurde behoben, bei dem die Pomodoro-Pausenbalken an der falschen Uhrzeit (ignoriert die Startzeit) gerendert wurden. Die Positionsberechnung in `_renderPomodoroBreaks` wurde korrigiert.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Behebung des Bugs "Pausenbalken ignorieren Startzeit".

### 2024-05-24

- **Änderung:** Ein `TypeError` wurde behoben, der beim Aktivieren des Pomodoro-Modus auftrat. Der `GanttWarningManager` wurde nicht korrekt im `GanttManager` initialisiert, was zu einem Fehler führte, als auf dessen Eigenschaften zugegriffen werden sollte.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Behebung eines kritischen Fehlers, der die Aktivierung des Pomodoro-Modus verhinderte.

### 2024-05-24

- **Änderung:** Ein Fehler wurde behoben, bei dem das Aktivieren des Pomodoro-Modus keine visuellen Änderungen bewirkte. Die `pomodoroModeActive`-Variable wurde im falschen Manager (`GanttManager` statt `GanttWarningManager`) gesetzt, was das Rendern der Pausenbalken verhinderte.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Behebung eines Bugs, der die Anzeige des Pomodoro-Rasters verhinderte.

### 2024-05-24

- **Änderung:** Ein Fehler wurde behoben, bei dem das Aktivieren des Pomodoro-Modus keine visuellen Änderungen im Gantt-Chart bewirkte. Die `pomodoroModeActive`-Variable wurde beim Aktivieren nicht korrekt gesetzt.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Behebung eines Bugs, der die Anzeige des Pomodoro-Rasters verhinderte.

### 2024-05-24

- **Änderung:** Ein Fehler in der Logik des `PomodoroGridGenerator` wurde behoben, der dazu führte, dass die eingestellte Startzeit ignoriert wurde. Zusätzlich wurde eine Konsolenausgabe implementiert, die beim Aktivieren des Pomodoro-Modus die verwendeten Einstellungen anzeigt.
- **Betroffene Dateien:**
  - `js/PomodoroGridGenerator.js`
  - `js/ganttManager.js`
  - `PROCESS_DOCS/BUGLOG.md`
- **Grund:** Finale Behebung des Bugs "Pausenbalken ignorieren Startzeit" und Implementierung einer Debugging-Hilfe.

### 2024-05-24

- **Änderung:** Ein Fehler wurde behoben, bei dem die Startzeit bei der Generierung von Pomodoro-Pausen ignoriert wurde. Zusätzlich wurde die Aktivierungslogik korrigiert, sodass das Pausenraster nun direkt beim Aktivieren des Modus über die UI (und nicht nur über das Test-Tool) erstellt wird. Das Aktivierungsfenster wurde um ein Startzeit-Feld erweitert.
- **Betroffene Dateien:**
  - `js/PomodoroGridGenerator.js`
  - `js/ganttManager.js`
  - `index.html`
  - `PROCESS_DOCS/BUGLOG.md`
- **Grund:** Behebung des Bugs "Pausenbalken ignorieren Startzeit" und Implementierung der korrekten Aktivierungslogik.

### 2024-05-24

- **Änderung:** Zwei Fehler im Pomodoro-Modus wurden behoben. 1. Die Startzeit für die Pausengenerierung wird nun korrekt berücksichtigt. 2. Das Aktivieren des Modus über die UI generiert jetzt wie erwartet das Pausenraster im Gantt-Chart.
- **Betroffene Dateien:**
  - `js/PomodoroGridGenerator.js`
  - `js/ganttManager.js`
  - `PROCESS_DOCS/BUGLOG.md`
- **Grund:** Behebung des Bugs "Pausenbalken ignorieren Startzeit" und Implementierung der Aktivierungslogik.

### 2024-05-24

- **Änderung:** Die Pomodoro-Einstellungen wurden erweitert, um die Umrandungsdicke der Pausenbalken im "Balken"-Stil anpassen zu können. Die zugehörigen Farbauswahlfelder wurden in den neuen "Balken-Einstellungen"-Abschnitt verschoben.
- **Betroffene Dateien:**
  - `index.html`
  - `js/ganttManager.js`
  - `css/gantt.css`
  - `PROCESS_DOCS/DATABASE_PATHS.md`
- **Grund:** Erweiterung der Anpassungsmöglichkeiten für den Pomodoro-Modus.

### 2024-05-24

- **Änderung:** Die Pomodoro-Einstellungen wurden erweitert, um die Farbe und Dicke der Pausen-Visualisierung im "Linie"-Modus anpassen zu können. Die neuen Einstellungen werden nur angezeigt, wenn "Linie" als Stil ausgewählt ist.
- **Betroffene Dateien:**
  - `index.html`
  - `js/ganttManager.js`
  - `css/gantt.css`
  - `PROCESS_DOCS/DATABASE_PATHS.md`
- **Grund:** Erweiterung der Anpassungsmöglichkeiten für den Pomodoro-Modus.

### 2024-05-24

- **Änderung:** Die Pomodoro-Einstellungen wurden um eine Stilauswahl ("Balken" vs. "Linie") für die Pausen-Visualisierung erweitert. Die Logik im `GanttInteractionManager` wurde angepasst, um den Stil zu speichern und über eine CSS-Klasse auf das Gantt-Chart anzuwenden.
- **Betroffene Dateien:**
  - `index.html`
  - `js/ganttManager.js`
  - `css/gantt.css`
- **Grund:** Implementierung einer vom Benutzer gewünschten Erweiterung der Anpassungsmöglichkeiten für den Pomodoro-Modus.

### 2024-05-24

- **Änderung:** Ein `TypeError` wurde behoben, der beim Öffnen der Pomodoro-Einstellungen auftrat. Die fehlenden HTML-Input-Elemente für die Farbauswahl wurden in `index.html` hinzugefügt.
- **Betroffene Dateien:**
  - `index.html`
- **Grund:** Fehlerbehebung nach Implementierung der benutzerdefinierten Farben für Pausenbalken.

### 2024-05-24

- **Änderung:** Die Stilauswahl für Pomodoro-Pausenbalken wurde implementiert. Benutzer können nun im Einstellungs-Modal die Farben für kurze und lange Pausen festlegen. Die Logik im `GanttInteractionManager` wurde erweitert, um die Farben zu speichern und als CSS-Variablen anzuwenden.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
  - `css/gantt.css`
  - `index.html` (logische Änderung)
- **Grund:** Implementierung des Features "Benutzerdefinierte CSS-Anpassung für Pomodoro-Balken".

### 2024-05-24

- **Änderung:** Die visuelle Darstellung der Pomodoro-Pausenbalken wurde korrigiert. Sie werden nun als korrekte, vollflächige Hintergrundelemente anstatt als Quest-Balken gerendert.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
  - `css/gantt.css`
- **Grund:** Behebung eines visuellen Fehlers bei der Implementierung des Pomodoro-Rasters.

### 2024-05-24

- **Änderung:** Ein `404 Not Found`-Fehler wurde behoben, der durch einen falschen Dateipfad für `PomodoroGridGenerator.js` verursacht wurde. Die Datei wurde vom `PROCESS_DOCS`-Ordner in den korrekten `js`-Ordner verschoben.
- **Betroffene Dateien:**
  - `js/PomodoroGridGenerator.js` (neu)
  - `PROCESS_DOCS/PomodoroGridGenerator.js` (entfernt)
- **Grund:** Fehlerbehebung nach Einführung des Pomodoro-Grid-Systems.

### 2024-05-24

- **Änderung:** Ein `ReferenceError` wurde behoben, der durch einen fehlenden Import der `PomodoroGridGenerator`-Klasse in `ganttManager.js` verursacht wurde.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Fehlerbehebung nach Einführung des Pomodoro-Grid-Systems.

### 2024-05-24

- **Änderung:** Die fehlende Methode `renderPomodoroGrid` wurde im `GanttManager` implementiert, um den Konsolenfehler `TypeError` zu beheben. Diese Methode generiert das Pausenraster und löst ein Neuzeichnen des Gantt-Charts aus. Die Rendering-Logik wurde angepasst, um die Pausenbalken in allen Ansichten anzuzeigen.
- **Betroffene Dateien:**
  - `js/ganttManager.js`
- **Grund:** Implementierung von Schritt 2 des neuen, regelbasierten Pomodoro-Systems.

### 2024-05-24

- **Änderung:** Die neue Klasse `PomodoroGridGenerator` wurde in `js/managers/gantt/PomodoroGridGenerator.js` erstellt. Diese Klasse enthält die Logik zur Erzeugung eines regelbasierten Pausenrasters für den Pomodoro-Modus. Eine zugehörige Dokumentationsdatei wurde ebenfalls angelegt.
- **Betroffene Dateien:**
  - `js/managers/gantt/PomodoroGridGenerator.js` (neu)
  - `PROCESS_DOCS/Dokumentation_PomodoroGridGenerator.md` (neu)
- **Grund:** Implementierung von Schritt 1 des neuen, regelbasierten Pomodoro-Systems.

### 2024-05-17

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