const DEFAULT_BASE44_URL = "https://my-to-do-list-81bfaad7.base44.app";

export default {
  fetch(request, env) {
    const url = new URL(request.url);

    // Proxy /api/* requests to the Base44 backend
    if (url.pathname.startsWith("/api/")) {
      const backendBase =
        (env && env.BASE44_APP_BASE_URL) || DEFAULT_BASE44_URL;
      const proxyUrl = new URL(url.pathname + url.search + url.hash, backendBase);
      return fetch(new Request(proxyUrl.toString(), request));
    }

    const base = "https://dankblossominc.com";

    // If already on the canonical domain, serve the SPA assets directly
    if (url.hostname === "dankblossominc.com") {
      return env.ASSETS.fetch(request);
    }

    const statusCode = 301;
    const destination = new URL(url.pathname, base);
    return Response.redirect(destination.toString(), statusCode);
  },
};
