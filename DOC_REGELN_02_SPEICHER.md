Dieses Dokument enthält die statische Definition der Dateiliste und die strikten Ablageorte der Informationen.

1. Obligatorische Dokumenten- und Dateiliste  
| Dateiname                | Primärer Zweck                                               | Speicher-Fokus (WAS)                          |
|--------------------------|--------------------------------------------------------------|-----------------------------------------------|
| ANWEISUNGEN.md           | Globale Systemanweisungen und KI-Verhalten.                  | Regeln & Prozesse                             |
| Implementierungs-Fahrplan.csv | Archiv und Master-Quelle aller geplanten Tasks.          | Master-Tasks & Definitionen                   |
| TODO.md                  | Aktuelle Haupt-Abarbeitungswarteschlange (Prio 2).           | Aktueller Task-Status                          |
| Secound To do list.md    | Dringende/Priorisierte Warteschlange (Prio 1).                | Urgent Tasks & Bugfixes                       |
| Dokumentation_UI-Steuerung-System.md | Detaillierte Logik, Komponenten-Interaktion und Datenflüsse. | Logik & Architektur                           |
| UI_ELEMENT_IDS.md         | Register aller vergebenen div-XXXX-IDs (Struktur).            | Frontend-Struktur                             |
| UV_ID_RULZ.md            | Regelwerk für die UI-ID-Zählweise und Farbcodierung.          | ID-Vergaberegeln                             |
| CHANGELOG.md             | Protokoll der durchgeführten, erfolgreichen Änderungen.       | Versionshistorie                              |
| BUGLOG.md                | Protokoll aller gemeldeten, noch nicht behobenen Fehler.      | Fehlerprotokolle                              |

2. Speicherrichtlinien (Kern-Ablageorte)  
| Information                                 | Ablageort                        |
|---------------------------------------------|---------------------------------|
| Gesamter Aufgabenkatalog (inkl. Zielen, Prüfschritten) | Implementierungs-Fahrplan.csv    |
| Detaillierte interne Logik (Datenfluss)    | Dokumentation_UI-Steuerung-System.md               |
| Liste aller UI-Element-IDs (mit Beschreibung) | UI_ELEMENT_IDS.md                |
| Statische CSS-Konfiguration pro ID          | UI-Text.csv (Spalte css-Attribute) |