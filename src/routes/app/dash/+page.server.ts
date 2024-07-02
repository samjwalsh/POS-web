import { getDailyRev } from "$lib/db/getRev";

export function load() {
    // console.log(DB_ADDRESS)
    const rev = getDailyRev();

    

    return {rev}
} 