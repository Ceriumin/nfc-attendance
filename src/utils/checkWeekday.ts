export function checkWeekday(day: number) {
    // Indexed by Date.getDay(): 0 = Sunday, 1 = Monday, ... 6 = Saturday
    const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

    return days[day] ?? "";
}
