# Analyseplan: Pomodoro-Anzeigefehler

**Bug:** Die Pomodoro-Pausenbalken werden nicht mehr im Gantt-Chart angezeigt, obwohl die Daten korrekt generiert werden.

**Anmerkungen des Users:**
- Die Balken sollen nur innerhalb der Quest-Zeilen angezeigt werden, nicht als globale Spalten.
- Frühere Versuche führten dazu, dass die Balken bei 00:00 Uhr als winzige Striche erschienen oder gar nicht.

---

## Analyse-Schritte

Ziel ist es, durch gezielte Konsolenausgaben den Punkt zu finden, an dem die Rendering-Logik fehlschlägt.

### Schritt 1: Wird die Rendering-Methode überhaupt aufgerufen?

- **Hypothese:** Die Methode `_renderPomodoroBreaks` wird aus irgendeinem Grund nicht mehr aufgerufen.
- **Aktion:** Eine Konsolenausgabe ganz am Anfang der Methode `_renderPomodoroBreaks` in `ganttManager.js` einfügen.
- **Code:** `console.log('Schritt 1: _renderPomodoroBreaks WIRD aufgerufen.');`
- **Erwartetes Ergebnis:** Die Nachricht erscheint in der Konsole für jede Quest-Zeile, wenn der Pomodoro-Modus aktiv ist.
- **Ergebnis:** **Erfolgreich.** Die Nachricht "Schritt 1: _renderPomodoroBreaks WIRD aufgerufen." erscheint mehrfach in der Konsole.

### Schritt 2: Sind die Eingabeparameter und Basis-Elemente gültig?

- **Hypothese:** Die Methode wird aufgerufen, aber entweder die `parentCell` ist ungültig oder das `timelineGrid`-Element wird nicht gefunden.
- **Aktion:** Konsolenausgaben hinzufügen, um die `parentCell` und das gefundene `timelineGrid` zu prüfen.
- **Code:**
  ```javascript
  console.log('Schritt 2: parentCell:', parentCell);
  const timelineGrid = this.ganttManager.ganttChartContainer.querySelector('#gantt-timeline-grid');
  console.log('Schritt 2: timelineGrid:', timelineGrid);
  ```
- **Erwartetes Ergebnis:** Beide Ausgaben zeigen gültige HTML-Elemente an.
- **Ergebnis:** `[Hier wird das Ergebnis der Konsolenausgabe festgehalten]`

### Schritt 3: Funktioniert die Breitenberechnung?

- **Hypothese:** Die `timelinePixelWidth` wird als 0 berechnet, weil das Grid noch nicht gerendert ist.
- **Aktion:** Konsolenausgabe für die berechnete Pixel-Breite hinzufügen.
- **Code:** `console.log('Schritt 3: Berechnete timelinePixelWidth:', timelinePixelWidth);`
- **Erwartetes Ergebnis:** Die Ausgabe zeigt einen Wert größer als 0 an (z.B. `3456`).
- **Ergebnis:** `[Hier wird das Ergebnis der Konsolenausgabe festgehalten]`

### Schritt 4: Wird die Schleife zur Balken-Erstellung durchlaufen?

- **Hypothese:** Die `forEach`-Schleife über `this.ganttManager.pomodoroBreaks` wird übersprungen.
- **Aktion:** Eine Konsolenausgabe innerhalb der `forEach`-Schleife hinzufügen.
- **Code:** `console.log('Schritt 4: Erstelle Pausenbalken für:', breakData);`
- **Erwartetes Ergebnis:** Für jede generierte Pause erscheint eine Log-Nachricht.
- **Ergebnis:** `[Hier wird das Ergebnis der Konsolenausgabe festgehalten]`