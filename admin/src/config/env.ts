/// <reference types="vite/client" />

export const env = {
  API_URL: import.meta.env.VITE_API_URL as string,
  APP_ENV: import.meta.env.MODE,
} as const;
