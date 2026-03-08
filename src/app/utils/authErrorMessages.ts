const getErrorText = (error: unknown) => (error instanceof Error ? error.message : "").trim();

export const getOtpVerificationErrorMessage = (error: unknown) => {
  const message = getErrorText(error).toLowerCase();

  if (!message) return "Unable to verify the code right now. Please try again.";
  if (message.includes("invalid or expired otp")) return "That code is invalid or has expired. Request a new code and try again.";
  if (message.includes("no account found")) return "This verification session is no longer valid. Start the sign-in process again.";
  if (message.includes("request failed with status 404")) return "This verification session is no longer valid. Start the sign-in process again.";
  if (message.includes("request failed with status 403")) return "Your verification request expired. Refresh the page and try again.";

  return "Unable to verify the code right now. Please try again.";
};

export const getOtpResendErrorMessage = (error: unknown) => {
  const message = getErrorText(error).toLowerCase();

  if (!message) return "Unable to resend the code right now. Please try again.";
  if (message.includes("please wait before requesting a new otp")) return "Please wait a moment before requesting another code.";
  if (message.includes("no account found")) return "This verification session is no longer valid. Start the sign-in process again.";
  if (message.includes("request failed with status 404")) return "This verification session is no longer valid. Start the sign-in process again.";

  return "Unable to resend the code right now. Please try again.";
};
