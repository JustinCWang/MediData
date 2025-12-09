/**
 * config.ts - Frontend configuration values
 *
 * Exposes environment-driven constants (e.g., API base URL) used across the app.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://medidata-backend.vercel.app'
