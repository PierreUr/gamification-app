# Projekt To-Do-Liste

Diese Datei dient als Übersicht für anstehende Aufgaben, priorisiert nach Einfachheit und Wichtigkeit. Die Aufgaben werden vor der Bearbeitung in atomare Schritte unterteilt. Nach Abschluss wird die Detaillierung entfernt.

---

- [ ] **Bugfix: Quest Wizard Schritt 3 fehlerhaft**
  - **Spezifikation:** ToDos/bugfix-quest-wizard-step3.md

## Priorisierte Aufgabenliste (Neu sortiert)
- [x] **Gantt-Chart (Bugfix): Einzeilen-Ansicht reparieren**
- [x] **Refactoring: GanttManager aufteilen**
    - **Ziel:** Die `ganttManager.js` in kleinere, spezialisierte Klassen aufteilen, um die Wartbarkeit zu verbessern.
    - [x] **Schritt 1:** `GanttWarningManager` erstellen und Logik für Warnsymbole auslagern (intern).
    - [x] **Schritt 2:** `GanttBreakManager` erstellen und Logik für Pausen auslagern (intern).
    - [x] **Schritt 3:** `GanttInteractionManager` erstellen und Event-Listener auslagern (intern).
    - [x] **Schritt 4:** `GanttRenderManager` erstellen und die Rendering-Logik auslagern.
    - [x] **Schritt 5:** `ganttManager.js` aufräumen und zur zentralen Orchestrator-Klasse umbauen.
- [x] **Gantt-Chart (Bugfix): Bewegung unpräzise**

- [x] **Gantt-Chart (Drag & Drop):** In 5-Minuten-Schritten einrasten lassen.
- [ ] **Automatische Pause im Fokus-Timer (in Arbeit):**
    - **Ziel:** Der Quest-Timer soll nach maximal 45 Minuten ununterbrochener Arbeit automatisch eine Pause einleiten.
    - [x] **Timer-Logik erweitern:** In `timerManager.js` die `startQuestTimer`-Methode anpassen. Ein zusätzlicher Countdown für die Arbeitssitzung (max. 45 Min.) wird parallel zum Quest-Timer gestartet.
    - [x] **Pausen-Trigger:** Sobald einer der beiden Timer (Quest-Dauer oder 45-Minuten-Sitzung) abläuft, wird die `startBreak()`-Methode aufgerufen.

- [ ] **Gantt-Chart (UI/UX):**
    - [ ] **Scrollbar-Styling:** Die Scrollbalken sollen ein benutzerdefiniertes, dunkles Design erhalten.

### Prio 4: Langfristige Ideen
- [ ] **Gantt-Chart (UI-Verbesserungen):**
    - [ ] **Auto-Sortierung:** Einen Button "Auto-Sortieren" hinzufügen, der alle Quests im Gantt-Chart lückenlos aneinanderreiht.
    - [ ] **"Jump to First"-Button:** In der Einzeilen-Ansicht einen Button hinzufügen, der zum ersten Quest-Eintrag springt.
- [ ] **Implementierungsplan: Quest-Splitting in Mini-Projekte**
    - **Ziel:** Quests, die länger als 45 Minuten dauern, sollen optional in untergeordnete "Mini-Quests" (Sub-Quests) aufgeteilt werden können. Dies dient als Vorbereitung für ein umfassenderes Projektmanagement.
    - **Analyse & Planung:**
        1.  **Datenmodell erweitern:**
            - Eine Quest benötigt ein neues Feld, z.B. `isParentQuest: true`.
            - Sub-Quests benötigen ein Feld `parentQuestId` zur Zuordnung.
            - Sub-Quests erben initial alle Eigenschaften (Tags, Priorität etc.) von der Parent-Quest, können aber individuell überschrieben werden.
            - Ein neues Feld `notes` (oder `sharedNotesId`) muss eingeführt werden, damit alle Sub-Quests eines Mini-Projekts auf dieselben Notizen zugreifen können.
        2.  **UI-Logik für die Aufteilung:**
            - Im "Neue Quest"- oder "Quest bearbeiten"-Modal eine Option (z.B. Checkbox "In 45-Minuten-Blöcke aufteilen") hinzufügen, wenn die Dauer > 45 Minuten ist.
            - Bei Aktivierung: Automatisch die notwendige Anzahl an Sub-Quests erstellen. Beispiel: Eine 120-Minuten-Quest wird zu drei 40-Minuten-Quests (oder 2x 45min + 1x 30min, Logik definieren).
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
- [ ] **Fokus-Timer (Beenden-Logik):**
    - [ ] **UI-Überarbeitung:** Alle Fenster der App sollen ein rahmenloses Design erhalten.
    - **Ziel:** Wenn nach einer automatischen Pause "Beenden" geklickt wird, soll der Benutzer gefragt werden, wie mit der Restzeit der Quest verfahren wird.
    - [ ] **UI:** Ein neues Modal erstellen, das die Optionen "Neue Dauer hinzufügen" (öffnet Bearbeiten-Modal) und "Bisherige Zeit abziehen" (reduziert `durationMinutes` der Quest) anbietet.
