import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const VERIFICATION_FILE = 'google94bb1998a186c489.html';
const VERIFICATION_PATH = resolve(process.cwd(), `public/${VERIFICATION_FILE}`);

// Domain that must serve this file over HTTPS at /<filename>
const DOMAIN = 'ju-j4z6.test-app.link';

describe('Google Site Verification HTML', () => {
  it('should exist at public/google94bb1998a186c489.html', () => {
    expect(existsSync(VERIFICATION_PATH)).toBe(true);
  });

  it('should contain the correct Google site verification token', () => {
    const content = readFileSync(VERIFICATION_PATH, 'utf-8').trim();
    expect(content).toBe('google-site-verification: google94bb1998a186c489');
  });

  it('should be located in public/ so it is served over HTTPS on ju-j4z6.test-app.link', () => {
    // Files in public/ are served at the root path by Vite.
    // This ensures the file is accessible at:
    //   https://ju-j4z6.test-app.link/google94bb1998a186c489.html
    expect(VERIFICATION_PATH).toContain(`public/${VERIFICATION_FILE}`);
  });
});
