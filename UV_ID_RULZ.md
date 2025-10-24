Strukturierte Logik für div-Ebenen
Oberste UI-Ebenen (z. B. Hauptmenüs) erhalten Tausender-IDs: 1000, 2000, 3000, 4000

Untermenüpunkte innerhalb dieser Ebenen verwenden Hunderter-IDs (z. B. 1100, 1200)

Fenster, die in einem Menüpunkt geöffnet werden, erhalten weitere 100er-Schritte innerhalb der Ebene (z. B. 1110, 1120)

Auflistungen oder Elemente innerhalb dieser Fenster sind in Zehnerschritten fortgeführt (z. B. 1112, 1114)

Jeder Container (div-Ebene) erhält einen 2 Pixel breiten Rahmen in der Farbgruppe seiner Tausender-ID

Farbzuordnung der Tausendergruppen
1000er → rot

2000er → grün

3000er → gelb

4000er → blau

Beispielhafte div-Ebenen-Struktur
Ebene	Beispiel-ID	Beschreibung	Rahmenfarbe
Hauptmenü (UI-Root)	1000	Hauptchart, Charakter-Menü usw.	rot
Menüpunkt „Inventar"	1100	Untermenüpunkt im Hauptmenü	rot
Fenster „Inventardetails"	1110	In „Inventar" geöffnetes Fenster	rot
Liste innerhalb des Fensters	1112	Auflistung einzelner Items	rot
Zweites Hauptmenü	2000	Ausrüstungsübersicht	grün
Menüpunkt dort	2100	z. B. „Waffen" im Ausrüstungsmenü	grün
Beispielhafte CSS-Zuordnung
css
/* 1000er Ebene */
.div-1000, .div-1100, .div-1110, .div-1112 {
  border: 2px solid red;
}

/* 2000er Ebene */
.div-2000, .div-2100 {
  border: 2px solid green;
}

/* 3000er Ebene */
.div-3000 {
  border: 2px solid yellow;
}

/* 4000er Ebene */
.div-4000 {
  border: 2px solid blue;
}
Hinweise zur Implementierung
IDs sind eindeutig zu vergeben (z. B. id="div-1112")

CSS kann sowohl über id als auch über class angesprochen werden

Die Rahmenfarben ermöglichen eine schnelle optische Zuordnung der UI-Ebene

Diese Systematik wird konsequent für alle weiteren Ebenen fortgeführt