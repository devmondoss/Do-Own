/* Frontend demo only. TODO(BACKEND): review cache rules before authenticated data.
 * Never cache /api, third-party requests, RSC payloads or financial information.
 * Bump VERSION on asset/layout releases; old caches are deleted on activation.
 */
const VERSION = "do-own-v9";
const STATIC = `${VERSION}-static`;
const PAGES = `${VERSION}-pages`;
const PRELOAD = [
  "/offline.html",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/images/ana.jpg",
  "/images/learning.jpg",
];
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC).then((cache) => cache.addAll(PRELOAD)));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key.startsWith("do-own-") && ![STATIC, PAGES].includes(key),
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/") ||
    request.headers.get("RSC") ||
    url.searchParams.has("_rsc")
  )
    return;
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (
            response.ok &&
            response.headers.get("content-type")?.includes("text/html")
          ) {
            const copy = response.clone();
            event.waitUntil(
              caches.open(PAGES).then((cache) => cache.put(request, copy)),
            );
          }
          return response;
        })
        .catch(
          async () =>
            (await caches.match(request)) ||
            (await caches.match("/offline.html")),
        ),
    );
    return;
  }
  if (
    url.pathname.startsWith("/_next/static/") ||
    PRELOAD.includes(url.pathname)
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              event.waitUntil(
                caches.open(STATIC).then((cache) => cache.put(request, copy)),
              );
            }
            return response;
          }),
      ),
    );
  }
});
