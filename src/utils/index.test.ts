import { describe, it, expect } from 'vitest';
import { createPageUrl, extractHostnames } from './index';

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

describe('extractHostnames', () => {
  it('should extract hostnames from https URLs', () => {
    expect(extractHostnames(['https://google.com'])).toEqual(['google.com']);
  });

  it('should extract hostnames from http URLs', () => {
    expect(extractHostnames(['http://google.com'])).toEqual(['google.com']);
  });

  it('should handle multiple URLs', () => {
    const urls = ['https://google.com', 'http://google.com', 'https://domain.org'];
    expect(extractHostnames(urls)).toEqual(['google.com', 'google.com', 'domain.org']);
  });

  it('should prepend http:// when protocol is missing', () => {
    expect(extractHostnames(['google.com'])).toEqual(['google.com']);
  });

  it('should return null for invalid URLs', () => {
    expect(extractHostnames([':::invalid:::'])).toEqual([null]);
  });

  it('should return an empty array for an empty input', () => {
    expect(extractHostnames([])).toEqual([]);
  });
});
