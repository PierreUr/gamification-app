# Benutzerhandbuch zur Gamification App

Willkommen! Dieses Handbuch erklärt dir alle wichtigen Funktionen der App, damit du deine Aufgaben spielerisch meistern kannst.

---

## 1. Erste Schritte

- **Anmelden:** Klicke auf den **Login-Button**, um einen neuen, anonymen Charakter zu erstellen. Deine Spieldaten werden lokal in deinem Browser gespeichert.
- **Abmelden & Zurücksetzen:** Über den **Logout-Button** im Hauptmenü kannst du deinen Charakter und alle zugehörigen Daten (Quests, Inventar, etc.) unwiderruflich löschen.

---

## 2. Das Quest-System

Quests sind deine Aufgaben. Für jede abgeschlossene Quest erhältst du Belohnungen.

### Quest-Verwaltung
- **Neue Quest erstellen:** Öffne über das Hauptmenü den "Neue Quest"-Wizard. Hier kannst du Aufgaben detailliert definieren (Titel, Typ, Dauer, Priorität, etc.).
- **Meine Quests ansehen:** Im Fenster "Meine Quests" siehst du eine Liste all deiner aktiven Aufgaben. Du kannst sie hier filtern und sortieren.

### Interaktionen mit einer Quest
- **Abschließen (`✓`):** Markiert eine Quest als erledigt. Du erhältst Erfahrungspunkte (XP) und Währung. Mit etwas Glück findest du sogar einen Gegenstand!
- **Löschen (`🗑️`):** Entfernt eine Quest dauerhaft.
- **Fokus (`👁️`):** Setzt eine Quest in den Fokusbereich auf der Hauptseite und plant sie für heute ein.
- **Heute (`📅`):** Ändert das Fälligkeitsdatum einer Quest auf den heutigen Tag.

---

## 3. Dein Charakter

Die rechte Seitenleiste gibt dir einen Überblick über deinen Charakter.

- **Level & XP:** Schließe Quests ab, um XP zu sammeln. Genug XP führen zu einem **Level-Up**, wodurch du Attributs- und Skill-Punkte erhältst.
- **Attribute (Stats):**
  - **Vitalität, Stärke, Intelligenz etc.:** Dies sind deine Basis-Attribute.
  - **Punkte verteilen:** Wenn du Attributspunkte (`+`-Button) verfügbar hast, kannst du sie ausgeben, um deine Basis-Attribute permanent zu erhöhen.
- **Abgeleitete Werte:** Deine Attribute und deine Ausrüstung bestimmen deine Kampfwerte.
  - **Lebenspunkte (HP):** Werden hauptsächlich durch `Vitalität` bestimmt.
  - **Mana (MP):** Werden hauptsächlich durch `Intelligenz` bestimmt.
  - **Ausdauer (Stamina):** Werden hauptsächlich durch `Stamina` (Attribut) bestimmt.

---

## 4. Inventar & Ausrüstung

- **Ausrüstung:** Im Ausrüstungs-Fenster siehst du, welche Gegenstände dein Charakter aktuell trägt. Du kannst hier Items ablegen (`unequip`).
- **Inventar:** Hier landen alle deine gefundenen und nicht ausgerüsteten Gegenstände.
  - **Ausrüsten:** Lege einen Gegenstand aus dem Inventar an. Er wird automatisch in den richtigen Slot platziert und ein eventuell bereits getragener Gegenstand wandert zurück ins Inventar.
  - **Benutzen:** Konsumiere Gegenstände wie Heil- oder Manatränke.
  - **Verwerfen:** Lösche einen Gegenstand permanent aus dem Inventar.

---

## 5. Pets (Begleiter)

Pets sind deine Begleiter, die dir Boni auf deine Attribute geben.

- **Pet-Verwaltung:** Im "Meine Pets"-Fenster kannst du deine gesammelten Pets verwalten.
- **Aktivieren/Tauschen:** Du kannst eine begrenzte Anzahl an Pets "aktiv" schalten. Ihre Boni werden dann auf deinen Charakter angerechnet. Tausche sie gegen andere Pets aus deinem Inventar aus, um deine Strategie anzupassen.

---

## 6. Spielmechaniken & Formeln

### Gegenstände finden (Item Drops)

Wenn du eine Quest abschließt, besteht die Chance, einen Gegenstand zu finden. Die Wahrscheinlichkeit dafür wird wie folgt berechnet:

- **Basis-Chance:** Es gibt eine feste Grundchance für einen Drop.
- **Prioritäts-Bonus:** Quests mit höherer Priorität (z.B. "Schwer") erhöhen diese Chance.
- **Glücks-Bonus:** Dein `Glück` (Luck) Attribut erhöht die Chance zusätzlich.

Wenn ein Gegenstand gefunden wird, bestimmt eine zweite Berechnung basierend auf deinem `Glück` die Seltenheit des Gegenstands (von `Gewöhnlich` bis `Episch`).

### Währung

Das Währungssystem ist hierarchisch aufgebaut:
- 100 Bronze = 1 Silber
- 100 Silber = 1 Gold

Deine Gesamtwährung wird automatisch umgerechnet und in Gold, Silber und Bronze angezeigt.