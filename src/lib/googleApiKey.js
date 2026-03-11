/**
 * googleApiKey.js
 *
 * Exports the Google API key from the VITE_GOOGLE_API_KEY environment variable.
 *
 * To configure, set VITE_GOOGLE_API_KEY in your .env.local file:
 *   VITE_GOOGLE_API_KEY=your_key_here
 *
 * Usage:
 *   import { googleApiKey } from '@/lib/googleApiKey';
 *   // e.g. fetch(`https://maps.googleapis.com/...?key=${googleApiKey}`)
 */

export const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY ?? null;

if (import.meta.env.DEV && !googleApiKey) {
  console.warn(
    '[googleApiKey] VITE_GOOGLE_API_KEY is not set. ' +
    'Add it to your .env.local file to enable Google services.'
  );
}
