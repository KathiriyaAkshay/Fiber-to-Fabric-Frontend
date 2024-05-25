export const getFinancialYearEnd = (currentDate) => {
  const currentMonth = currentDate.month(); // month is 0-indexed, so January is 0 and December is 11
  const currentYear = currentDate.year();

  // Financial year starts in April and ends in March
  if (currentMonth >= 3) {
    // If the current month is April (3) or later
    return currentYear + 1; // The financial year end is the next year
  } else {
    return currentYear; // The financial year end is the current year
  }
};
