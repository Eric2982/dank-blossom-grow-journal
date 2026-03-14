import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  decodeJwtPayload,
  hasExpectedAudience,
  isTokenExpired,
  verifyCloudRunToken,
} from './cloudRunAuth.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Builds a compact JWT string with an arbitrary payload.
 * The header and signature are dummy values — only the payload matters for
 * the unit tests in this file.
 */
function buildToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.fakesignature`;
}

/** Returns a Unix timestamp (seconds) offset by `delta` seconds from now. */
function nowPlusSec(delta = 0) {
  return Math.floor(Date.now() / 1000) + delta;
}

// ---------------------------------------------------------------------------
// decodeJwtPayload
// ---------------------------------------------------------------------------

describe('decodeJwtPayload', () => {
  it('decodes a well-formed token and returns the payload object', () => {
    const payload = { sub: 'user123', aud: 'my-service', exp: nowPlusSec(3600) };
    const token = buildToken(payload);
    const decoded = decodeJwtPayload(token);
    expect(decoded.sub).toBe('user123');
    expect(decoded.aud).toBe('my-service');
  });

  it('throws on a token with fewer than three parts', () => {
    expect(() => decodeJwtPayload('only.two')).toThrow('Invalid JWT');
  });

  it('throws on a token with non-JSON base64 payload', () => {
    expect(() => decodeJwtPayload('header.!!!.sig')).toThrow();
  });

  it('handles URL-safe base64 characters (- and _)', () => {
    // Construct a payload that encodes to base64 containing - and _
    const payload = { data: 'this is fine' };
    const token = buildToken(payload);
    expect(() => decodeJwtPayload(token)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// hasExpectedAudience
// ---------------------------------------------------------------------------

describe('hasExpectedAudience', () => {
  it('returns true when aud is a string that matches exactly', () => {
    expect(hasExpectedAudience({ aud: 'https://my-service.example.com' }, 'https://my-service.example.com')).toBe(true);
  });

  it('returns false when aud is a string that does not match', () => {
    expect(hasExpectedAudience({ aud: 'other' }, 'https://my-service.example.com')).toBe(false);
  });

  it('returns true when aud is an array containing the expected audience', () => {
    expect(hasExpectedAudience({ aud: ['a', 'https://my-service.example.com'] }, 'https://my-service.example.com')).toBe(true);
  });

  it('returns false when aud is an array that does not contain the expected audience', () => {
    expect(hasExpectedAudience({ aud: ['a', 'b'] }, 'https://my-service.example.com')).toBe(false);
  });

  it('accepts an array of expected audiences and matches any one of them', () => {
    expect(hasExpectedAudience({ aud: 'service-b' }, ['service-a', 'service-b'])).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// isTokenExpired
// ---------------------------------------------------------------------------

describe('isTokenExpired', () => {
  it('returns false when exp is in the future', () => {
    expect(isTokenExpired({ exp: nowPlusSec(3600) }, nowPlusSec(0))).toBe(false);
  });

  it('returns true when exp is in the past', () => {
    expect(isTokenExpired({ exp: nowPlusSec(-1) }, nowPlusSec(0))).toBe(true);
  });

  it('returns true when exp equals the current second', () => {
    const now = nowPlusSec(0);
    expect(isTokenExpired({ exp: now }, now)).toBe(true);
  });

  it('returns false when exp is absent', () => {
    // Tokens without an exp claim are treated as non-expired (not our concern).
    expect(isTokenExpired({}, nowPlusSec(0))).toBe(false);
  });

  it('uses Date.now() when nowSec is not supplied', () => {
    // A token that expired 1 second ago should be flagged.
    expect(isTokenExpired({ exp: nowPlusSec(-1) })).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// verifyCloudRunToken — integration of the three primitives above
// ---------------------------------------------------------------------------

describe('verifyCloudRunToken', () => {
  const AUDIENCE = 'https://dankblossom.app';

  it('returns valid=true for a well-formed, non-expired token with the correct audience', () => {
    const token = buildToken({ aud: AUDIENCE, exp: nowPlusSec(3600), sub: 'svc' });
    const result = verifyCloudRunToken(token, AUDIENCE);
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
    expect(result.payload.sub).toBe('svc');
  });

  it('returns valid=false with an error when the token is expired', () => {
    const token = buildToken({ aud: AUDIENCE, exp: nowPlusSec(-10) });
    const result = verifyCloudRunToken(token, AUDIENCE);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/expired/i);
  });

  it('returns valid=false with an error when the audience does not match', () => {
    const token = buildToken({ aud: 'wrong-audience', exp: nowPlusSec(3600) });
    const result = verifyCloudRunToken(token, AUDIENCE);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/audience mismatch/i);
  });

  it('returns valid=false with an error for a malformed token', () => {
    const result = verifyCloudRunToken('not.a.valid.jwt.token.too.many.dots', AUDIENCE);
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('supports injectable nowSec for deterministic expiry tests', () => {
    const fixedNow = 1_000_000;
    const token = buildToken({ aud: AUDIENCE, exp: fixedNow + 60 });
    expect(verifyCloudRunToken(token, AUDIENCE, { nowSec: fixedNow }).valid).toBe(true);
    expect(verifyCloudRunToken(token, AUDIENCE, { nowSec: fixedNow + 61 }).valid).toBe(false);
  });

  it('accepts an array of expected audiences', () => {
    const token = buildToken({ aud: AUDIENCE, exp: nowPlusSec(3600) });
    const result = verifyCloudRunToken(token, ['other-service', AUDIENCE]);
    expect(result.valid).toBe(true);
  });
});
