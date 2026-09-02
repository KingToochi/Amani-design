export const getCookieOptions = (req, options = {}) => {
  const origin = (req.headers.origin || "").toLowerCase();
  const isLocalOrigin = origin.includes("localhost") || origin.includes("127.0.0.1") || req.hostname === "localhost" || req.hostname === "127.0.0.1";
  // Only set the Secure flag in production for non-local origins.
  // const secure = isProduction && !isLocalOrigin;
  // console.log("Cookie options - Secure:", secure, "Origin:", origin, "Hostname:", req.hostname);                  
  // const sameSite = secure ? "none" : "lax";
  const secure = true
  const sameSite = "none"


  return {
    httpOnly: true,
    secure,
    sameSite,
    ...options,
  };
};