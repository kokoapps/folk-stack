import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import * as React from "react";
import { RemixBrowser, useLocation, useMatches } from "@remix-run/react";
import { hydrateRoot } from "react-dom/client";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { getInitialNamespaces } from "remix-i18next";
import * as Sentry from "@sentry/remix";
declare global {
  interface Window {
    ENVS: Record<string, string | undefined>;
  }
}

Sentry.init({
  dsn: window.ENVS?.SENTRY_DSN,
  environment: window.ENVS?.SENTRY_ENVIRONMENT,
  tracesSampleRate: 1,
  integrations: [
    new Sentry.BrowserTracing({
      routingInstrumentation: Sentry.remixRouterInstrumentation(
        React.useEffect,
        useLocation,
        useMatches
      ),
    }),
  ],
});
function hydrate() {
  React.startTransition(() => {
    i18next
      .use(initReactI18next) // Tell i18next to use the react-i18next plugin
      .use(LanguageDetector) // Setup a client-side language detector
      .use(Backend) // Setup your backend
      .init({
        // This is normal i18next config, except a few things
        supportedLngs: ["he", "en"],
        defaultNS: "common",
        fallbackLng: "he",
        // Disabling suspense is recommended
        react: { useSuspense: false },
        // This function detects the namespaces your routes rendered while SSR use
        // and pass them here to load the translations
        ns: getInitialNamespaces(),
        backend: { loadPath: "/locales/{{lng}}/{{ns}}.json" },
        detection: {
          // Here only enable htmlTag detection, we'll detect the language only
          // server-side with remix-i18next, by using the `<html lang>` attribute
          // we can communicate to the client the language detected server-side
          order: ["htmlTag"],
          // Because we only use htmlTag, there's no reason to cache the language
          // on the browser, so we disable it
          caches: [],
        },
      })
      .then(() => {
        // After i18next has been initialized, we can hydrate the app
        // We need to wait to ensure translations are loaded before the hydration
        // Here wrap RemixBrowser in I18nextProvider from react-i18next

        hydrateRoot(
          document,
          <React.StrictMode>
            <I18nextProvider i18n={i18next}>
              <RemixBrowser />
            </I18nextProvider>
          </React.StrictMode>
        );
      });
  });
}

if (window.requestIdleCallback) {
  window.requestIdleCallback(hydrate);
} else {
  window.setTimeout(hydrate, 1);
}
