# Protokoll für fehlgeschlagene Bugfix-Versuche

Dieses Dokument protokolliert fehlgeschlagene Versuche bei der Behebung von Bugs, um Wiederholungen zu vermeiden und aus Fehlern zu lernen.

---

### 2024-05-20: Initialisierungsfehler in QuestManager

- **Bug:** `TypeError: Cannot read properties of null (reading 'addEventListener')` in `questManager.js` beim Zugriff auf `#gantt-end-time`.
- **Ursache:** Die Manager-Klassen werden in `main.js` initialisiert, bevor die `#app-view` und ihre Kind-Elemente im DOM verfügbar sind.

---

#### Versuch 1: Lazy Initialization der Manager

- **Hypothese:** Wenn die Initialisierung aller Manager-Klassen erst nach dem erfolgreichen Login und dem Sichtbar-Schalten der `#app-view` erfolgt, sind alle benötigten DOM-Elemente garantiert vorhanden, was den `TypeError` verhindert.
- **Geplante Schritte:**
    1.  Die Instanziierung der Manager aus dem `constructor` der `GamificationApp` in `main.js` entfernen.
    2.  Eine neue Methode `_initializeManagers()` erstellen, die alle Manager instanziiert und ein Flag `this.managersInitialized` setzt, um eine doppelte Initialisierung zu verhindern.
    3.  Die `_initializeManagers()`-Methode innerhalb von `handleAuthState()` aufrufen, direkt nachdem der Benutzer authentifiziert wurde und bevor `listenToUserProfile()` aufgerufen wird.
- **Geplante Code-Änderung (`js/main.js`):**
  ```diff
  --- a/js/main.js
  +++ b/js/main.js
  @@ -87,17 +87,7 @@
          this.currentUser = null;
          this.userProfileUnsubscribe = null;
  
  -        // Managers - Hier werden alle zukünftigen Module initialisiert
  -        this.skillTreeManager = new SkillTreeManager(this.db, this.showNotification.bind(this));
  -        this.petManager = new PetManager(this.db, this.showNotification.bind(this), this.config);
  -        this.characterSheetManager = new CharacterSheetManager(this.db, this.auth);
  -        this.inventoryManager = new InventoryManager(this.db, this.showNotification.bind(this), this.config, this.showDeleteConfirm.bind(this));
  -        this.timerManager = new TimerManager(this.showNotification.bind(this), this.handleTimerCompletion.bind(this));
  -        this.questManager = new QuestManager(this.db, this.showNotification.bind(this), this.handleXpGain.bind(this), this.processQuestDrop.bind(this), this.showDeleteConfirm.bind(this));
  -        this.testToolsManager = new TestToolsManager(this.db, this.auth, this.showNotification.bind(this), this.config, this.handleXpGain.bind(this), this.questManager);
  -        this.achievementManager = new AchievementManager(this.db, this.showNotification.bind(this), this.config);
  -
          // Managers will be initialized after login
      }
  
      init() {
  @@ -108,6 +98,22 @@
          this.loginBtn.addEventListener('click', () => this.signIn());
      }
  
      _initializeManagers() {
          if (this.managersInitialized) return;
  
          this.skillTreeManager = new SkillTreeManager(this.db, this.showNotification.bind(this));
          this.petManager = new PetManager(this.db, this.showNotification.bind(this), this.config);
          this.characterSheetManager = new CharacterSheetManager(this.db, this.auth);
          this.inventoryManager = new InventoryManager(this.db, this.showNotification.bind(this), this.config, this.showDeleteConfirm.bind(this));
          this.timerManager = new TimerManager(this.showNotification.bind(this), this.handleTimerCompletion.bind(this));
          this.questManager = new QuestManager(this.db, this.showNotification.bind(this), this.handleXpGain.bind(this), this.processQuestDrop.bind(this), this.showDeleteConfirm.bind(this));
          this.testToolsManager = new TestToolsManager(this.db, this.auth, this.showNotification.bind(this), this.config, this.handleXpGain.bind(this), this.questManager);
          this.achievementManager = new AchievementManager(this.db, this.showNotification.bind(this), this.config);
  
          this.managersInitialized = true;
      }
  
      attachAllEventListeners() {
          // This check prevents attaching listeners multiple times on re-authentication
  @@ -176,6 +182,10 @@
      handleAuthState() {
          onAuthStateChanged(this.auth, (user) => {
              if (user) {
                  this.currentUser = user;
                  // Initialize managers now that we have a user.
                  // This ensures all DOM elements are ready.
                  this._initializeManagers();
                  this.listenToUserProfile(user.uid);
              } else {
                  this.currentUser = null;
  ```