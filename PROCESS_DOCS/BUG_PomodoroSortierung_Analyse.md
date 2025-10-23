# Analyseplan: Pomodoro Quest-Sortierung

**Bug:** Die automatische Sortierung der Quests in das Pomodoro-Raster (`_sortIntoPomodoroGrid`) funktioniert nicht wie erwartet.

**Anmerkungen des Users:**
- "das hat nicht geklappt"

---

## Analyse-Schritte

Ziel ist es, durch gezielte Konsolenausgaben den Punkt zu finden, an dem die Sortier-Logik fehlschlägt.

### Schritt 1: Wird die korrekte Sortier-Methode aufgerufen?

- **Hypothese:** Die `sortAllQuests`-Methode ruft fälschlicherweise `_sortChronologically` anstatt `_sortIntoPomodoroGrid` auf.
- **Aktion:** Eine Konsolenausgabe am Anfang von `_sortIntoPomodoroGrid` einfügen.
- **Code:** `console.log('Analyse Schritt 1: sortAllQuests WIRD aufgerufen.');`
- **Erwartetes Ergebnis:** Die Nachricht "Analyse Schritt 1: sortAllQuests WIRD aufgerufen." erscheint in der Konsole.
- **Ergebnis:** **Erfolgreich.** Die Nachricht "Analyse Schritt 1: sortAllQuests WIRD aufgerufen." erscheint in der Konsole.

### Schritt 2: Sind die Eingabedaten (Pausen & Quests) gültig?

- **Hypothese:** Die Methode wird aufgerufen, aber die übergebenen `breaks` oder die gefilterten `questsToSort` sind leer oder fehlerhaft.
- **Aktion:** Konsolenausgaben hinzufügen, um die Anzahl der Pausen und der zu sortierenden Quests zu prüfen.
- **Code:**
  ```javascript
  console.log(`Schritt 2: Empfange ${breaks.length} Pausen.`);
  console.log(`Schritt 2: Fand ${questsToSort.length} Quests zum Sortieren.`);
  ```
- **Erwartetes Ergebnis:** Beide Ausgaben zeigen eine Anzahl größer als 0 an.
- **Ergebnis:** `[Hier wird das Ergebnis der Konsolenausgabe festgehalten]`

### Schritt 3: Wie verhält sich die Zeitberechnung in der Schleife?

- **Hypothese:** Die `lastEventEndTime` wird in der `while`-Schleife nicht korrekt aktualisiert, was zu einer Endlosschleife oder falschen Platzierung führt.
- **Aktion:** Konsolenausgabe für die `lastEventEndTime` vor und nach der `while`-Schleife für jede Quest hinzufügen.
- **Code:** `console.log('Schritt 3: Zeit vor Schleife:', new Date(lastEventEndTime));` und `console.log('Schritt 3: Zeit nach Schleife:', new Date(lastEventEndTime));`
- **Erwartetes Ergebnis:** Die Zeitstempel in der Konsole schreiten logisch voran.
- **Ergebnis:** `[Hier wird das Ergebnis der Konsolenausgabe festgehalten]`

---

## Re-Analyse: Detaillierte Schleifen-Inspektion

- **Hypothese:** Die Logik zum Überspringen von Pausen und zur fortlaufenden Platzierung der Quests ist fehlerhaft.
- **Aktion:** Detaillierte Konsolenausgaben wurden in die `_sortIntoPomodoroGrid`-Methode eingefügt, um den gesamten Prozess (Startzeit, gefundene Quests, Pausen, Platzierung jeder einzelnen Quest) zu protokollieren.
- **Ergebnis:** `[Hier wird das Ergebnis der Konsolenausgabe festgehalten]`