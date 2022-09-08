import { RemixI18Next } from "remix-i18next";
import { resolve } from "node:path";
import Backend from "i18next-fs-backend";
import { localeCookie } from "~/cookies";

// You will need to provide a backend to load your translations, here we use the
// file system one and tell it where to find the translations.

export let i18n = new RemixI18Next({
  detection: {
    supportedLanguages: ["he", "en"], // here configure your supported languages
    fallbackLanguage: "he",
    cookie: localeCookie,
    order: ["cookie", "header"],
  },

  i18next: {
    backend: { loadPath: resolve("./public/locales/{{lng}}/{{ns}}.json") },
  },
  // The backend you want to use to load the translations
  // Tip: You could pass `resources` to the `i18next` configuration and avoid
  // a backend here
  backend: Backend,
});
