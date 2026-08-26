const fallbackBaseUrl = "https://amani-design-backend.onrender.com";

export const BASE_URL = import.meta.env.VITE_BASE_URL?.replace(/\/$/, "") || fallbackBaseUrl;
