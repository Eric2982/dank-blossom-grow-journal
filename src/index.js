// Cloudflare Module Worker
export default {
  async fetch(request, env, ctx) {
    const now = performance.now();
    return new Response(`Hello, World! (handled in ${performance.now() - now}ms)`);
  },
};
