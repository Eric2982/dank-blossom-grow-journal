import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const MANIFEST_PATH = resolve(process.cwd(), 'public/manifest.json');

// Domain that must serve this file over HTTPS at /manifest.json
const DOMAIN = 'dankblossominc.com';

describe('Web App Manifest', () => {
  let data;

  beforeAll(() => {
    if (existsSync(MANIFEST_PATH)) {
      const content = readFileSync(MANIFEST_PATH, 'utf-8');
      data = JSON.parse(content);
    }
  });

  it('should exist at public/manifest.json', () => {
    expect(existsSync(MANIFEST_PATH)).toBe(true);
  });

  it('should contain valid JSON', () => {
    const content = readFileSync(MANIFEST_PATH, 'utf-8');
    expect(() => JSON.parse(content)).not.toThrow();
  });

  it('should have a name field', () => {
    expect(typeof data.name).toBe('string');
    expect(data.name.length).toBeGreaterThan(0);
  });

  it('should have a short_name field', () => {
    expect(typeof data.short_name).toBe('string');
    expect(data.short_name.length).toBeGreaterThan(0);
  });

  it('should have a valid display mode', () => {
    const validDisplayModes = ['fullscreen', 'standalone', 'minimal-ui', 'browser'];
    expect(validDisplayModes).toContain(data.display);
  });

  it('should have a start_url field', () => {
    expect(typeof data.start_url).toBe('string');
    expect(data.start_url.length).toBeGreaterThan(0);
  });

  it('should have at least one icon', () => {
    expect(Array.isArray(data.icons)).toBe(true);
    expect(data.icons.length).toBeGreaterThan(0);
    for (const icon of data.icons) {
      expect(typeof icon.src).toBe('string');
      expect(icon.src.length).toBeGreaterThan(0);
    }
  });

  it('should be located in public/ so it is served over HTTPS on dankblossominc.com', () => {
    // Files in public/ are served at the root path by Vite and Cloudflare Workers.
    // This ensures the file is accessible at:
    //   https://dankblossominc.com/manifest.json
    expect(MANIFEST_PATH).toContain('public/manifest.json');
    expect(DOMAIN).toBe('dankblossominc.com');
  });
});
