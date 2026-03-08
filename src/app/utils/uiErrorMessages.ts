const toText = (value: unknown) => String(value || "").trim();

const hasAny = (message: string, patterns: string[]) => patterns.some((pattern) => message.includes(pattern));

export const sanitizeApiErrorMessage = ({
  message,
  status,
  path,
}: {
  message?: string;
  status: number;
  path?: string;
}) => {
  const normalizedMessage = toText(message).toLowerCase();
  const normalizedPath = toText(path).toLowerCase();

  if (hasAny(normalizedMessage, ["csrf token missing", "csrf token invalid"])) {
    return "Your session expired. Refresh the page and try again.";
  }

  if (hasAny(normalizedMessage, ["invalid or expired otp"])) {
    return "That code is invalid or has expired. Request a new code and try again.";
  }

  if (hasAny(normalizedMessage, ["incorrect email or password"])) {
    return "Incorrect email or password.";
  }

  if (hasAny(normalizedMessage, ["account temporarily locked", "account locked after multiple failed attempts"])) {
    return "Too many sign-in attempts. Please wait and try again.";
  }

  if (hasAny(normalizedMessage, ["user already exists", "already exists with this email"])) {
    return "An account with that email already exists.";
  }

  if (hasAny(normalizedMessage, ["please verify your email before logging in"])) {
    return "Please verify your email before signing in.";
  }

  if (hasAny(normalizedMessage, ["please wait before requesting a new otp"])) {
    return "Please wait a moment before requesting another code.";
  }

  if (status === 400) {
    return "Please review your input and try again.";
  }

  if (status === 401) {
    return "Authentication failed. Please sign in again.";
  }

  if (status === 403) {
    return normalizedPath.includes("/auth/")
      ? "This request is no longer valid. Refresh the page and try again."
      : "You are not allowed to perform this action.";
  }

  if (status === 404) {
    return normalizedPath.includes("/auth/")
      ? "This request is no longer valid. Start the process again."
      : "The requested resource could not be found.";
  }

  if (status === 409) {
    return "This action could not be completed because the data has changed.";
  }

  if (status === 429) {
    return "Too many attempts. Please wait and try again.";
  }

  if (status >= 500) {
    return "Something went wrong on our side. Please try again shortly.";
  }

  return "Something went wrong. Please try again.";
};

export const getNetworkErrorMessage = (error: unknown) => {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "The request took too long. Please try again.";
  }

  const message = toText(error instanceof Error ? error.message : "");
  if (!message) return "Unable to reach the server right now. Please try again.";

  const normalizedMessage = message.toLowerCase();
  if (normalizedMessage.includes("failed to fetch") || normalizedMessage.includes("network request failed")) {
    return "Unable to reach the server right now. Please try again.";
  }

  return message;
};

export const getDisplayErrorMessage = (error: unknown, fallback: string) => {
  const normalizedFallback = toText(fallback) || "Something went wrong. Please try again.";
  const message = toText(error instanceof Error ? error.message : "");

  if (!message) return normalizedFallback;
  if (message === "Something went wrong. Please try again.") return normalizedFallback;
  return message;
};
