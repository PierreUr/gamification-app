# Protokoll für fehlgeschlagene Aufgaben-Implementierungen

Dieses Dokument protokolliert fehlgeschlagene Versuche bei der Implementierung von neuen Funktionen oder komplexen Änderungen, die keine reinen Bugfixes sind.

---

*(Hier werden zukünftige Einträge hinzugefügt)*

### 2024-05-19: UI-Test-Button "-10 HP" hinzufügen

- **Ziel:** Einen sichtbaren und funktionalen "-10 HP"-Button zur UI hinzufügen.
- **Fehlgeschlagene Versuche (Zusammenfassung):**
  1.  **Ansatz:** Button statisch in `index.html` im Test-Fenster hinzufügen.
      - **Ergebnis:** Nicht sichtbar.
  2.  **Ansatz:** Button programmatisch im `characterSheetManager.js` erstellen.
      - **Ergebnis:** Nicht sichtbar.
  3.  **Ansatz:** Button rudimentär in `main.js` erstellen.
      - **Ergebnis:** Sichtbar und funktional, aber an der falschen Stelle und architektonisch unsauber.
  4.  **Ansatz:** Button an verschiedenen Stellen in den Modal-Fenstern einfügen.
      - **Ergebnis:** Nicht sichtbar.
- **Finale Analyse & Erkenntnis:**
  - **Problem 1 (Dynamisches Rendering):** Viele UI-Bereiche werden von JS-Managern dynamisch neu gezeichnet. Statische Änderungen in `index.html` werden sofort überschrieben.
  - **Problem 2 (CSS-Layout):** Die `overflow`-Eigenschaft der Modal-Fenster "schneidet" absolut positionierte Kind-Elemente ab, wenn sie außerhalb des sichtbaren Bereichs platziert werden.
  - **Problem 3 (Timing):** Die `render()`-Methoden der Manager werden oft erst aufgerufen, wenn ein Fenster geöffnet wird. Ein zentraler, verlässlicher Zeitpunkt zum Injizieren von UI-Elementen ist notwendig.
- **Nächster Schritt (Lösung):** Eine zentrale Methode `_injectTestButtons()` in `main.js` erstellen, die *nach* der Initialisierung der App aufgerufen wird. Diese Methode fügt die Buttons direkt in die Header der jeweiligen UI-Container ein, was sowohl das Timing- als auch das Layout-Problem löst.