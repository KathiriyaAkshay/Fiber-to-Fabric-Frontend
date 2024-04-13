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
