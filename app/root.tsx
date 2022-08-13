import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";

import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";

import tailwindStylesheetUrl from "./styles/tailwind.css";
import { getUser } from "./session.server";
import { i18n } from "./i18n.server";
import { useChangeLanguage } from "remix-i18next";

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

export const loader: LoaderFunction = async ({ request }) => {
  let locale = await i18n.getLocale(request);

  return json({
    user: await getUser(request),

    locale,
  });
};

export default function App() {
  let { locale } = useLoaderData<typeof loader>();
  useChangeLanguage(locale);
  // const consentFetcher = useFetcher();

  let dir = locale === "he" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <Outlet />

        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
