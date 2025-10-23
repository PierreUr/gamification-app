/**
 * Pomodoro Grid Generator
 *
 * This class is responsible for creating a grid of break objects
 * based on a set of rules for a Pomodoro-style schedule.
 * It does not interact with the DOM or render anything. Its sole purpose
 * is to generate the data structure for the breaks.
 */
export class PomodoroGridGenerator {
    /**
     * The constructor is currently empty as the class is stateless.
     * All necessary data is passed into the generateGrid method.
     */
    constructor() {}

    /**
     * Generates an array of break objects for a full day based on Pomodoro settings.
     * @param {object} settings - The configuration for the grid generation.
     * @param {string} settings.startTime - The start time for the schedule, e.g., "09:00".
     * @param {number} settings.workInterval - The duration of a single work block in minutes.
     * @param {number} settings.shortBreak - The duration of a short break in minutes.
     * @param {number} settings.longBreak - The duration of a long break in minutes.
     * @param {number} settings.longBreakInterval - The number of work blocks before a long break occurs (e.g., 4).
     * @returns {Array<object>} An array of break objects, e.g., [{ startTime: <timestamp>, endTime: <timestamp>, type: 'short' | 'long' }]
     */
    generateGrid(settings) {
        // Provide default values to prevent errors
        const {
            startTime = '09:00',
            workInterval = 45,
            shortBreak = 5,
            longBreak = 30,
            longBreakInterval = 4
        } = settings || {};

        const breaks = [];
        let workBlockCounter = 0;

        // Set the end of the day to 23:59:59
        const dayEndTime = new Date();
        dayEndTime.setHours(23, 59, 59, 0);

        // Initialize currentTime based on the startTime string
        let currentTime = this._parseTimeToMillis(startTime);

        // Loop as long as the *start* of the next work block is within the day
        while (currentTime + workInterval * 60000 < dayEndTime.getTime()) {
            // 1. Advance time by one work interval
            currentTime += workInterval * 60000;
            workBlockCounter++;
            
            const isLongBreak = workBlockCounter % longBreakInterval === 0;
            const breakDuration = isLongBreak ? longBreak : shortBreak;

            if (breakDuration > 0) {
                const breakStartTime = currentTime;
                const breakEndTime = breakStartTime + breakDuration * 60000;
                
                // Final check to ensure the break itself doesn't end past the day's end
                if (breakEndTime > dayEndTime.getTime()) {
                    break;
                }
                
                breaks.push({ startTime: breakStartTime, endTime: breakEndTime, type: isLongBreak ? 'long' : 'short' });
                currentTime = breakEndTime; // The new "current time" is after the break, ready for the next work interval.
            }
        }
        return breaks;
    }

    _parseTimeToMillis(timeString) {
        if (!timeString) return new Date().setHours(9, 0, 0, 0); // Default to 9 AM
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date.getTime();
    }
}