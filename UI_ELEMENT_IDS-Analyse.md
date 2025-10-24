# Analyse des UI-Element-ID-Systems

Dieses Dokument beschreibt die Logik und die Prinzipien hinter dem Aufbau der `UI_ELEMENT_IDS.md`. Es dient als Richtlinie für die Analyse der aktuellen Anwendungsstruktur und die korrekte Dokumentation aller relevanten UI-Elemente.

## Zweck des ID-Systems

Das primäre Ziel des ID-Systems ist es, eine klare, hierarchische und visuell nachvollziehbare Karte der Benutzeroberfläche zu erstellen. Es verbindet funktionale Blöcke der Anwendung direkt mit ihren HTML-IDs und einem visuellen Debugging-System (Farbcodierung).

## Kernprinzipien des Aufbaus

Die Struktur folgt drei Kernprinzipien:

### 1. Numerische Hierarchie
Alle primären UI-Container werden mit einer ID im Format `div-XXXX` versehen. Diese numerische Kennung ermöglicht eine logische Gliederung der UI-Ebenen.
- **Tausender-IDs (`X`000):** Repräsentieren die obersten, funktionalen Hauptbereiche der Anwendung (z.B. ein Hauptmenü, ein Inhaltsbereich, eine Seitenleiste).
- **Hunderter- und Zehner-IDs (`xX`00, `xxX`0):** Stellen Unterbereiche, Modals oder spezifische Komponenten innerhalb einer Tausendergruppe dar. Dies schafft eine klare Eltern-Kind-Beziehung.

### 2. Funktionale Gruppierung (Tausendergruppen)
Jede Tausendergruppe (z.B. alle IDs von `1000-1999`) wird einem festen, übergeordneten Funktionsbereich der Anwendung zugeordnet.
- **Beispiel:**
  - `1000er`-Gruppe: Alle Elemente, die zum Gegner-Team gehören.
  - `2000er`-Gruppe: Alle Elemente, die zum Spieler-Team gehören.
  - `4000er`-Gruppe: Globale Elemente wie das Log-Fenster.
  - `5000er`-Gruppe: Werkzeuge und Test-Panels.

### 3. Visuelles Debugging (Farbcodierung)
Jede Tausendergruppe erhält eine feste, in `UV_ID_RULZ.md` definierte Rahmenfarbe. Dies ermöglicht es Entwicklern, die hierarchische Struktur und die Zugehörigkeit von UI-Elementen direkt im Browser visuell zu erfassen.

## Richtlinie für die Analyse und Dokumentation

Um die `UI_ELEMENT_IDS.md` für die aktuelle Anwendung zu erstellen oder zu aktualisieren, ist folgender Prozess anzuwenden:

1.  **Code-Analyse:**
    - Scanne die `index.html` nach allen statischen `div`-Containern mit `div-XXXX`-IDs.
    - Analysiere die TypeScript-Dateien (`index.tsx`, `adminPanel.ts`, etc.) nach Code, der dynamisch HTML-Strukturen mit entsprechenden IDs erzeugt (z.B. durch `WindowManager`).

2.  **Logische Gruppierung:**
    - Ordne die gefundenen IDs ihren funktionalen Bereichen in der Anwendung zu (z.B. "Gegner-Team", "Spieler-Team", "Aktionsleiste", "Test-Tools").
    - Weise jeder dieser Gruppen eine Tausender-Nummer und die entsprechende Farbe aus `UV_ID_RULZ.md` zu.

3.  **Dokumentation in `UI_ELEMENT_IDS.md`:**
    - Erstelle für jede identifizierte ID einen Eintrag in der Markdown-Tabelle.
    - Trage die ID, die zugehörige Farbe und eine prägnante, aber klare Beschreibung ihrer Funktion ein.
    - Berücksichtige auch untergeordnete, aber wichtige Elemente, die dynamisch generiert werden (z.B. `#modal-window`, `#modal-header`), und ordne sie logisch der auslösenden Gruppe zu.

Dieser Prozess stellt sicher, dass die `UI_ELEMENT_IDS.md` eine konsistente, genaue und nützliche Referenz für die Anwendungsstruktur bleibt.
