# Dokumentation: PomodoroGridGenerator

Diese Klasse ist dafür verantwortlich, ein Array von Pausen-Objekten zu generieren, das als Grundlage für das feste Zeitraster im Pomodoro-Modus dient.

**Speicherort:** `js/managers/gantt/PomodoroGridGenerator.js`

## Zweck

Die Klasse ist eine reine Logik-Komponente ohne DOM-Interaktion. Ihre einzige Aufgabe ist es, basierend auf einem Set von Regeln (den `settings`) eine Datenstruktur zu erzeugen, die die Start- und Endzeiten aller Pausen für einen Tag enthält. Dies entkoppelt die Berechnungslogik von der visuellen Darstellung im Gantt-Chart.

## Methoden

### `generateGrid(settings)`

Dies ist die zentrale Methode der Klasse.

- **Parameter:**
  - `settings` (Objekt): Ein Konfigurationsobjekt mit den folgenden Eigenschaften:
    - `startTime` (String): Die Startzeit für den Tagesplan, z.B. `"09:00"`.
    - `workInterval` (Number): Die Dauer eines Arbeitsblocks in Minuten.
    - `shortBreak` (Number): Die Dauer einer kurzen Pause in Minuten.
    - `longBreak` (Number): Die Dauer einer langen Pause in Minuten.
    - `longBreakInterval` (Number): Die Anzahl der Arbeitsblöcke, nach denen eine lange Pause stattfindet (z.B. `4`).

- **Rückgabewert:**
  - `Array<object>`: Ein Array von Pausen-Objekten. Jedes Objekt hat die folgende Struktur:
    ```javascript
    {
      startTime: 1672563300000, // Unix-Timestamp in Millisekunden
      endTime: 1672563600000,   // Unix-Timestamp in Millisekunden
      type: 'short' | 'long'   // Typ der Pause
    }
    ```