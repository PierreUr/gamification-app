# Bug-Protokoll (Buglog)

### 2024-05-24: Gantt-Chart: Ungenaue Größenanpassung von Quest-Balken

- **Benutzerbericht:**
  ```
er sprint immer 1/3 der Pausbewegung zurück (in beide Richtungen) er erfast und über icht nicht die aktuelle maus Position als Uhrzeit
  ```
- **Status:** `Neu`
- **Priorität:** `Mittel`

### 2024-05-24: Pomodoro-Modus: Pausenbalken ignorieren Startzeit

- **Benutzerbericht:**
  ```
es erscheinen Pausen Balken, ab ca 4:15uhr die Abstände scheinen zu stimmen, nur die Start zeit wird Ignoriert.
  ```
- **Status:** `Neu`
- **Priorität:** `Mittel`

### 2024-05-24: Pomodoro-Modus: Pausenbalken-Darstellung fehlerhaft

- **Benutzerbericht:**
  ```
die Balken gehen über alle quests, nicht nur in dem Quest wo die eine Überschneidung statt findet.
  ```
- **Status:** `Erledigt`
- **Priorität:** `Mittel`

### 2025-10-21: Gantt-Chart: Fehlende Abstandswarnung im Pomodoro-Modus

- **Benutzerbericht:**
  ```
Kurze Quest unter 45 Minuten Haben auch bei keine Pause kein Warnsymbol
  ```
- **Status:** `Neu`
- **Priorität:** `Mittel`
- **Analyse:** Die `getQuestWarning`-Methode im `GanttWarningManager` prüft die Abstandswarnung (`no_gap`) erst, nachdem die Prüfung für lange Segmente (`long_segment`) fehlschlägt. Wenn eine Quest ein langes Segment hat, wird die Abstandswarnung nie erreicht, selbst wenn sie zutreffen würde.

### 2025-10-21: Neue Quests erscheinen nicht im Gantt-Chart

- **Benutzerbericht:**
  ```
Bug. eine erstellte Quest erscheint selbt mit dem wenn das Berabeitungsdatum auf heute gestellt ist nicht im Ganttchart
  ```
- **Status:** `Neu`
- **Priorität:** `Hoch`

### 2025-10-21: Aufteilungs-Logik im "Neue Quest"-Wizard fehlerhaft

- **Benutzerbericht:**
  ```
im Schritt 3: Dauer (Pflichtfeld) (neue Quest) wir bei über 45 minuten nicht abgefragt ob die Querst aufgeteiltwerden muss.
  ```
- **Status:** `Neu`
- **Priorität:** `Mittel`

### 2025-10-19: Gantt-Chart: Checkbox-Funktionalität vertauscht und Konfliktanzeige fehlerhaft

- **Benutzerbericht:**
  ```
der Haken  Promodor ist vertausche mit der Funktionalitäte
- Es werden keine ! mehr Angezeigt wenn kenie Pause vorhanden ist (ggf durch den vertauschten Promodoro)
  ```
- **Status:** `Neu`
- **Priorität:** `Wird später festgelegt`

### 2025-10-18: Gantt-Chart: Falsche Konfliktberechnung bei Quest-Aufteilung

- **Benutzerbericht:**
  ```
Bei langen quest werden bei Aufteilung kein end Pause mit einkalkuliert das ! verschwindet also 1 zu früh.
  ```
- **Status:** `Neu`
- **Priorität:** `Wird später festgelegt`

### 2024-05-24: Gantt-Chart: Drop auf Zeitleiste verursacht Neuladen

- **Benutzerbericht:**
  ```
Bug. Wenn das Gantchart auf die Zeitleiste gedropt wird läd das fenster neu.
  ```
- **Status:** `Erledigt`
- **Priorität:** `Kritisch`
- **Analyse:** Das `dragover`-Event wurde nicht für den gesamten Gantt-Container korrekt mit `preventDefault()` behandelt. Dadurch hat der Browser die Standard-Drop-Aktion (Seite neu laden) ausgeführt, wenn ein Balken auf die Kopfzeile gezogen wurde.

### 2024-05-24: Gantt-Chart: Balken springen beim Verschieben

