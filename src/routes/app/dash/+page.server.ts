import { getDailyRev } from "$lib/db/getRev";

export function load() {
    const rev = getDailyRev();

    

    return {rev}
} 