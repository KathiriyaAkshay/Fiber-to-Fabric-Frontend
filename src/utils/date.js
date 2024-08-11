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

export function disabledPastDate(current){
    return current <= moment().endOf("day") ; 
}

export function currentMonthStartDateEndDate() {
    const currentDate = new Date();

    // Get the current year and month
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // Note: January is 0, December is 11

    // Start date is the first day of the current month
    const startDate = new Date(year, month, 1);
    // End date is the last day of the current month
    const endDate = new Date(year, month + 1, 0); // The `0` will give the last day of the previous month

    return [startDate, endDate]; 
}

export function getCurrentFinancialYearDates() {
    let today = new Date();
    let currentYear = today.getFullYear();
    let startFinanceYear, endFinanceYear;

    // Financial year starts from April 1st
    if (today.getMonth() + 1 >= 4) { // getMonth() is zero-based, adding 1 to make it 1-based
        startFinanceYear = new Date(currentYear, 3, 1); // April 1 of current year
    } else {
        startFinanceYear = new Date(currentYear - 1, 3, 1); // April 1 of the previous year
    }

    let currentDate = today;

    return {
        startFinanceYear: startFinanceYear,
        currentDate: currentDate
    };
}
