# Secound To do list

- [x] **Feature: Pomodoro-Balken-Einstellungen erweitern**

- [ ] **Feature: Tägliche "Aufräum"-Funktion für geplante Quests**
  - **Ziel:** Beim Start der App soll ein Popup den Benutzer fragen, wie mit nicht erledigten Quests vom Vortag verfahren werden soll.
  - **Planung & Umsetzung:**
    1.  **Trigger-Logik:** Im `GanttManager` eine Methode implementieren, die beim Start prüft, ob es nicht erledigte Quests mit einem `ganttScheduledAt`-Datum gibt, das vor dem heutigen Tag liegt.
    2.  **UI (Neues Modal):** Ein neues Modal in `index.html` erstellen. Es listet die betroffenen Quests auf.
    3.  **Aktions-Buttons im Modal:**
        - **"Alle auf Heute verschieben":** Setzt das `ganttScheduledAt`-Datum aller aufgelisteten Quests auf den heutigen Tag und löst eine Neusortierung aus (Option "Heute").
        - **"Alle aus Planung entfernen":** Setzt das `ganttScheduledAt`-Datum aller aufgelisteten Quests auf `null` (Option "ohne Bearbeitungstag / irgendwann").
        - **"Alle als erledigt markieren":** Ruft die `_handleQuestCompletion`-Methode für alle aufgelisteten Quests auf.
        - **"Später entscheiden":** Schließt das Modal ohne Aktion.
    4.  **Test-Tool:** Die bestehenden Test-Buttons ("+1 Tag", "Heute") können verwendet werden, um dieses Szenario zu simulieren.

- [x] **Feature: "Neue Quest"-Wizard überarbeiten & Bugfix für Gantt-Anzeige**
  - **Ziel:** Der Prozess zur Erstellung neuer Quests soll überarbeitet werden, um eine benutzergesteuerte Aufteilung im Pomodoro-Stil zu ermöglichen. Gleichzeitig soll sichergestellt werden, dass neue Quests korrekt im Gantt-Chart erscheinen.
  - **Planung & Umsetzung:**
    1.  **Bugfix `ganttScheduledAt`:** Erledigt.

- [ ] **Implementierungsplan: Quest-Splitting in Mini-Projekte**
  - **Ziel:** Quests, die länger als 45 Minuten dauern, sollen optional in untergeordnete "Mini-Quests" (Sub-Quests) aufgeteilt werden können. Dies dient als Vorbereitung für ein umfassenderes Projektmanagement.
  - **Analyse & Planung:**
    1.  **Datenmodell erweitern:**
        - Eine Quest benötigt ein neues Feld, z.B. `isParentQuest: true`.
        - Sub-Quests benötigen ein Feld `parentQuestId` zur Zuordnung.
        - Sub-Quests erben initial alle Eigenschaften (Tags, Priorität etc.) von der Parent-Quest, können aber individuell überschrieben werden.
        - Ein neues Feld `notes` (oder `sharedNotesId`) muss eingeführt werden, damit alle Sub-Quests eines Mini-Projekts auf dieselben Notizen zugreifen können.

    2.  **UI-Logik für die Aufteilung:**
        - Im "Neue Quest"- oder "Quest bearbeiten"-Modal eine Auswahlmöglichkeit (z.B. Radio-Buttons: "Frei", "25-Min-Blöcke", "45-Min-Blöcke") hinzufügen, wenn die Dauer > 45 Minuten ist.
        - Bei Aktivierung: Automatisch die notwendige Anzahl an Sub-Quests erstellen. Die Logik muss auch Pausen zwischen den Blöcken berücksichtigen (z.B. 45 Min. Arbeit, 5 Min. Pause).
        - Die Option "Frei" erlaubt eine manuelle Festlegung der Sub-Quest-Längen.

    3.  **Gantt-Chart Visualisierung:**
        - Sub-Quests müssen visuell als zusammengehörig erkennbar sein.
        - **Anforderung:** Der Balken jeder Sub-Quest soll zweifarbig sein. Der obere Bereich (ca. 15% der Höhe) erhält eine einheitliche "Projekt"-Farbe, während der untere Bereich die normale Quest-Farbe (basierend auf Status/Priorität) behält.
        - Dies erfordert eine Anpassung der `_createGanttBar`-Methode im `GanttRenderManager`, um ein inneres `div` für die zweite Farbe zu erzeugen.

    4.  **Notizsystem-Integration:**
        - Ein neues UI-Element (z.B. ein Notiz-Icon) an der Parent-Quest oder an jeder Sub-Quest anzeigen.
        - Klick darauf öffnet ein Modal, das die geteilten Notizen für das gesamte Mini-Projekt anzeigt und bearbeitbar macht.

    5.  **Interaktionslogik:**
        - Jede Sub-Quest muss individuell abschließbar sein.
        - Der Abschluss der letzten Sub-Quest schließt automatisch die Parent-Quest ab.
        - Jede Sub-Quest soll ihre eigenen Detailfragen oder Notizen haben können, die im Bearbeiten-Fenster zugänglich sind.


