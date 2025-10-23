# Bug-Protokoll (Buglog)

### 2024-05-17: Quest-Bearbeitungsfenster speichert keine Änderungen

- **Benutzerbericht:**
  ```
  Es geht um Quest, das bearbeitung fenster speichert die änderungen nicht.
  ```
- **Status:** `Neu`
- **Priorität:** `Wird später festgelegt`


### 2024-05-21: Quests können nicht abgeschlossen werden

- **Benutzerbericht:**
  ```
  Es klappt jetzt soweit nur das der Button Single Quest eine quest erstellt die ich mit dem test tool button (alle quest erledigen nicht beenden kann).
  ```
- **Status:** `Erledigt`
- **Priorität:** `Hoch`
- **Analyse:** Debugging-`console.log`-Anweisungen wurden in `questManager.js` and `testToolsManager.js` hinzugefügt, um das Problem zu untersuchen. Warten auf Feedback/Logs vom Benutzer.
