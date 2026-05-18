export function registerServiceWorker() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        // eslint-disable-next-line no-console
        console.log("[PWA] Service Worker registrado:", registration.scope);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error("[PWA] Falha ao registrar Service Worker:", error);
      });
  });
}
