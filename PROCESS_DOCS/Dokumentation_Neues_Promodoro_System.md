# Dokumentation: Neues Pomodoro-System im Gantt-Chart

Dieses Dokument beschreibt die überarbeitete, regelbasierte Logik für den Pomodoro-Modus, der auf einem festen Zeitraster basiert.

## 1. Aktivierung des Pomodoro-Modus

1.  **Popup bei Aktivierung:** Wenn der Benutzer die "Pomodoro"-Checkbox aktiviert, erscheint ein Modal (`div-7120`).
2.  **Informations-Dialog & Grundeinstellung:** Das Modal erklärt die Grundregeln und erfordert die Eingabe der Basis-Parameter:
    -   **Startzeit:** Eine globale Startzeit, vor der keine Quests geplant werden.
    -   **Arbeitsintervall:** Die Dauer eines Arbeitsblocks (z.B. 45 Minuten).
    -   **Kurze Pause:** Die Dauer der Pause nach jedem Arbeitsintervall (z.B. 5 Minuten).
    -   **Lange Pause:** Die Dauer der langen Pause, die nach einer bestimmten Anzahl von Intervallen eintritt.
3.  **Aktivieren:** Ein Klick auf "Aktivieren" speichert diese Einstellungen und generiert das Zeitraster.

## 2. Konfiguration (Zahnrad-Icon `⚙️`)

Ein neues Zahnrad-Icon neben der Pomodoro-Checkbox öffnet ein Konfigurations-Modal (`div-7130`). Hier kann der Benutzer globale Zeitblöcke definieren, die bei der Planung berücksichtigt werden.

- **Fixe Pausen (Mittagspause):** Ein oder mehrere feste Zeitfenster (z.B. 12:00 - 12:30 Uhr), die als Pausenblöcke im Gantt-Chart angezeigt werden. Quests werden automatisch um diese Blöcke herum geplant.
- **Weitere Pausen:** Eine dynamische Liste, in die der Benutzer weitere, wiederkehrende Pausen eintragen kann (z.B. "Fahrtzeit", "Kaffeepause").

### 2.1 Visuelle Anpassung

Das Einstellungs-Modal bietet zudem Optionen, das Aussehen der Pausenbalken anzupassen:

- **Anzeigestil:** Der Benutzer kann zwischen "Balken" (vollflächig) und "Linie" (vertikaler Strich) wählen.
- **Balken-Einstellungen:** Wenn "Balken" aktiv ist, können die Hintergrundfarbe für kurze/lange Pausen und die Dicke der Umrandung festgelegt werden.
- **Linien-Einstellungen:** Wenn "Linie" aktiv ist, können die Farbe und die Dicke der Linie festgelegt werden.
- **Dynamisches CSS:** Die Einstellungen werden als CSS-Variablen (`--pomodoro-short-break-bg`, etc.) auf das `root`-Element angewendet, um eine flexible und sichere Stilanpassung zu ermöglichen.

## 3. Automatisches Zeitraster und Quest-Sortierung

Nach der Aktivierung wird ein festes Zeitraster für den Tag generiert.

1.  **Pausenbalken-Generierung:** Das System erstellt basierend auf den Einstellungen (Startzeit, Intervalle, Pausen) eine Kette von Arbeits- und Pausenblöcken für den gesamten Tag. Diese Pausenblöcke werden als feste Balken im Gantt-Chart visualisiert, *bevor* die Quests platziert werden.
2.  **Automatische Sortierung:** Alle für heute geplanten Quests werden automatisch in die verfügbaren Arbeitsblöcke einsortiert.
3.  **Quest-Aufteilung:** Wenn eine Quest länger ist als ein einzelner Arbeitsblock, wird sie visuell auf mehrere Blöcke aufgeteilt. Die Quest wird durch die festen Pausenbalken "geschnitten" und in den nachfolgenden Arbeitsblöcken fortgesetzt.

## 4. Manuelle Anpassung von Pausen

Jeder Pausenbalken im Gantt-Chart ist interaktiv.

1.  **Klick auf Pausenbalken:** Ein Klick auf einen Pausenbalken öffnet ein Popover.
2.  **Pausendauer ändern:** Das Popover erlaubt die direkte Änderung der Dauer der angeklickten Pause (z.B. von 5 auf 15 Minuten).
3.  **Arbeitsblock anpassen:** Das Popover bietet die Möglichkeit, die Länge des *vorhergehenden* Arbeitsblocks auf vordefinierte Werte (z.B. 25 oder 45 Minuten) zu ändern.

## 5. Neuberechnung

Jede Änderung (automatisch oder manuell) löst eine Neuberechnung und ein Neuzeichnen des Gantt-Charts aus:

1.  Das Zeitraster wird basierend auf den neuen Parametern neu generiert.
2.  Alle Quests werden durch `sortAllQuests()` neu in die aktualisierten Arbeitsblöcke einsortiert.
3.  Das Gantt-Chart wird vollständig neu gezeichnet.