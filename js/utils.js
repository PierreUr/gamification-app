/**
 * Formats a duration from seconds into a string like "HH:MM:SS" or "Xh Ym".
 * @param {number} totalSeconds - The total duration in seconds.
 * @param {boolean} [shortFormat=false] - If true, returns "Xh Ym" format.
 * @param {boolean} [multiLine=false] - If true, returns HTML for a two-line display (minutes and seconds).
 * @returns {string} The formatted duration string.
 */
export function formatDuration(totalSeconds, shortFormat = false, multiLine = false) {
    if (isNaN(totalSeconds) || totalSeconds < 0) totalSeconds = 0;

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (shortFormat) {
        let result = '';
        if (hours > 0) result += `${hours}h `;
        if (minutes > 0) result += `${minutes}m`;
        return result.trim() || '0m';
    }

    if (multiLine) {
        const totalMinutes = Math.floor(totalSeconds / 60);
        const remainingSeconds = totalSeconds % 60;
        return `
            <span class="block text-5xl font-mono text-shadow -mb-2">${String(totalMinutes).padStart(2, '0')}</span>
            <span class="block text-lg font-mono text-gray-400">${String(remainingSeconds).padStart(2, '0')}s</span>
        `;
    }

    // Default format (MM:SS)
    const totalMinutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${String(totalMinutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}