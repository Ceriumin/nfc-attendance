const GRACE_PERIOD_SECONDS = Number(process.env.GRACE_PERIOD ?? 0);

const timeToSeconds = (timeStr: string): number => {
    const [h, m, s] = timeStr.split(':');
    if (!h || !m || !s) {
        throw new Error(`Invalid time format: ${timeStr}`);
    }
    return Number(h) * 3600 + Number(m) * 60 + Number(s);
};

export default function isOnTime(
    startTime: string,
    tapTime: string,
): boolean {
    return timeToSeconds(tapTime) < timeToSeconds(startTime) + GRACE_PERIOD_SECONDS;
}