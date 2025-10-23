# Projekt To-Do-Liste

Diese Datei dient als Übersicht für anstehende Aufgaben, priorisiert nach Einfachheit und Wichtigkeit.

---

## Priorisierte Aufgabenliste
### Prio 1: Kritische & Einfache Bugfixes
- [x] **Test-Tool:** "Alle Quests erledigen" funktioniert nicht für "Simple Quests".
    - **Grund:** Falsche Initialisierungsreihenfolge in `main.js`.
    - **Status:** `BUGLOG.md` Eintrag existiert.
- [x] **Erfolgssystem:** Der Button "Erfolge" im Charakter-Menü ist ohne Funktion.
    - **Grund:** Fehlender Event-Listener und Manager.
- [x] **Quest-Verwaltung:** Das Löschen von Quests nutzt ein einfaches `confirm()`-Popup. Es soll das sicherere, gestylte `showDeleteConfirm()`-Modal aus `main.js` verwenden.
- [x] **Quest-Verwaltung:** Einen "Bearbeiten"-Button für Quests hinzufügen, der ein separates, einseitiges Bearbeitungsfenster öffnet.
- [x] **Quest-Filter:** Die Filter "Heute fällig" und "Woche fällig" in "Meine Quests" sind ohne Funktion.

### Prio 2: UI-Verbesserungen & Mittlere Komplexität
- [ ] **Quest-Bearbeitung (UI):** Das Bearbeiten-Fenster soll sich nach dem Speichern automatisch schließen.
- [x] **Quest-Bearbeitung (UI):** Das Bearbeiten-Fenster soll sich nach dem Speichern automatisch schließen.
- [x] **Meine Quests (UI):** Die Dauer der Quest soll in der Listenansicht angezeigt werden.
- [x] **Quest-Bearbeitung (Dauer):** Die freie Eingabe für die Dauer im Bearbeiten-Fenster durch Buttons (+25m, +45m) ersetzen.
- [x] **Quest-Bearbeitung:** Das Bearbeiten-Fenster muss um fehlende Felder (Typ, Dauer, Tags etc.) erweitert werden, um alle Quest-Eigenschaften ändern zu können.
- [ ] **Gantt-Chart (Anzeige):**
    - [ ] **Grundlagen:** Die korrekte horizontale Anzeige von Zeitleiste und Quest-Balken im Test-Fenster implementieren.
- [ ] **Inventar (Bug):** Das Stapeln von konsumierbaren Gegenständen (z.B. Tränke) beim Aufheben funktioniert nicht mehr korrekt. Gleiche Items sollen zu einem Stapel zusammengefasst werden, anstatt neue Einträge zu erstellen.
    - [ ] **Drag & Drop:** Das Verschieben von Quest-Balken per Drag & Drop ermöglichen, um die `ganttScheduledAt`-Zeit zu ändern.
    - [ ] **Pausen-Funktion:** Buttons in den Balken hinzufügen, um manuelle Pausen zwischen Quests einzufügen.
- [ ] **Pet-Fenster (UI-Logik):**
    - [ ] **UI-Layout:** Die obere Währungsleiste soll fixiert sein und die Hauptansicht nicht mehr überlappen.
    - [ ] **Neues Item:** Einen Ausdauertrank zur Item-Datenbank und zum Starter-Inventar hinzufügen.
    - [ ] Button „Ablegen“ soll in der Spalte des aktiven Pets stehen.
    - [ ] Buttons „Freilassen“ und „Mitnehmen“ gehören in die Pet-Liste, nicht ins Vergleichsfenster.
    - [ ] Im Vergleichsbereich soll „Mitnehmen“ durch „Austauschen“ ersetzt werden.
    - [ ] Durchwechseln der aktiven Pets per Pfeile `<` und `>` ermöglichen.
- [ ] **Timer:** Der Timer für eine fokussierte Quest soll direkt im Fokus-Feld mit Start/Pause-Buttons angezeigt werden.

### Prio 3: Neue Features & Komplexe Aufgaben
- [ ] **Gantt-Chart (Funktionalität):**
    - [ ] Filter (Projekt, etc.) haben keine Funktion.
    - [ ] "Auto. Pause"-Checkbox hat keine Funktion.
    - [ ] Wochenansicht entfernen und Projekt-Ansicht hinzufügen.
- [ ] **Journal:** Funktion implementieren, um erledigte Quests anzuzeigen.
- [ ] **Pet-Skill-System:** Das Charakter-Skill-System auf die Pets übertragen (eigenständiger Skill-Tree pro Pet).
- [ ] **Projekt-Erstellung:** Ein separates, detailliertes Fenster für die Erstellung von "Projekten" mit allen relevanten Business-Einstellungen entwerfen und implementieren.
- [ ] **Gestensteuerung:** Unterstützung für Touch-Gesten auf mobilen Geräten hinzufügen (z.B. Wischen zum Abschließen/Löschen von Quests).

### Prio 4: Langfristige Ideen
- [ ] **UI-Überarbeitung:** Fensterrahmen entfernen und durch "freistehende" Fenster mit X-Button oben rechts ersetzen.
- [ ] **Undo-System:** Ein System implementieren, um Aktionen rückgängig zu machen.
- [ ] **Backend-Rollenkonzept:** Implementierung eines mehrstufigen Backend-Systems.
    - [ ] **Super-Admin:** Verwaltung von Benutzern und Default-Templates.
    - [ ] **Designer:** Kann nur für ihn freigegebene Templates bearbeiten.
    - [ ] **Moderator:** Benutzersteuerung (Blocken, Löschen, Logfiles einsehen).
    - [ ] **Template-Admin:** UI zur Template-Erstellung, Gamemode-Konfiguration, Up-/Download, Preisgestaltung.

---

## Refactoring & Technische Schulden

- [ ] **`testToolsManager.js`:** Alle Event-Listener in einer einzigen, delegierten Methode im Modal zusammenfassen, um die Wartbarkeit zu verbessern und Fehler beim Hinzufügen neuer Buttons zu vermeiden.
- [ ] **`questManager.js`:** Die `_attachEventListeners`-Methode aufteilen, um die UI-Initialisierung von der Event-Registrierung zu trennen.
- [ ] **`main.js`:** Die `createNewUserProfile`-Funktion refaktorisieren und die Erstellung von Starter-Items an die jeweiligen Manager delegieren.
- [ ] **`index.html`:** Die Skill-Daten aus der HTML-Datei in eine separate Konfiguration oder JSON-Datei auslagern.

---

## Erledigte Aufgaben (Auszug)
- [x] **Inventar:** "Item verwerfen" und "Benutzen" von Tränken.
- [x] **Ausrüstung:** "Alles ablegen"-Button.
- [x] **Pet-Menü:** "Ablegen"-Button und Symbole.
- [x] **Quest-Wizard:** Basis-Funktionalität.
- [x] **Quest Heute:** Button-Funktionalität.