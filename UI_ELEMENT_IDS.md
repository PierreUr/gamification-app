# UI-Element-ID-Verzeichnis

Dieses Dokument listet alle UI-Container-IDs auf, die in der Anwendung verwendet werden. Jedes einzelne HTML-Element ist in einem eigenen `div` gekapselt, um eine extrem granulare und nachvollziehbare Struktur zu gewährleisten.

| ID | Farbgruppe | Beschreibung |
|---|---|---|
| **1000er** | Rot | **Gegner-Team** - UI-Elemente des Gegners. |
| `div-1000` | Rot | Hauptcontainer für die Anzeige des Gegner-Teams (linke Spalte). |
| `div-1100+` | Rot | Haupt-Container (`.creature-card`) für eine einzelne Gegner-Kreatur. |
| `div-11x1` | Rot | Wrapper für den Sprite/Bild (`.sprite-placeholder`). |
| `div-11x1-1` | Rot | Wrapper für das `<img>`-Element. |
| `div-11x2` | Rot | Wrapper für den Namen (`h3`). |
| `div-11x2-1` | Rot | Wrapper für das `<h3>`-Element. |
| `div-11x3` | Rot | Wrapper für den HP-Balken. |
| `div-11x4` | Rot | Wrapper für die Statistik-Liste. |
| `div-11x4-0`| Rot | Wrapper für den Titel der Stat-Liste (`h4`). |
| `div-11x4-1` | Rot | Wrapper für das `<ul>`-Element der Stats. |
| `div-11x4-2` | Rot | Wrapper für ein einzelnes `<li>`-Stat-Element. |
| `div-11x5` | Rot | Wrapper für die Ausrüstungs-Liste. |
| | | |
| **2000er** | Grün | **Spieler-Team** - UI-Elemente des Spielers. |
| `div-2000` | Grün | Hauptcontainer für die Anzeige des Spieler-Teams (rechte Spalte). |
| `div-2100+` | Grün | Haupt-Container (`.creature-card`) für eine einzelne Spieler-Kreatur. |
| `div-21x1` | Grün | Wrapper für den Sprite/Bild. |
| `div-21x2` | Grün | Wrapper für den Namen (`h3`). |
| `div-21x4-0`| Grün | Wrapper für den Titel der Stat-Liste (`h4`). |
| `...` | Grün | *(Struktur identisch zu 1000er Serie)* |
| | | |
| **3000er** | Gelb | **Aktionsleisten** - Bereich zur Anzeige von Fähigkeiten. |
| `div-3000` | Gelb | Hauptcontainer, der beide Aktionsspalten umschließt. |
| `div-3100` | Gelb | Container für die Anzeige der Gegner-Fähigkeiten (links). |
| `div-3110+` | Gelb | Container für den Fähigkeitsblock eines Gegners. |
| `div-31x1` | Gelb | Wrapper für den Titel des Blocks (`h4`). |
| `div-31x2` | Gelb | Wrapper für die Fähigkeitsliste (`ul`). |
| `div-31x3` | Gelb | Wrapper für einen Fähigkeitseintrag (`li`). |
| `div-3200` | Gelb | Container für die Aktionen/Fähigkeiten des Spielers (rechts). |
| `div-3210+` | Gelb | Container für den Fähigkeitsblock eines Spielers. |
| `div-32x1` | Gelb | Wrapper für den Titel des Blocks (`h4`). |
| `div-32x2` | Gelb | Wrapper für die Fähigkeitsliste (`ul`). |
| `div-32x3` | Gelb | Wrapper für einen Fähigkeitseintrag (`li`). |
| `div-32x4` | Gelb | Wrapper für einen klickbaren Fähigkeits-Button. |
| | | |
| **4000er** | Blau | **System & Informationen** - Globale UI-Elemente. |
| `div-4000` | Blau | Container für das Kampfprotokoll. |
| `div-4100` | Blau | Hauptcontainer der App (`#app-container`). |
| `div-4101` | Blau | Wrapper für den Titel (`h1`). |
| `div-4110` | Blau | Wrapper für "Pet Viewer"-Button. |
| `div-4111` | Blau | Wrapper für "Test Tools"-Button. |
| `div-4112` | Blau | Wrapper für "Admin Panel"-Button. |
| `div-4120` | Blau | Wrapper für die UI-Template-Auswahlgruppe. |
| `div-4120-1`| Blau | Wrapper für das "UI Template:"-Label. |
| `div-4120-2`| Blau | Wrapper für das Template-Auswahl-Dropdown (`#template-switcher`). |
| `div-4120-3`| Blau | Wrapper für den "Set Default Template"-Button. |
| `div-4130` | Blau | Wrapper für die Anzeige der Benutzerrolle. |
| `div-4130-1` | Blau | Wrapper für den Text der Benutzerrolle (`span`). |
| `div-4200` | Blau | Haupt-Element eines modalen Fensters (`.modal-window`). |
| `div-4211` | Blau | Wrapper für den Fenstertitel (`span`). |
| `div-4212` | Blau | Wrapper für den Schließen-Button (`button`). |
| `...` | Blau | *(Weitere IDs für modale Fenster)* |
| | | |
| **5000er** | Orange | **Test-Tools** - Werkzeuge zum Debuggen. |
| `div-5000` | Orange | Hauptcontainer für den Inhalt des "Test Tools"-Fensters. |
| `div-5001-1` | Orange | Wrapper für "Gegner-KI"-Label. |
| `div-5100`   | Orange | Container für die primären Steuerelemente im Test-Tools-Panel. |
| `div-5001-2` | Orange | Wrapper für das KI-Dropdown (`#ai-toggle`). |
| `div-5002-1` | Orange | Wrapper für "Hierarchische Rahmen umschalten"-Button. |
| `div-5003-1` | Orange | Wrapper für "Kampf zurücksetzen"-Button. |
| `div-5005`   | Orange | Wrapper-Container für "Create Test Folder"-Button. |
| `div-5005-1` | Orange | Wrapper für den "Create Test Folder"-Button. |
| `div-5007` | Orange | Wrapper-Container für "Test: Content anwenden"-Button. |
| `div-5007-1` | Orange | Wrapper für den "Test: Content anwenden"-Button (`#test-apply-content-button`). |
| `div-5008` | Orange | Wrapper-Container für "Test: CSS anwenden"-Button. |
| `div-5008-1` | Orange | Wrapper für den "Test: CSS anwenden"-Button (`#test-apply-css-button`). |
| `div-5009` | Orange | Wrapper-Container für "Test: Add CSS Row"-Button. |
| `div-5009-1` | Orange | Wrapper für den "Test: Add CSS Row"-Button (`#test-add-css-row-button`). |
| `div-5010`   | Orange | Wrapper-Container für das "Test Image URL"-Tool. |
| `div-5010-1` | Orange | Wrapper für das "Test Image URL"-Label. |
| `div-5010-2` | Orange | Wrapper für das "Test Image URL"-Eingabefeld (`#test-image-url-input`). |
| `div-5010-3` | Orange | Wrapper für den "Set Image URL"-Button (`#test-set-image-url-button`). |
| `div-5011`   | Orange | Wrapper-Container für "Test: Switch Template"-Button. |
| `div-5011-1` | Orange | Wrapper für den "Test: Switch Template"-Button (`#test-switch-template`). |
| `div-5015`   | Orange | Wrapper für "Test: Save Mock Config"-Button. |
| `div-5016`   | Orange | Wrapper für "Test: Reload Config"-Button. |
| `div-5017`   | Orange | Wrapper für "Populate DB with Sample Data"-Button. |
| `...` | Orange | *(Extrem granulare IDs für alle Labels, Inputs, Buttons)* |
| | | |
| **6000er** | Lila | **Admin Panel** - Backend-Verwaltungsoberfläche. |
| `div-6000` | Lila | Hauptcontainer des Admin Panels. |
| `div-6001` | Lila | Lade-Anzeige des Admin Panels. |
| `div-6002` | Lila | Fehler-Anzeige für nicht verfügbare Rollenansicht. |
| `div-6003` | Lila | Haupt-Wrapper für den Inhalt einer Rollenansicht. |
| `div-6100` | Lila | Container für die Rollen-Tabs (SuperAdmin, Template Admin, etc.). |
| `div-6101` | Lila | Wrapper für den "SuperAdmin" Rollen-Tab. |
| `div-6101-text`| Lila | Text des "SuperAdmin" Rollen-Tabs. |
| `div-6102` | Lila | Wrapper für den "Template Admin" Rollen-Tab. |
| `div-6102-text`| Lila | Text des "Template Admin" Rollen-Tabs. |
| `div-6103` | Lila | Wrapper für den "Design Admin" Rollen-Tab. |
| `div-6103-text`| Lila | Text des "Design Admin" Rollen-Tabs. |
| `div-6110` | Lila | Container für die Haupt-Tabs des SuperAdmins. |
| `div-6111` | Lila | Wrapper für den SuperAdmin-Tab "Template". |
| `div-6111-text`| Lila | Text des SuperAdmin-Tabs "Template". |
| `div-6112` | Lila | Wrapper für den SuperAdmin-Tab "Administration". |
| `div-6112-text`| Lila | Text des SuperAdmin-Tabs "Administration". |
| `div-6113` | Lila | Wrapper für den SuperAdmin-Tab "Database Configuration". |
| `div-6113-text`| Lila | Text des SuperAdmin-Tabs "Database". |
| `div-6120` | Lila | Container für den Inhalt des aktiven SuperAdmin-Haupt-Tabs. |
| `div-6130` | Lila | Wrapper für eine Standard-Tab-Ansicht (Template-Auswahl + Daten-Tabs). |
| `div-6150` | Lila | Container für die Sub-Tabs der SuperAdmin "Administration"-Ansicht. |
| `div-6151` | Lila | Wrapper für den Admin-Sub-Tab "Design Groups". |
| `div-6151-text`| Lila | Text des Admin-Sub-Tabs "Design Groups". |
| `div-6152` | Lila | Wrapper für den Admin-Sub-Tab "User Management". |
| `div-6152-text`| Lila | Text des Admin-Sub-Tabs "User Management". |
| `div-6153` | Lila | Wrapper für den Admin-Sub-Tab "Rules". |
| `div-6153-text`| Lila | Text des Admin-Sub-Tabs "Rules". |
| `div-6154` | Lila | Wrapper für den Admin-Sub-Tab "Permission Admin". |
| `div-6154-text`| Lila | Text des Admin-Sub-Tabs "Permission Admin". |
| `div-6155` | Lila | Wrapper für den Admin-Sub-Tab "Text Permissions". |
| `div-6155-text`| Lila | Text des Admin-Sub-Tabs "Text Permissions". |
| `div-6160` | Lila | Container für den Inhalt des aktiven Admin-Sub-Tabs. |
| `div-6200` | Lila | Container für das Template-Management (Auswahl, Erstellung). |
| `div-6201` | Lila | Gruppe für die Template-Auswahl. |
| `div-6201-1`| Lila | Wrapper für das Template-Auswahl-Label. |
| `div-6201-1-text`| Lila | Text für das Template-Auswahl-Label. |
| `div-6201-2`| Lila | Wrapper für das Template-Auswahl-Dropdown. |
| `div-6201-3`| Lila | Wrapper für den "Refresh"-Button. |
| `div-6201-3-text`| Lila | Text des "Refresh"-Buttons. |
| `div-6210` | Lila | Gruppe für die Template-Erstellung. |
| `div-6210-1`| Lila | Wrapper für das "New Template Name"-Inputfeld. |
| `div-6210-2`| Lila | Wrapper für den "Create"-Button. |
| `div-6210-2-text`| Lila | Text des "Create"-Buttons. |
| `div-6250` | Lila | Container für die Datenbank-Konfiguration. |
| `div-6250-1`| Lila | Titel der DB-Konfiguration (Summary). |
| `div-6250-1-text`| Lila | Text des DB-Konfig-Titels. |
| `div-6251` | Lila | Wrapper für die "Project ID"-Zeile. |
| `div-6251-1-text`| Lila | Text des "Project ID"-Labels. |
| `div-6252` | Lila | Wrapper für die "API Key"-Zeile. |
| `div-6252-1-text`| Lila | Text des "API Key"-Labels. |
| `div-6253` | Lila | Wrapper für die "Database URL"-Zeile. |
| `div-6253-1-text`| Lila | Text des "Database URL"-Labels. |
| `div-6254-text`| Lila | Text des "Save Configuration"-Buttons. |
| `div-6300` | Lila | Container für die Daten-Tabs (Pets, Skills, etc.). |
| `div-6301-text`| Lila | Text des "Pets"-Daten-Tabs. |
| `div-6302-text`| Lila | Text des "Skills"-Daten-Tabs. |
| `div-6303-text`| Lila | Text des "Rules"-Daten-Tabs. |
| `div-6304-text`| Lila | Text des "Design"-Daten-Tabs. |
| `div-6305-text`| Lila | Text des "Design Groups"-Daten-Tabs. |
| `div-6307-text`| Lila | Text des "Permission Admin"-Daten-Tabs (für Template Admin). |
| `div-6308-text`| Lila | Text des "Text Permissions"-Daten-Tabs (für Template Admin). |
| `div-6350` | Lila | Container für den Inhalt des aktiven Daten-Tabs. |
| `div-6400` | Lila | Hauptcontainer für den Pet-Editor. |
| `div-6410-1-text`| Lila | Titel der Pet-Liste ("Pets"). |
| `div-6450-error`| Lila | Fehlermeldung im Pet-Formular. |
| `div-6451-text`| Lila | Text für "Back to List"-Button (Pets). |
| `div-6452-text-new`| Lila | Titel für neues Pet ("New Pet"). |
| `div-6452-text-edit`| Lila | Titel für Bearbeitung eines Pets ("Edit: ..."). |
| `div-6453-1-text`| Lila | Label für Pet-Name ("Name:"). |
| `div-6454-text`| Lila | Text für "Save Pet"-Button. |
| `div-6551-text`| Lila | Text für "Back to List"-Button (Skills). |
| `div-6611-text`| Lila | Titel für "Rarities Management". |
| `div-6613-text`| Lila | Text für "Add Rarity"-Button. |
| `...` | Lila | *(Weitere granulare IDs für das Admin Panel)* |
| `div-6806`   | Lila | Wrapper für den "Snapshots"-Bereich im Design-Tab. |
| `div-6806-1` | Lila | Wrapper für den "Create New Snapshot"-Button. |
| `div-6808` | Lila | Wrapper für die "Generelle CSS-Einstellungen" im Design-Tab. |
| `div-6839-X-1` | Lila | Wrapper für den "Inspect DB Data"-Button im Design-Tab. |
| `div-6839-X-2` | Lila | Wrapper für den "Inspect All Styles"-Button im Design-Tab. |
| `div-6839-X-3` | Lila | Wrapper für den "Compare Styles"-Button im Design-Tab. |
| `div-6850` | Lila | Wrapper für die "Globale Texte"-Gruppe im Static-Texts-Tab. |
| `div-6999` | Lila | Unbekannter Tab. |
| | | |
| **7000er** | Türkis | **Pet Viewer** - Read-only Ansicht der Pets. |
| `div-7000` | Türkis | Hauptcontainer des Pet Viewers. |
| `div-7100` | Türkis | Linker Bereich mit der Liste der Pets. |
| `div-7200` | Türkis | Rechter Bereich mit den Details des ausgewählten Pets. |