- **Benutzerbericht:**
  ```
Bug: Die Sicht bleibt Zentriert aber die das Verschieben geht nicht die Gantts springen ans ende (um einen bestimmten wert wohl immmer gleich nach recht richtung 23 Uhr.
  ```
- **Status:** `Neu`
- **Priorität:** `Wird später festgelegt`

### 2024-05-24: Gantt-Chart: Scroll-Position springt nach Verschieben

- **Benutzerbericht:**
  ```
Bug; nach dem Verschieben der Gantts springe ich auf 00 uhr
  ```
- **Status:** `Erledigt`
- **Priorität:** `Hoch`
- **Analyse:** Die `isDragging`-Variable wurde nach einer Drag-and-Drop-Aktion nicht zurückgesetzt. Dies führte dazu, dass die Scroll-Logik beim Neuzeichnen fehlschlug und an den Anfang sprang. Die Variable wird nun im `drop`-Event zurückgesetzt.

### 2024-05-24: Gantt-Chart Einzeilen-Ansicht: Layout-Fehler

- **Benutzerbericht:**
  ```
Bug: 
- das Fenster wird in der Höhe extem vergrößer
- Überschneidungsschraffierungen liegen hinter den Ballken
  ```
- **Status:** `Erledigt`
- **Priorität:** `Mittel`
- **Analyse:** 1. Die Höhenvergrößerung wurde durch eine fälschlicherweise zugewiesene `h-full` Klasse am Elternelement verursacht. 2. Die Konfliktschraffur hatte einen zu niedrigen `z-index`.

### 2024-05-24: Gantt-Chart: Einzeilen-Ansicht funktioniert nicht (ERLEDIGT)

- **Benutzerbericht:**
  ```
nein einzel zeile keine Wirkung
  ```
- **Status:** `In Bearbeitung`
- **Priorität:** `Kritisch`
- **Analyse:** Das Problem ist eine direkte Folge des Refactorings des `GanttManager`. Die Sub-Manager (insbesondere `GanttInteractionManager`) erhalten keine korrekte Referenz auf das `ganttViewSelect`-Element, was zu einem Fehler führt und das Rendern der Ansicht verhindert.
- **Update 2024-05-24:** Nach weiteren Fixes trat ein `TypeError` auf, da Methodenaufrufe (`_setupGanttScroll`, `_addCurrentTimeIndicator`) nach dem Refactoring an den falschen Stellen standen. Der Aufruf von `_addCurrentTimeIndicator` wurde nun in den `GanttRenderManager` verschoben.

### 2024-05-23: Gantt-Chart: Auto-Pause ohne Funktion

- **Benutzerbericht:**
  ```
Autopause hat keien Funktion.
  ```
- **Status:** `Neu`
- **Priorität:** `Mittel`

### 2024-05-23: Gantt-Chart: Pausen werden nicht mehr hinzugefügt (Teilweise erledigt)

- **Benutzerbericht:**
  ```
neuer bug der auftrit, es werden keine Pause balken mehr hinzugefügt werde Auto pause nocht +5
  ```
- **Status:** `Neu`
- **Priorität:** `Hoch`

### 2025-10-12: Quests können nicht abgeschlossen werden

- **Benutzerbericht:**
  ```
Bugs: 
- Beim Verschieben eines Balken im Ganttschart wir der gantchart nach link auf 00 uhr gesetz daher ist ein Präzie verschieben nicht mögch.
- Balken mit eingefüghten Pausen kann nicht verschoben werden
- das Information Icon in den Balken (bei Klick) öffnet nicht das Bearbeitungsfenster.
  ```
- **Status:** `Neu`
- **Priorität:** `Wird später festgelegt`

### 2024-05-21: Quests können nicht abgeschlossen werden

- **Benutzerbericht:**
  ```
  Es klappt jetzt soweit nur das der Button Single Quest eine quest erstellt die ich mit dem test tool button (alle quest erledigen nicht beenden kann).
  ```
- **Status:** `Erledigt`
- **Priorität:** `Hoch`
- **Analyse:** Debugging-`console.log`-Anweisungen wurden in `questManager.js` and `testToolsManager.js` hinzugefügt, um das Problem zu untersuchen. Warten auf Feedback/Logs vom Benutzer.