- [ ] **Gantt-Chart (Größenänderung):** Die Dauer einer Quest soll durch Ziehen am Ende des Balkens direkt im Gantt-Chart anpassbar sein.
- [ ] **Kalender-System:**
    - [ ] **Feiertags-Integration:** Eine Ansicht oder ein System zur Verwaltung von Feiertagen implementieren.
- [ ] **Team/Clan-System:**
    - [ ] **Grundlagen:** Ein System zur Verwaltung von Team-Mitgliedern als Vorstufe für kollaborative Projekte schaffen.
- [ ] **Externe Logins & Synchronisation:**
    - [ ] **Login-Optionen:** Benutzer-Login via Google und Microsoft implementieren.
    - [ ] **Kalender-Synchronisation:** Eine Synchronisation von externen Kalendern und To-Do-Listen mit dem Quest-System vorbereiten.
- [ ] **Projekt-Zeiterfassung:** Eine Funktion zur Erfassung der Bearbeitungszeit pro Team-Mitglied für Projekte entwickeln.
- [ ] **Gantt-Chart (Pausen-Visualisierung):**
    - **Ziel:** Wenn eine Arbeitssitzung durch die 45-Minuten-Regel unterbrochen wird, soll im Gantt-Chart ein Pausen-Balken angezeigt werden.
    - [ ] **Logik:** Im `ganttManager.js` eine Funktion erstellen, die prüft, ob eine Quest länger als 45 Minuten dauert.
    - [ ] **UI:** Wenn ja, den Quest-Balken auf 45 Minuten kürzen und direkt dahinter einen 10-minütigen Pausen-Balken einfügen. Ein Info-Icon soll erklären, warum die Pause eingefügt wurde.
- [ ] **Gestensteuerung:** Unterstützung für Touch-Gesten auf mobilen Geräten hinzufügen (z.B. Wischen zum Abschließen/Löschen von Quests).
- [ ] **UI-Überarbeitung:** Fensterrahmen entfernen und durch "freistehende" Fenster mit X-Button oben rechts ersetzen.
- [ ] **Undo-System:** Ein System implementieren, um Aktionen rückgängig zu machen.
- [ ] **Backend-Rollenkonzept:** Implementierung eines mehrstufigen Backend-Systems.
- [ ] **Projekt-System (Verschoben):**
    - [ ] **Projektzuweisung:** Sicherstellen, dass im "Neue Quest"- und "Quest bearbeiten"-Fenster Aufgaben einem Projekt zugewiesen werden können.
    - [ ] **Test-Button:** Einen Button im Test-Tool erstellen, der ein Projekt für die aktuelle Woche und 5 zugehörige Projektaufgaben anlegt.
    - [ ] **Eigene Projekterstellung:** Ein separates, detailliertes Fenster für die Erstellung von "Projekten" mit erweiterten Einstellungen (z.B. Zeiträume) implementieren.


## Erledigte Aufgaben (Auszug)
- [x] **Gantt-Chart (Filter):** Projektfilter implementiert.
- [x] **Gantt-Chart (Auto-Pause):** Automatische Pausen zwischen Quests implementiert.
- [x] **Test-Tool:** Test-Quests werden jetzt korrekt mit Dauer und Startzeit erstellt.
- [x] **Gantt-Chart (Drag & Drop):** Verschieben von Quests implementiert und stabilisiert.