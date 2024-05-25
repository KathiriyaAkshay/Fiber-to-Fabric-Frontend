import dayjs from "dayjs";

export const disableBeforeDate = (current) => {
    let customDate = dayjs().format("YYYY-MM-DD");
    return (
        current && current < dayjs(customDate, "YYYY-MM-DD")
    );
}