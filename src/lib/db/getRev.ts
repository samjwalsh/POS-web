import TodayOrder from "$lib/models/todaysorders/TodayOrder";
import Day from "$lib/models/daySheets/Day";

export const getDailyRev = async () => {

    let orders = await TodayOrder.find();

    const date = new Date().toISOString().split('T')[0]
    console.log(date)
    const daySheet = await Day.findOne({date})

    if (daySheet) {
        for (let shopIndex = 0; shopIndex++; shopIndex < daySheet.shops.length) {
            orders.push(...daySheet.shops[shopIndex].orders)
        }
    }

    // const EODSheet = await 
    // console.log(orders)

    return orders.length;
}