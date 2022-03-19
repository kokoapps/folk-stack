import {
  json,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "remix";
import type { LinksFunction, MetaFunction, LoaderFunction } from "remix";

import tailwindStylesheetUrl from "./styles/tailwind.css";
import { getUser } from "./session.server";
import { i18n } from "./i18n.server";
import { Language, useSetupTranslations } from "remix-i18next";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Remix Notes",
  viewport: "width=device-width,initial-scale=1",
});

type LoaderData = {
  user: Awaited<ReturnType<typeof getUser>>;
  locale: string;
  i18n: Record<string, Language>;
};

export const loader: LoaderFunction = async ({ request }) => {
  let locale = await i18n.getLocale(request);

  return json<LoaderData>({
    user: await getUser(request),
    locale,
    i18n: await i18n.getTranslations(request, "common"),
  });
};

export default function App() {
  let { locale } = useLoaderData<{ locale: string }>();
  useSetupTranslations(locale);

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
