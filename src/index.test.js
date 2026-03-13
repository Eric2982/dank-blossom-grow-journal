import { describe, it, expect } from 'vitest';
import worker from './index.js';

const TARGET_DOMAIN = 'dankblossominc.com';

describe('Cloudflare redirect worker', () => {
  it('redirects to https://dankblossominc.com', async () => {
    const request = new Request('https://workers.dev/some-path');
    const response = await worker.fetch(request);
    expect(response.status).toBe(301);
    const location = response.headers.get('Location');
    expect(location).toMatch(/^https:\/\/dankblossominc\.com/);
  });

  it('preserves the pathname in the redirect', async () => {
    const request = new Request('https://workers.dev/about');
    const response = await worker.fetch(request);
    const location = response.headers.get('Location');
    expect(location).toBe(`https://${TARGET_DOMAIN}/about`);
  });

  it('does not redirect to example.com', async () => {
    const request = new Request('https://workers.dev/');
    const response = await worker.fetch(request);
    const location = response.headers.get('Location');
    expect(location).not.toContain('example.com');
  });

  it('uses a 301 permanent redirect', async () => {
    const request = new Request('https://workers.dev/');
    const response = await worker.fetch(request);
    expect(response.status).toBe(301);
  });
});
