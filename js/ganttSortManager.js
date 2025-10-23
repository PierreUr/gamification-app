import { Timestamp, writeBatch, doc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
/**
 * Gantt Sort Manager
 * 
 * Diese Klasse ist verantwortlich für die Implementierung der "Auto-Sortieren"-Funktionalität
 * im Gantt-Chart. Sie ordnet Quests neu an und fügt Pausen gemäß den Pomodoro-Regeln ein.
 */
export class GanttSortManager {
    constructor(ganttManager) {
        this.ganttManager = ganttManager;
    }

    async sortAllQuests() {
        const pomodoroSettings = this.ganttManager.questManager?.userProfile?.pomodoroSettings;
        const pomodoroBreaks = this.ganttManager.pomodoroBreaks;

        if (this.ganttManager.pomodoroModeActive && pomodoroBreaks && pomodoroBreaks.length > 0) {
            this._sortIntoPomodoroGrid(pomodoroSettings, pomodoroBreaks);
        } else {
            this._sortChronologically();
        }
    }

    async _sortChronologically() {
        const scheduledQuests = this.ganttManager.localQuests.filter(q => q.ganttScheduledAt)
            .sort((a, b) => a.ganttScheduledAt.toMillis() - b.ganttScheduledAt.toMillis());

        if (scheduledQuests.length < 2) return;

        const batch = writeBatch(this.ganttManager.db);
        let lastQuestEndTime = 0;

        scheduledQuests.forEach((quest, index) => {
            if (index > 0) {
                const newStartTime = new Date(lastQuestEndTime);
                const questEndTime = new Date(newStartTime.getTime() + quest.durationMinutes * 60000);
                if (this.ganttManager.logQuestPositioning) {
                    console.log(`Quest "${quest.text}" | Chronologisch sortiert: Start: ${newStartTime.toLocaleTimeString()}, Ende: ${questEndTime.toLocaleTimeString()} | Formel: Endzeit der vorherigen Quest`);
                }

                const questRef = doc(this.ganttManager.db, 'todos', quest.id);
                batch.update(questRef, { ganttScheduledAt: Timestamp.fromDate(newStartTime) });
                lastQuestEndTime = newStartTime.getTime() + (quest.durationMinutes * 60000);
            } else {
                lastQuestEndTime = quest.ganttScheduledAt.toMillis() + (quest.durationMinutes * 60000);
            }
        });

        await batch.commit();
        this.ganttManager.showNotification("Alle Quests wurden chronologisch sortiert.", "success");
        this.ganttManager.render(this.ganttManager.localQuests); // Force re-render after sorting
    }

    async _sortIntoPomodoroGrid(settings, breaks) {
        const questsToSort = this.ganttManager.localQuests
            .filter(q => q.ganttScheduledAt)
            .sort((a, b) => {
                const priorityA = a.pomodoroPriority || 99;
                const priorityB = b.pomodoroPriority || 99;
                return priorityA - priorityB;
            });

        if (questsToSort.length === 0) {
            this.ganttManager.showNotification("Keine Quests zum Sortieren vorhanden.", "info");
            return;
        }

        const sortedBreaks = [...breaks].sort((a, b) => a.startTime - b.startTime);
        const batch = writeBatch(this.ganttManager.db);
        
        console.groupCollapsed("Analyse: Pomodoro-Sortierung");
        console.log("Pomodoro-Startzeit:", new Date(this._parseTimeToMillis(settings.startTime)).toLocaleTimeString());
        console.log("Quests vor Sortierung:", questsToSort.map(q => ({ text: q.text, prio: q.pomodoroPriority || 99, currentStart: q.ganttScheduledAt?.toDate().toLocaleTimeString() || 'N/A' })));
        console.log("Pausen:", sortedBreaks.map(b => ({ type: b.type, start: new Date(b.startTime).toLocaleTimeString(), end: new Date(b.endTime).toLocaleTimeString() })));

        // 1. Handle the highest priority quest as the "zero point"
        const highestPrioQuest = questsToSort[0];
        const startTimeMillis = this._parseTimeToMillis(settings.startTime);
        
        const highestPrioQuestRef = doc(this.ganttManager.db, 'todos', highestPrioQuest.id);
        console.log(`Quest "${highestPrioQuest.text}" | Ursprüngliche Startzeit: ${highestPrioQuest.ganttScheduledAt?.toDate().toLocaleTimeString() || 'N/A'}`);
        const highestPrioQuestEndTime = new Date(startTimeMillis + highestPrioQuest.durationMinutes * 60000);
        if (this.ganttManager.logQuestPositioning) {
            console.log(`Quest "${highestPrioQuest.text}" | Platziert (Nullpunkt): Start: ${new Date(startTimeMillis).toLocaleTimeString()}, Ende: ${highestPrioQuestEndTime.toLocaleTimeString()} | Formel: Pomodoro-Startzeit`);
        }
        batch.update(highestPrioQuestRef, { ganttScheduledAt: Timestamp.fromMillis(startTimeMillis) });

        let nextAvailableTime = highestPrioQuestEndTime.getTime();

        // 2. Sort the remaining quests
        questsToSort.slice(1).forEach(quest => { // Use slice(1) to iterate over all quests EXCEPT the first one
            const questDuration = quest.durationMinutes * 60000;
            console.log(`\nVerarbeite Quest "${quest.text}" (Dauer: ${quest.durationMinutes} Min)`);
            console.log(`Aktuell nächstverfügbare Zeit vor Pausenprüfung: ${new Date(nextAvailableTime).toLocaleTimeString()}`);

            const newStartTime = nextAvailableTime;
            const questRef = doc(this.ganttManager.db, 'todos', quest.id);
            const newQuestEndTime = new Date(newStartTime + questDuration);
            if (this.ganttManager.logQuestPositioning) {
                console.log(`Quest "${quest.text}" | Platziert: Start: ${new Date(newStartTime).toLocaleTimeString()}, Ende: ${newQuestEndTime.toLocaleTimeString()} | Formel: Endzeit der vorherigen Quest (nach Pausenprüfung)`);
            }
            batch.update(questRef, { ganttScheduledAt: Timestamp.fromMillis(newStartTime) });
            nextAvailableTime += questDuration;
        });

        await batch.commit();
        this.ganttManager.showNotification("Quests wurden in das Pomodoro-Raster einsortiert.", "success");
        this.ganttManager.render(this.ganttManager.localQuests); // Force re-render after sorting
        console.groupEnd();
    }

    _parseTimeToMillis(timeString) {
        if (!timeString) return new Date().setHours(9, 0, 0, 0);
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date.getTime();
    }

    calculateWorkSegmentsForQuest(quest, breaks) {
        const questStart = (quest.ganttScheduledAt || quest.scheduledAt)?.toMillis();
        if (!questStart) return [];
        const questEnd = questStart + quest.durationMinutes * 60000;

        let workSegments = [{ start: questStart, end: questEnd }];

        const relevantBreaks = breaks.filter(b => b.startTime < questEnd && b.endTime > questStart);

        relevantBreaks.forEach(breakData => {
            const newSegments = [];
            workSegments.forEach(segment => {
                // Case 1: Break is completely outside the segment -> keep segment
                if (breakData.endTime <= segment.start || breakData.startTime >= segment.end) {
                    newSegments.push(segment);
                    return;
                }

                // Case 2: Break starts before segment and ends within it -> cut the start
                if (breakData.startTime <= segment.start && breakData.endTime < segment.end) {
                    newSegments.push({ start: breakData.endTime, end: segment.end });
                }
                // Case 3: Break starts within segment and ends after it -> cut the end
                else if (breakData.startTime > segment.start && breakData.endTime >= segment.end) {
                    newSegments.push({ start: segment.start, end: breakData.startTime });
                }
                // Case 4: Break is completely within the segment -> split into two
                else if (breakData.startTime > segment.start && breakData.endTime < segment.end) {
                    newSegments.push({ start: segment.start, end: breakData.startTime });
                    newSegments.push({ start: breakData.endTime, end: segment.end });
                }
            });
            workSegments = newSegments;
        });
        return workSegments.filter(s => s.end > s.start); // Return only valid segments
    }
}