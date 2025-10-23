# Protokoll für fehlgeschlagene Bugfixes

### 2024-05-17: Inventar (Bug): Stapeln von Items

- **Referenz-ID:** `ID-20240517-U`
- **Versuchter Ansatz:**
  ```javascript
  // In inventoryManager.js, addItemToInventory
  await runTransaction(this.db, async (transaction) => {
      const q = query(inventoryColRef, where("id", "==", itemData.id), limit(1));
      const querySnapshot = await getDocs(q); // Query outside transaction reads
      // ... logic to update or set based on querySnapshot
  });
  ```
- **Ergebnis:** Das Stapeln funktionierte immer noch nicht.
- **Analyse & Erkenntnis:** Die Abfrage (`getDocs(q)`) wurde außerhalb des atomaren Lese-Vorgangs der Transaktion ausgeführt. Dadurch entstand eine Race Condition: Zwischen der Abfrage und dem Start der Schreiboperation konnte sich der Zustand der Datenbank bereits geändert haben, was den Zweck der Transaktion zunichtemachte. Eine Firestore-Transaktion kann keine Abfragen (`query`) direkt ausführen, sondern nur Leseoperationen auf spezifischen Dokumenten-Referenzen (`transaction.get(docRef)`). Der Ansatz war fundamental fehlerhaft.