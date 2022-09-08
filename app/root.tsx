import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { withSentry } from "@sentry/remix";

import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { ToastContainer } from "react-toastify";
import toastifyStyles from "react-toastify/dist/ReactToastify.css";

import tailwindStylesheetUrl from "./styles/tailwind.css";
import { getUser } from "./lib/session.server";
import { i18n } from "./lib/i18n.server";
import { useChangeLanguage } from "remix-i18next";
import { getRequiredServerEnvVar } from "./lib/env.server";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: tailwindStylesheetUrl },
    { rel: "stylesheet", href: toastifyStyles },
  ];
};

export let handle = {
  i18n: ["common"],
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Remix",
  viewport: "width=device-width,initial-scale=1",
});

export const loader: LoaderFunction = async ({ request }) => {
  let locale = await i18n.getLocale(request);
  let ENVS = JSON.stringify({
    SENTRY_DSN: getRequiredServerEnvVar("SENTRY_DSN"),
    SENTRY_ENVIRONMENT: getRequiredServerEnvVar(
      "SENTRY_ENVIRONMENT",
      "development"
    ),
  });
  return json({
    user: await getUser(request),
    ENVS,
    locale,
  });
};

function App() {
  let { locale } = useLoaderData<typeof loader>();
  useChangeLanguage(locale);
  // const consentFetcher = useFetcher();

  let dir = locale === "he" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className="h-full bg-white">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <Outlet />

        <ScrollRestoration />
        <ToastContainer />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default withSentry(App);
