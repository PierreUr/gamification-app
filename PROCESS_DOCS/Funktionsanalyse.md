# Analyse des Funktionssystems

Das Dokument `Funktionssystem.md` dient als detaillierte technische Referenz. Sein Hauptzweck ist es, eine klare und direkte Verbindung zwischen den sichtbaren UI-Elementen der Anwendung und der zugrundeliegenden Code-Logik herzustellen. Es fungiert als eine Art "Landkarte" für Entwickler, um schnell zu verstehen, welche Funktion von welchem UI-Element ausgelöst wird und in welcher Datei sich die entsprechende Logik befindet.

## Logik des Aufbaus

Die Struktur des Dokuments ist streng hierarchisch und funktionsorientiert aufgebaut:

1.  **Hauptkategorien (Ebene H2):** Das Dokument ist in nummerierte Hauptabschnitte unterteilt, die den großen Funktionsblöcken der Anwendung entsprechen (z.B. `1. Globale Systeme`, `2. Quest-System`). Diese Abschnitte nennen oft direkt die verantwortlichen JavaScript-Dateien (z.B. `questManager.js`), was die Zuordnung zum Code erleichtert.

2.  **Unterkategorien (Ebene H3):** Innerhalb jeder Hauptkategorie gibt es weitere nummerierte Unterabschnitte. Diese repräsentieren spezifische Features, Ansichten oder Modals (z.B. `2.1. Meine Quests (Modal)`). Dies ermöglicht eine granulare Gliederung.

3.  **Standardisierte Detailblöcke:** Jede Unterkategorie ist konsistent in drei Bereiche unterteilt:
    *   **`Zweck`:** Eine kurze, prägnante Beschreibung der Funktion des Features.
    *   **`UI-Elemente`:** Eine konkrete Auflistung der zugehörigen HTML-Elemente, meist identifiziert durch ihre IDs (z.B. `#div-1110`, `#menu-btn-my-quests`). Dies stellt die direkte Verbindung zur visuellen Ebene und dem in `UV_ID_RULZ.md` definierten ID-System her.
    *   **`Funktionen`:** Eine Auflistung der relevanten JavaScript-Funktionen oder Methoden, die mit diesen UI-Elementen interagieren.

## Ausarbeitungstiefe

Die Ausarbeitungstiefe ist sehr hoch und auf Entwickler ausgerichtet. Anstatt allgemeiner Beschreibungen werden spezifische, technische Bezeichner verwendet:

-   **Exakte IDs:** Die Verwendung von HTML-IDs ermöglicht eine eindeutige Identifizierung der Elemente im DOM.
-   **Konkrete Funktionsnamen:** Die Nennung von Funktionsnamen (`questManager.addTodoForm`) erlaubt das direkte Auffinden der Logik im Code.
-   **Verknüpfung:** Das Dokument verknüpft explizit die *Was*-Ebene (Zweck), die *Wo*-Ebene (UI-Elemente) und die *Wie*-Ebene (Funktionen) miteinander.

## Zusammenfassendes Verständnis

Für mich als KI ist dieses Dokument eine Blaupause der Interaktionslogik der Anwendung. Der Aufbau folgt einer klaren "Vom Allgemeinen zum Spezifischen"-Logik. Indem ich ein UI-Element (z.B. einen Button) in diesem Dokument nachschlage, kann ich sofort die auslösende Funktion und deren Standort im Code identifizieren. Die konsistente Struktur und der hohe Detaillierungsgrad machen es zu einer effektiven und verlässlichen Quelle für die Wartung und Weiterentwicklung des Systems.
