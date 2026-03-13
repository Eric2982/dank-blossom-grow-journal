import { describe, it, expect, vi, afterEach } from 'vitest';
import worker from './index.js';

const TARGET_DOMAIN = 'dankblossominc.com';
const BASE44_BACKEND = 'https://my-to-do-list-81bfaad7.base44.app';

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

describe('Cloudflare worker API proxy', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('proxies /api/* requests to the Base44 backend instead of redirecting', async () => {
    const mockResponse = new Response(JSON.stringify({ ok: true }), { status: 200 });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    const request = new Request('https://workers.dev/api/apps/public/prod/settings');
    const response = await worker.fetch(request);

    expect(response.status).toBe(200);
    expect(response.status).not.toBe(301);
  });

  it('forwards /api/* requests to the correct Base44 backend URL', async () => {
    const mockFetch = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', mockFetch);

    const request = new Request('https://workers.dev/api/apps/public/prod/settings');
    await worker.fetch(request);

    const calledUrl = mockFetch.mock.calls[0][0].url;
    expect(calledUrl).toBe(`${BASE44_BACKEND}/api/apps/public/prod/settings`);
  });

  it('uses BASE44_APP_BASE_URL env variable when provided', async () => {
    const customBackend = 'https://custom-backend.example.com';
    const mockFetch = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', mockFetch);

    const request = new Request('https://workers.dev/api/some/endpoint');
    await worker.fetch(request, { BASE44_APP_BASE_URL: customBackend });

    const calledUrl = mockFetch.mock.calls[0][0].url;
    expect(calledUrl).toBe(`${customBackend}/api/some/endpoint`);
  });

  it('preserves query string when proxying /api/* requests', async () => {
    const mockFetch = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', mockFetch);

    const request = new Request('https://workers.dev/api/data?filter=active&page=2');
    await worker.fetch(request);

    const calledUrl = mockFetch.mock.calls[0][0].url;
    expect(calledUrl).toBe(`${BASE44_BACKEND}/api/data?filter=active&page=2`);
  });

  it('does not proxy non-/api/ paths', async () => {
    const request = new Request('https://workers.dev/dashboard');
    const response = await worker.fetch(request);
    expect(response.status).toBe(301);
  });
});
