import {
  json,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useFetcher,
  useLoaderData,
} from "remix";
import type { LinksFunction, MetaFunction, LoaderFunction } from "remix";
import { SpeakerphoneIcon, XIcon } from "@heroicons/react/outline";

import tailwindStylesheetUrl from "./styles/tailwind.css";
import { getUser } from "./session.server";
import { i18n } from "./i18n.server";
import { useChangeLanguage } from "remix-i18next";
import { gdprConsent, GDPRConsentState, GDPRProvider } from "./gdpr";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
};

export let handle = {
  i18n: ["common"],
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Remix Notes",
  viewport: "width=device-width,initial-scale=1",
});

type LoaderData = {
  user: Awaited<ReturnType<typeof getUser>>;
  locale: string;
  gdprConsent: GDPRConsentState;
};

export const loader: LoaderFunction = async ({ request }) => {
  let locale = await i18n.getLocale(request);

  return json<LoaderData>({
    user: await getUser(request),
    gdprConsent: await gdprConsent.getConsentState(request),
    locale,
  });
};

export default function App() {
  let { locale, gdprConsent } = useLoaderData() as LoaderData;
  useChangeLanguage(locale);
  const consentFetcher = useFetcher();

  let dir = locale === "he" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <GDPRProvider consent={gdprConsent}>
          <Outlet />
        </GDPRProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        {gdprConsent.consent !== "granted" && (
          <consentFetcher.Form
            className="fixed inset-x-0 bottom-0"
            method="post"
            action="/consent"
          >
            <div className="bg-indigo-600">
              <div className="mx-auto max-w-7xl py-3 px-3 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-center justify-between">
                  <div className="flex w-0 flex-1 items-center">
                    <span className="flex rounded-lg bg-indigo-800 p-2">
                      <SpeakerphoneIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </span>
                    <p className="ml-3 truncate font-medium text-white">
                      <span className="md:hidden">We use cookies</span>
                      <span className="hidden md:inline">
                        Please let us collect information to improve your
                        experience.
                      </span>
                    </p>
                  </div>
                  <div className="order-3 mt-2 w-full flex-shrink-0 sm:order-2 sm:mt-0 sm:w-auto">
                    <button className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-indigo-600 shadow-sm hover:bg-indigo-50">
                      Accept Cookies
                    </button>
                  </div>
                  <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
                    <button
                      type="button"
                      name="accept-consent"
                      value="true"
                      className="-mr-1 flex rounded-md p-2 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-white sm:-mr-2"
                    >
                      <span className="sr-only">Dismiss</span>
                      <XIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </consentFetcher.Form>
        )}
      </body>
    </html>
  );
}
