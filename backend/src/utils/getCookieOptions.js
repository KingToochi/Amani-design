export const getCookieOptions = (req, options = {}) => {
  const origin = (req.headers.origin || "").toLowerCase();
  const isLocalOrigin = origin.includes("localhost") || origin.includes("127.0.0.1") || req.hostname === "localhost" || req.hostname === "127.0.0.1";

  const secure = !isLocalOrigin;
  const sameSite = secure ? "none" : "lax";

  return {
    httpOnly: true,
    secure,
    sameSite,
    ...options,
  };
};