import { getLast30Days } from "$lib/db/queries/getLast30Days";
import { getRev } from "$lib/db/queries/getRev";
import { getRollingRevenue } from "$lib/db/queries/getRollingRevenue";

export function load() {
    const todaysRev = getRev(new Date(new Date().setUTCHours(0, 0, 0, 0)), new Date(new Date().setUTCHours(23, 59, 59, 999)));
    const weeklyRev = getRev(getMonday(new Date()), new Date())
    const lastWeek = getRev(getMonday(getLastWeek(new Date())), getLastWeek(new Date()));
    const last30Days = getLast30Days();
    const rollingRevenue = getRollingRevenue();

    return { todaysRev, weeklyRev, lastWeek, last30Days, rollingRevenue }
}


function getMonday(d: Date) {
    d = new Date(d);
    const day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    return new Date(new Date(d.setDate(diff)).setUTCHours(0, 0, 0, 0));
}

function getLastWeek(d: Date) {
    d = new Date(d);
    const week = new Date(1000 * 60 * 60 * 24 * 7)
    return new Date(d.getTime() - week.getTime());
}