export const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://amanisky-fashion.vercel.app",
  "https://fashion.amanisky.tech",
  "https://www.fashion.amanisky.tech",
  process.env.FRONTEND_URL,
  ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean) : []),
].filter(Boolean);