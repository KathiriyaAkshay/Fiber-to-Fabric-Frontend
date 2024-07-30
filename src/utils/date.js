import dayjs from "dayjs";
import moment from "moment";

export const disableBeforeDate = (current) => {
    let customDate = dayjs().format("YYYY-MM-DD");
    return (
        current && current < dayjs(customDate, "YYYY-MM-DD")
    );
}

export function disabledFutureDate(current) {
    // Disable dates after today
    return current && current > moment().endOf("day");
}

