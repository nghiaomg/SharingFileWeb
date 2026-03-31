/// <reference types="vite/client" />

export const env = {
  API_URL: 'https://sharingfile-be.nghiaomg.xyz',
  APP_ENV: import.meta.env.MODE,
} as const;
