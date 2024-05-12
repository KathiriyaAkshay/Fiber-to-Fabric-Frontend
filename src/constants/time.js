import dayjs from "dayjs";

export const DATE_FORMAT = "DD/MM/YYYY";

export function formatDate(date) {
  return dayjs(date).format(DATE_FORMAT);
}
