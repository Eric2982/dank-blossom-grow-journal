import { describe, it, expect } from 'vitest';
import { createPageUrl } from './index';

describe('createPageUrl', () => {
  it('should prefix the page name with a slash', () => {
    expect(createPageUrl('Home')).toBe('/Home');
  });

  it('should replace spaces with hyphens', () => {
    expect(createPageUrl('My Plants')).toBe('/My-Plants');
  });

  it('should handle multiple spaces', () => {
    expect(createPageUrl('Grow Journal Entry')).toBe('/Grow-Journal-Entry');
  });

  it('should handle a page name with no spaces', () => {
    expect(createPageUrl('Dashboard')).toBe('/Dashboard');
  });

  it('should return just a slash for an empty string', () => {
    expect(createPageUrl('')).toBe('/');
  });
});
