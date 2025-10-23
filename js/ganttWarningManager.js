export class GanttWarningManager {
    constructor() {
        this.maxWorkSessionMinutes = 45;
    }

    getQuestWarning(quest, index, allScheduledQuests) {
        const longWorkWarning = this._checkLongWorkSegment(quest);
        if (longWorkWarning) return longWorkWarning;

        const noBreakWarning = this._checkMissingBreak(quest, index, allScheduledQuests);
        if (noBreakWarning) return noBreakWarning;

        return null;
    }

    _checkMissingBreak(quest, index, allScheduledQuests) {
        if (index === -1 || index >= allScheduledQuests.length - 1) return null;

        const nextQuest = allScheduledQuests[index + 1];
        const questEndTime = (quest.ganttScheduledAt || quest.scheduledAt).toMillis() + (quest.durationMinutes * 60000);
        const nextQuestStartTime = (nextQuest.ganttScheduledAt || nextQuest.scheduledAt).toMillis();
        const gap = nextQuestStartTime - questEndTime;

        if (gap > 0 && gap < 10 * 60000) return "Keine ausreichende Pause zur nächsten Quest!";
        return null;
    }

    _checkLongWorkSegment(quest) {
        let lastBreakTime = (quest.ganttScheduledAt || quest.scheduledAt).toMillis();
        const sortedBreaks = (quest.breaks || []).sort((a, b) => a.scheduledAt.toMillis() - b.scheduledAt.toMillis());
        for (const breakItem of sortedBreaks) {
            if ((breakItem.scheduledAt.toMillis() - lastBreakTime) / 60000 > this.maxWorkSessionMinutes) return 'Ein Arbeitsblock ist > 45min!';
            lastBreakTime = breakItem.scheduledAt.toMillis() + (breakItem.durationMinutes * 60000);
        }
        const questEndTime = (quest.ganttScheduledAt || quest.scheduledAt).toMillis() + (quest.durationMinutes * 60000);
        if ((questEndTime - lastBreakTime) / 60000 > this.maxWorkSessionMinutes) return 'Letzter Arbeitsblock ist > 45min!';
        return null;
    }
}