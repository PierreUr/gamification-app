# Dokumentation: Berechnung des Pausen-Einfügepunkts im Gantt-Chart

Dieses Dokument beschreibt die Logik der `findNextBreakInsertionPoint`-Methode im `GanttWarningManager`.

## Ziel

Die Methode ermittelt den exakten Zeitpunkt (als Millisekunden-Timestamp), an dem die nächste manuelle Pause in einer Quest eingefügt werden muss. Dies ist die Grundlage für die Anzeige des `⚠️`-Warnsymbols und für die `addManualBreak`-Funktion.

## Funktionsweise

Die Methode akzeptiert zwei Argumente: `quest` (das Quest-Objekt) und `workSessionMinutes` (die gewünschte Länge des Arbeitsblocks, z.B. 25 oder 45 Minuten).

### Schritt 1: Initialisierung

1.  **Pausen sortieren:** Alle bereits manuell eingefügten Pausen (`breaks`-Array der Quest) werden nach ihrem Startzeitpunkt (`scheduledAt`) sortiert.
2.  **Startpunkt festlegen:** Der Startzeitpunkt (`lastEventEndTime`) wird auf den Anfang der Quest (`ganttScheduledAt`) gesetzt.
3.  **Arbeitszeit-Zähler:** Ein Zähler für die bereits geprüfte, reine Arbeitszeit (`accumulatedWorkMinutes`) wird auf 0 gesetzt.

### Schritt 2: Iteration durch vorhandene Pausen

Die Methode durchläuft jedes Arbeitssegment, das zwischen dem Start der Quest und der ersten Pause, sowie zwischen den nachfolgenden Pausen liegt.

1.  **Segmentdauer berechnen:** Für jedes Segment wird die Dauer in Minuten zwischen dem `lastEventEndTime` und dem Beginn der nächsten Pause (`breakItem.scheduledAt`) berechnet.
2.  **Prüfung auf Überlänge:** Wenn die Dauer dieses Segments die `workSessionMinutes` erreicht oder überschreitet, hat die Methode einen zu langen Arbeitsblock gefunden. Sie gibt den idealen Einfügepunkt zurück: `lastEventEndTime + (workSessionMinutes * 60000)`. Die Funktion wird hier beendet.
3.  **Aktualisierung für nächstes Segment:** Wenn das Segment kurz genug ist, wird:
    -   die Dauer des Segments zum `accumulatedWorkMinutes`-Zähler addiert.
    -   der `lastEventEndTime` auf das Ende der aktuellen Pause gesetzt (`breakItem.scheduledAt` + `breakItem.durationMinutes`), um den Startpunkt für das nächste Segment korrekt zu definieren.

### Schritt 3: Prüfung des letzten Arbeitssegments

Nach der Schleife wird das letzte Arbeitssegment (vom Ende der letzten Pause bis zum Ende der gesamten Quest-Arbeitszeit) geprüft.

1.  **Verbleibende Arbeitszeit:** Die verbleibende reine Arbeitszeit wird berechnet: `finalSegmentDuration = quest.durationMinutes - accumulatedWorkMinutes`.
2.  **Prüfung auf Überlänge:** Wenn diese `finalSegmentDuration` die `workSessionMinutes` erreicht oder überschreitet, wird auch hier der ideale Einfügepunkt zurückgegeben: `lastEventEndTime + (workSessionMinutes * 60000)`.

### Schritt 4: Ergebnis

Wenn kein Arbeitssegment zu lang ist, gibt die Methode `null` zurück. Dies signalisiert, dass keine weitere Pause benötigt wird und das `⚠️`-Symbol nicht angezeigt werden muss.