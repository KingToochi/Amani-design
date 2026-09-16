const fallbackBaseUrl = "https://backend.amanisky.tech";

export const BASE_URL = import.meta.env.VITE_BASE_URL?.replace(/\/$/, "") || fallbackBaseUrl;