- [x] **Bugfix & UX-Verbesserung: Gantt-Chart - Drag & Drop Verhalten**
  - **Beschreibung:** Quest-Balken springen in ungenau zur maus Posotion beim Verschieben.
  - **Analyse & Lösung:** Die Positionsberechnung wurde korrigiert, um den Maus-Offset innerhalb des Balkens zu berücksichtigen. Das Standard-"Geisterbild" des Browsers beim Ziehen wird nun ausgeblendet, um eine rein horizontale Bewegung zu simulieren.
  - **Zugehöriger Buglog:** `2024-05-24: Gantt-Chart: Balken springen beim Verschieben`

- [ ] **Bugfix: Gantt-Chart - Verschieben von Quests mit Pausen**
  - **Beschreibung:** Quest-Balken, die eine eingefügte Pause enthalten, können nicht verschoben werden.
  - **Analyse:** Die Drag&Drop-Logik im `ganttInteractionManager.js` scheint die Datenstruktur von Quests mit Pausen nicht korrekt zu interpretieren.
  - **Zugehöriger Buglog:** `2025-10-12: Quests können nicht abgeschlossen werden` (Teil 2)

- [ ] **Bugfix: Gantt-Chart - Info-Icon öffnet kein Modal**
  - **Beschreibung:** Das Info-Icon (`i`) in den Quest-Balken öffnet beim Klick nicht das Bearbeitungsfenster.
  - **Analyse:** Der Event-Listener für das `.gantt-info-icon` im `ganttInteractionManager.js` ist wahrscheinlich fehlerhaft oder fehlt. Er sollte eine Methode im `questManager` aufrufen, um das Modal zu öffnen.
  - **Zugehöriger Buglog:** `2025-10-12: Quests können nicht abgeschlossen werden` (Teil 3)

- [ ] **Bugfix: Gantt-Chart - Manuelle Pausen ohne Funktion**
  - **Beschreibung:** Das Hinzufügen von Pausen über den "+5 min"-Button funktioniert nicht.
  - **Analyse:** Die `addManualBreak`-Methode im `ganttBreakManager.js` oder der zugehörige Event-Listener ist fehlerhaft.
  - **Zugehöriger Buglog:** `2024-05-23: Gantt-Chart: Pausen werden nicht mehr hinzugefügt`

- [ ] **Bugfix: Gantt-Chart - Auto-Pause ohne Funktion**
  - **Beschreibung:** Die automatische Pausenfunktion, die Konflikte zwischen Quests lösen soll, funktioniert nicht.
  - **Analyse:** Die `_addAutoBreaks`-Funktion im `ganttBreakManager.js` wird entweder nicht korrekt aufgerufen oder die Logik zur Pausenerstellung ist fehlerhaft.
  - **Zugehöriger Buglog:** `2024-05-23: Gantt-Chart: Auto-Pause ohne Funktion`

