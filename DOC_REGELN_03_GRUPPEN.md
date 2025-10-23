Dieses Dokument enthält die Regeln für die technische Analyse und die Definition von Datenstrukturen innerhalb der Dokumentation.

1. UI-Struktur-Analyse (UV_ID_RULZ.md & UI_ELEMENT_IDS.md)

Hierarchie: Die UI-ID-Nummerierung folgt der Logik in UV_ID_RULZ.md (Tausender-Ebenen für Hauptbereiche, Hunderter/Zehner für Unterbereiche).

Kapselung: Jedes UI-Element MUSS in einen eigenen div-Container mit eindeutiger, dokumentierter ID (div-XXXX) gekapselt werden (siehe Funktionssystem.md).

Register-Pflege: Alle neuen div-XXXX-IDs MÜSSEN in UI_ELEMENT_IDS.md eingetragen werden (ID, Farbgruppe, Beschreibung).

2. Konfigurationsdaten (UI-Text.csv Richtlinie)

Richtlinie: Die Struktur (Spalten) und der Pflegeprozess der UI-Text.csv wird von UI-Text-analyse.md definiert.

Daten-Ablage: Die statischen CSS- und Text-Konfigurationsdaten werden in UI-Text.csv abgelegt und müssen der in UI-Text-analyse.md definierten Struktur folgen.