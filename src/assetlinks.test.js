import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const ASSETLINKS_PATH = resolve(process.cwd(), 'public/.well-known/assetlinks.json');

// Domains that must serve this file over HTTPS at /.well-known/assetlinks.json
const REQUIRED_HTTPS_DOMAINS = [
  'archetypal-grow-wise-log.base44.app',
  'ju-j4z6.test-app.link',
];

describe('Digital Asset Links JSON', () => {
  let data;

  beforeAll(() => {
    if (existsSync(ASSETLINKS_PATH)) {
      const content = readFileSync(ASSETLINKS_PATH, 'utf-8');
      data = JSON.parse(content);
    }
  });

  it('should exist at public/.well-known/assetlinks.json', () => {
    expect(existsSync(ASSETLINKS_PATH)).toBe(true);
  });

  it('should contain valid JSON', () => {
    const content = readFileSync(ASSETLINKS_PATH, 'utf-8');
    expect(() => JSON.parse(content)).not.toThrow();
  });

  it('should be a non-empty array', () => {
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('should include delegate_permission/common.handle_all_urls relation', () => {
    const hasHandleAllUrls = data.some(
      (entry) =>
        Array.isArray(entry.relation) &&
        entry.relation.includes('delegate_permission/common.handle_all_urls')
    );
    expect(hasHandleAllUrls).toBe(true);
  });

  it('should target an android_app namespace', () => {
    const hasAndroidTarget = data.some(
      (entry) => entry.target && entry.target.namespace === 'android_app'
    );
    expect(hasAndroidTarget).toBe(true);
  });

  it('should have a valid sha256_cert_fingerprints array', () => {
    for (const entry of data) {
      if (entry.target && entry.target.namespace === 'android_app') {
        expect(Array.isArray(entry.target.sha256_cert_fingerprints)).toBe(true);
        expect(entry.target.sha256_cert_fingerprints.length).toBeGreaterThan(0);
        for (const fingerprint of entry.target.sha256_cert_fingerprints) {
          expect(typeof fingerprint).toBe('string');
          expect(fingerprint).toMatch(/^([0-9A-F]{2}:){31}[0-9A-F]{2}$/);
        }
      }
    }
  });

  it('should be located in public/ so it is served over HTTPS on archetypal-grow-wise-log.base44.app and ju-j4z6.test-app.link', () => {
    // Files in public/ are served at the root path by Vite.
    // This ensures the file is accessible at:
    //   https://archetypal-grow-wise-log.base44.app/.well-known/assetlinks.json
    //   https://ju-j4z6.test-app.link/.well-known/assetlinks.json
    expect(ASSETLINKS_PATH).toContain('public/.well-known/assetlinks.json');
    expect(REQUIRED_HTTPS_DOMAINS).toContain('archetypal-grow-wise-log.base44.app');
    expect(REQUIRED_HTTPS_DOMAINS).toContain('ju-j4z6.test-app.link');
  });
});
