# DOKUMENTATIONSREGELN - 01 PROTOKOLL

Dies definiert das Protokoll fürr die Erstellung, Verwaltung und Dokumentation von Entwicklungsaufgaben.

## 3-Stufiges Planungsmodell

Das gesamte Projektmanagement basiert auf drei miteinander verbundenen Dateien:

1.  **ToDo.md (Die PrioritÃ¤tenliste):** Die zentrale Datei im Stammverzeichnis, die nur die Liste der Tasks in ihrer PrioritÃ¤tsreihenfolge enthÃ¤lt. Die Reihenfolge der EintrÃ¤ge definiert die AbarbeitungsprioritÃ¤t (oberster Eintrag = hÃ¶chste PrioritÃ¤t).
2.  **ToDos/[TASK-SLUG].md (Die Task-Spezifikation):** Detaillierte Beschreibung eines einzelnen Entwicklungs-Tasks mit einer Checkliste der atomaren Schritte.
3.  **ToDos/Prompts/[TASK-SLUG]_[SCHRITT-SLUG].csv (Der Atomare Prompt):** Die kleinstmÃ¶gliche Arbeitseinheit, die den KI-Assistenten exakt anweist, was zu tun ist (Ziel, Kontext-Dateien).

## Nomenklatur (Slugs)

* **Regel 1 (Slugs):** Dateinamen sind stabile, sprechende IDs (Slugs) ohne PrioritÃ¤tsnummern.
* **Regel 2 (Umlaute):** Umlaute (Ã¤, Ã¶, Ã¼, ÃŸ) sind in allen Slugs zu ersetzen (ae, oe, ue, ss), Sonderzeichen zu entfernen, Leerzeichen durch Bindestriche zu ersetzen.

---
### Protokoll-Fuehrung
* **CHANGELOG.md:** Nach jeder erfolgreichen Code-Ã„nderung wird ein neuer Eintrag im CHANGELOG.md erstellt.
* **BUGLOG.md:** Neu gemeldete Fehler werden im BUGLOG.md protokolliert, bevor die Planungsphase beginnt.