- [ ] **Feature: Neues, regelbasiertes Pomodoro-System**
  - **Ziel:** Ein festes Raster aus Arbeits- und Pausenblöcken generieren und Quests automatisch in dieses Raster einsortieren.
  - **Planung & Umsetzung:**
    1.  **Raster-Generierung:**
        - [x] **Schritt 1: `PomodoroGridGenerator.js` erstellen**
            - **Beschreibung:** Eine neue, eigenständige Klasse `PomodoroGridGenerator` wird in `js/managers/gantt/PomodoroGridGenerator.js` erstellt. Diese Klasse ist ausschließlich dafür verantwortlich, ein Array von Pausenobjekten basierend auf den Benutzereinstellungen zu generieren.
            - **Methoden:** `generateGrid(settings)`: Nimmt ein `settings`-Objekt (mit `startTime`, `workInterval`, `shortBreak`, `longBreak`, `longBreakInterval`) und gibt ein Array von Pausen zurück, z.B. `[{ start: '09:45', end: '09:50', type: 'short' }, ...]`.
            - **Ergebnis:** Eine testbare, isolierte Logik zur Erstellung des Pausenrasters.
            - **Test-Tool:** Ein neuer Button "Test Pomodoro Grid" wird hinzugefügt. Bei Klick werden feste Einstellungen verwendet, um das Grid zu generieren und das Ergebnis in der Konsole auszugeben.
            - **Prüfungsschritte:** Prüfen, ob die generierten Pausenzeiten mathematisch korrekt sind und der Wechsel zwischen kurzen und langen Pausen funktioniert.

        - [x] **Schritt 2: `GanttRenderManager` anpassen**
            - **Beschreibung:** Der `GanttRenderManager` wird erweitert, um die vom `PomodoroGridGenerator` erzeugten Pausen als eigene, visuelle Balken im Gantt-Chart darzustellen.
            - **Methoden:** Eine neue Methode `_renderPomodoroBreaks(breaks)` wird implementiert. Sie iteriert über das Pausen-Array und erstellt für jede Pause einen `div`-Balken mit einer spezifischen CSS-Klasse (z.B. `.gantt-pomodoro-break`).
            - **Ergebnis:** Die generierten Pausen sind als feste Balken im Gantt-Chart sichtbar.
            - **Test-Tool:** Der "Test Pomodoro Grid"-Button wird erweitert, sodass er nicht nur das Grid generiert, sondern auch das Rendering im Gantt-Chart auslöst.
            - **Prüfungsschritte:** Visuell prüfen, ob die Pausenbalken an den korrekten Positionen und mit der korrekten Länge im Chart erscheinen.

    2.  **Quest-Einsortierung:**
        - [ ] **Schritt 3: `GanttSortManager` anpassen (Quest-Splitting)**
            - **Beschreibung:** Die Kernlogik in `GanttSortManager` wird überarbeitet. Die `sortAllQuests`-Methode berücksichtigt nun das existierende Pausenraster. (Sortierung implementiert, Splitting ausstehend).
            - **Methoden:** Die Sortierlogik wird so geändert, dass sie die Startzeit einer Quest auf den nächsten freien Arbeitsblock setzt. Wenn eine Quest länger als der verfügbare Block bis zur nächsten Pause ist, wird die Quest "geschnitten": Der `GanttRenderManager` muss so angepasst werden, dass er für diese Quest mehrere Teil-Balken zeichnet, die durch die Pausen unterbrochen sind.
            - **Ergebnis:** Quests werden automatisch in die Lücken zwischen den Pausenbalken einsortiert und bei Bedarf visuell aufgeteilt.
            - **Test-Tool:** Ein Button "Add Long Quest & Sort" wird erstellt. Er fügt eine 3-Stunden-Quest hinzu und löst die Pomodoro-Sortierung aus.
            - **Prüfungsschritte:** Prüfen, ob die lange Quest korrekt in mehrere Segmente aufgeteilt und um die Pausenbalken herum platziert wird.

    3.  **UI-Integration:**
        - [ ] **Schritt 4: Pomodoro-Aktivierungs-Modal anpassen**
            - **Beschreibung:** Das Aktivierungs-Modal (`div-7120`) wird um die neuen Pflichtfelder erweitert.
            - **UI-Elemente:** Neue Input-Felder für `Startzeit`, `Arbeitsintervall`, `Kurze Pause` und `Lange Pause` hinzufügen.
            - **Funktion:** Der "Aktivieren"-Button liest diese Werte aus, speichert sie (z.B. im `ganttManager`) und löst den gesamten Prozess (Grid-Generierung, Rendering, Sortierung) aus.
            - **Ergebnis:** Der Benutzer kann den Pomodoro-Modus mit den erforderlichen Parametern konfigurieren und starten.
            - **Prüfungsschritte:** Manuell den Dialog ausfüllen und bestätigen, dass das Gantt-Chart entsprechend der Eingaben korrekt aktualisiert wird.

    3.  **Offene Punkte & nächste Schritte:**
        - **Logik für Überlänge:** Was passiert, wenn eine Quest länger ist als ein Arbeitsblock? Die Logik muss erweitert werden, um lange Quests auf mehrere Blöcke aufzuteilen oder dies zu markieren.
        - **Logik für Überbelegung:** Was passiert, wenn mehr Quests als Arbeitsblöcke vorhanden sind? Überzählige Quests werden aktuell ignoriert.
        - **Interaktivität:** Die Interaktivität der Raster-Blöcke (z.B. Dauer anpassen) fehlt noch.

