# Analyseplan: Ungenaue Größenanpassung im Gantt-Chart

**Bug:** Der Quest-Balken springt nach dem Ändern der Größe auf eine falsche Position zurück. Die Berechnung der finalen Dauer scheint von der visuellen Darstellung während des Ziehens abzuweichen.

---

## Analyse-Schritte

Ziel ist es, durch gezielte Konsolenausgaben die Diskrepanz zwischen der visuellen Vorschau und der finalen Berechnung zu identifizieren.

### Schritt 1: Startwerte protokollieren
- **Hypothese:** Die initialen Werte für die Berechnung sind korrekt.
- **Aktion:** Konsolenausgabe beim Start des Resize-Vorgangs (`mousedown`).
- **Code:** `console.log('Resize-Analyse (Start):', { startWidth: this.resizeStartWidth, startMouseX: this.resizeStartMouseX, originalDuration: this.originalQuestDuration, pixelsPerMinute: this.pixelsPerMinute });`
- **Erwartetes Ergebnis:** Alle Startwerte werden korrekt in der Konsole angezeigt.

### Schritt 2: Werte während der Bewegung protokollieren
- **Hypothese:** Die Berechnung während des Ziehens (`mousemove`) ist die visuelle Referenz für den Benutzer.
- **Aktion:** Konsolenausgabe für die berechnete Dauer während der Bewegung.
- **Code:** `console.log('Resize-Analyse (Move):', { newDurationMinutes });`
- **Erwartetes Ergebnis:** Die Dauer ändert sich in 5-Minuten-Schritten.

### Schritt 3: Finale Werte protokollieren
- **Hypothese:** Die Berechnung beim Loslassen der Maus (`mouseup`) weicht von der Berechnung in Schritt 2 ab.
- **Aktion:** Konsolenausgabe für die finale Berechnung.
- **Code:** `console.log('Resize-Analyse (Ende):', { deltaX, durationChangeMinutes, finalDurationMinutes });`
- **Erwartetes Ergebnis:** `finalDurationMinutes` sollte dem letzten Wert von `newDurationMinutes` aus Schritt 2 entsprechen. Eine Abweichung hier ist die Ursache des Bugs.

### Schritt 4: Analyse
- **Aktion:** Vergleichen des letzten geloggten Wertes aus "Move" mit dem Wert aus "Ende".
- **Ziel:** Die genaue Ursache für die Abweichung in der Berechnungslogik finden.