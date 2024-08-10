export function mutationOnErrorHandler({ error, message }) {
  const errorMessage = error?.response?.data?.message || error.message;
  if (errorMessage && typeof errorMessage === "string") {
    message.error(errorMessage);
  } else if (typeof errorMessage === "object") {
    const err = errorMessage?.details?.[0]?.message;
    if (err && typeof err === "string") {
      message.error(err);
    }
  }
}


export function capitalizeFirstCharacter(str) {
  if (typeof str !== 'string' || str.length === 0) {
    throw new Error("Input must be a non-empty string");
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function calculateTimeDifference(futureDate) {
  const currentDate = new Date();
  const targetDate = new Date(futureDate);

  // Calculate the difference in milliseconds
  const differenceInMilliseconds = currentDate - targetDate;

  // Calculate difference in days, hours, and minutes
  const days = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));
  const hours = Math.floor((differenceInMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((differenceInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes };
}