- [ ] **Feature: Interaktive Pausenbalken**
  - **Ziel:** Manuelle Anpassung der Pausen und Arbeitsblöcke direkt im Gantt-Chart.
  - **Planung & Umsetzung (Nachgelagert):**
    1.  **Interaktivität:** Ein Klick auf einen Pausenbalken (`.gantt-pomodoro-break`) öffnet ein Popover.
    2.  **Popover-Funktionen:** Das Popover ermöglicht die Änderung der Pausendauer und die Anpassung des vorhergehenden Arbeitsblocks.
    3.  **Neuberechnung:** Jede manuelle Änderung löst eine Neuberechnung des gesamten Grids und eine Neusortierung der Quests aus.

- [ ] **Feature: Benutzerdefinierte CSS-Anpassung für Pomodoro-Balken**
  - **Ziel:** Benutzern ermöglichen, die Farbe der Pomodoro-Pausenbalken selbst anzupassen.
  - **Planung & Umsetzung (Nachgelagert):**
    1.  **UI-Erweiterung:** Im Pomodoro-Einstellungs-Modal (`div-7130`) werden zwei Farbauswahl-Felder (Color Picker) hinzugefügt: eines für kurze Pausen und eines für lange Pausen.
    2.  **Datenmodell:** Die ausgewählten Farbwerte werden im Benutzerprofil unter `pomodoroSettings.breakBarColors` (z.B. `{ short: '#ffcc00', long: '#ff9900' }`) gespeichert.
    3.  **Dynamisches CSS:** Der `GanttRenderManager` wird erweitert. Beim Rendern der Pausenbalken werden die benutzerdefinierten Farben nicht über Inline-Styles, sondern über dynamisch generierte CSS-Variablen gesetzt.
        - **Beispiel:**
          ```javascript
          document.documentElement.style.setProperty('--pomodoro-short-break-bg', settings.breakBarColors.short);
          ```
    4.  **CSS-Anpassung:** Die CSS-Regeln in `gantt.css` werden so geändert, dass sie diese CSS-Variablen verwenden (`background-color: var(--pomodoro-short-break-bg);`). Dies ist sicherer als das direkte Injizieren von CSS-Code.