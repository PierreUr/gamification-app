# UI Rendering System Dokumentation

Dieses Dokument beschreibt das grundlegende Prinzip, nach dem die Benutzeroberfläche (UI) dieser Anwendung aufgebaut und aktualisiert wird.

---

## 1. Kernprinzip: Datengetriebenes dynamisches Rendering

Ein Großteil der UI ist **nicht statisch** in `index.html` definiert. Stattdessen wird die UI dynamisch von spezialisierten JavaScript-Managern generiert, basierend auf dem aktuellen Zustand der Daten in der Firestore-Datenbank.

**Workflow:**
1.  Ein zentraler Listener in `main.js` (`listenToUserProfile`) überwacht Änderungen am Benutzerprofil.
2.  Bei einer Datenänderung werden die neuen Daten an alle relevanten Manager verteilt.
3.  Jeder Manager ruft seine `update()`- oder `render()`-Methode auf.
4.  Diese Methode **löscht den bestehenden HTML-Inhalt** ihres Verantwortungsbereichs und **zeichnet ihn komplett neu**.

## 2. Konsequenz für Code-Änderungen

**Regel:** Änderungen an UI-Elementen in dynamischen Bereichen dürfen **niemals** nur in der `index.html`-Datei vorgenommen werden. Solche Änderungen werden bei der nächsten Datenaktualisierung sofort überschrieben und sind daher wirkungslos.

**Die korrekte Vorgehensweise ist, die `render()`- oder `update()`-Methode des zuständigen JavaScript-Managers zu modifizieren.**

**Wichtiger Hinweis zum Layout:** Viele Container (insbesondere Modals) verwenden `overflow: auto` oder `overflow: hidden`. Absolut positionierte Elemente (`position: absolute`) innerhalb dieser Container können unsichtbar werden, wenn sie außerhalb des initialen Viewports platziert werden. UI-Elemente sollten daher immer innerhalb des normalen Dokumentenflusses und der vorgesehenen Layout-Container (z.B. Header, Content-Bereich) platziert werden.

**Wichtiger Hinweis zum Timing:** Die `render()`-Methoden vieler Manager werden nur aufgerufen, wenn das zugehörige Fenster sichtbar ist. Änderungen, die sofort nach dem Login sichtbar sein sollen, müssen daher an einer zentralen Stelle (z.B. in `main.js` nach der Initialisierung) ins DOM injiziert werden, anstatt sich auf die `render()`-Methoden der Manager zu verlassen.

**Finale Erkenntnis (UI-Test-Buttons):** Der zuverlässigste Zeitpunkt, um ein **permanentes** UI-Element zu einem dynamischen Container hinzuzufügen, ist während der **Initialisierung des zuständigen Managers** (z.B. in dessen `_attachEventListeners`-Methode). Zu diesem Zeitpunkt ist die Grundstruktur des DOM vorhanden, aber das dynamische Überschreiben der Inhalte hat noch nicht begonnen.

## 3. Verantwortliche Manager für dynamische UI-Bereiche

- **Charakter-Seitenleiste (`#character-sidebar`):** Wird von `characterSheetManager.js` verwaltet.
- **Quest-Liste (`#todo-list`):** Wird von `questManager.js` verwaltet.
- **Inventar-Liste (`#inventory-list-container`):** Wird von `inventoryManager.js` verwaltet.
- **Ausrüstungs-Slots (`#equipment-slots-container`):** Wird von `inventoryManager.js` verwaltet.
- **Pet-Liste (`#pets-inventory-list`):** Wird von `petManager.js` verwaltet.