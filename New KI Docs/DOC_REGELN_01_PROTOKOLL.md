 Dieses Dokument definiert die Regeln für die aktive Abarbeitung von Aufgaben und die Protokollierung von Statusänderungen.

1. Task-Verwaltung (Priorität und Status)  
- **Information**  
- **Ablageort**  
- **Richtlinie zur Ablage**  

- **Aktuelle Hauptaufgabe:**  
  Datei: `TODO.md` (unter # Aktueller Schritt)  
  Regel: IMMER nur ein Eintrag. Nach Erledigung zu # Ausgeführte Schritte verschieben.  

- **Dringende/Neue Aufgaben (Prio 1):**  
  Datei: `Secound To do list.md`  
  Regel: Muss VOR `TODO.md` abgearbeitet werden. Nach Erledigung vollständig löschen (nicht archivieren).  

- **Erfolgreiche Änderungen:**  
  Datei: `CHANGELOG.md`  
  Regel: Muss IMMER mit einem neuen Eintrag protokolliert werden, bevor mit der nächsten Aufgabe begonnen wird.  

- **Gemeldete Fehler (Status: Unbearbeitet):**  
  Datei: `BUGLOG.md`  
  Regel: Jeder gefundene Bug MUSS hier protokolliert werden, bevor eine Behebung (via `Secound To do list.md`) initiiert wird.  

2. Abarbeitungszyklus (Regeln aus `ANWEISUNGEN.md`)  
- **Prio-1-Check:** Prüfe IMMER zuerst `Secound To do list.md`.  
- **CHANGELOG-Pflicht:** IMMER nach einer Änderung einen neuen Eintrag im `CHANGELOG.md` erstellen.  
- **Fehler-Protokoll:** IMMER einen neuen Bug zuerst im `BUGLOG.md` protokollieren.  
- **Single Task:** IMMER nur eine Aufgabe auf einmal bearbeiten.  

3. Temporäre Protokollierung  
- **Prüf- und Testergebnisse:** Werden NICHT in einer Datei gespeichert, sondern nur im temporären KI-Chat-Log (mittels JSON-Schema) ausgegeben.
- **Prüf- und Testergebnisse:** Werden nicht in einer Datei gespeichert, sondern direkt im Chat-Dialog ausgegeben.
