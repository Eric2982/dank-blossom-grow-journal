export default {
  async fetch(request, env, ctx) {
    if (!env.ASSETS) {
      return new Response('Assets binding not configured', { status: 500 });
    }
    return env.ASSETS.fetch(request);
  }
};
