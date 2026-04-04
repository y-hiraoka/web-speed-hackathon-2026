import cookieSession from "cookie-session";

export const sessionMiddleware = cookieSession({
  name: "session",
  keys: ["secret"],
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
});
