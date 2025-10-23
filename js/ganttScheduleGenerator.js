/**
 * Gantt Schedule Generator
 * 
 * Diese Klasse ist verantwortlich für die Erstellung eines kompletten,
 * regelbasierten Tagesplans (Pomodoro-Raster) aus Arbeits- und Pausenblöcken.
 */
export class GanttScheduleGenerator {
    constructor(ganttManager) {
        this.ganttManager = ganttManager;
    }

    /**
     * Generiert einen vollständigen Tagesplan basierend auf den Pomodoro-Einstellungen.
     * @param {number} workIntervalMinutes - Die Dauer eines Arbeitsblocks in Minuten.
     * @param {number} shortBreakMinutes - Die Dauer einer kurzen Pause in Minuten.
     */
    generateFullDaySchedule(workIntervalMinutes, shortBreakMinutes) {
        const settings = this.ganttManager.questManager?.userProfile?.pomodoroSettings || {};
        const dayStartTimeString = settings.startTime || '08:00';
        const longBreakMinutes = settings.longBreakDuration || 30;
        const dayEndTime = new Date();
        dayEndTime.setHours(23, 59, 59, 0); // Ende des Tages

        let currentTime = this._parseTimeToMillis(dayStartTimeString);
        let workBlockCounter = 0;
        const schedule = [];

        while (currentTime < dayEndTime.getTime()) {
            workBlockCounter++;

            // 1. Arbeitsblock erstellen
            const workBlockStart = currentTime;
            const workBlockEnd = workBlockStart + workIntervalMinutes * 60000;
            schedule.push({ type: 'work', startTime: workBlockStart, endTime: workBlockEnd });
            currentTime = workBlockEnd;

            // 2. Pausenblock erstellen
            const isLongBreak = workBlockCounter % 4 === 0;
            const breakDuration = isLongBreak ? longBreakMinutes : shortBreakMinutes;
            
            if (breakDuration > 0) {
                const breakStart = currentTime;
                const breakEnd = breakStart + breakDuration * 60000;

                // Sicherstellen, dass die Pause nicht über das Tagesende hinausgeht
                if (breakEnd > dayEndTime.getTime()) break;

                schedule.push({ type: isLongBreak ? 'long_break' : 'short_break', startTime: breakStart, endTime: breakEnd });
                currentTime = breakEnd;
            }
        }

        // Speichere den generierten Zeitplan im GanttManager und rendere neu
        this.ganttManager.pomodoroSchedule = schedule;
        this.ganttManager.render(this.ganttManager.localQuests);
        this.ganttManager.showNotification("Pomodoro-Tagesplan wurde erstellt.", "success");
    }

    _parseTimeToMillis(timeString) {
        if (!timeString) return 0;
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date.getTime();
    }
}