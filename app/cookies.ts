import { createCookie } from "remix";

export let gdprConsentCookie = createCookie("gdpr-consent", {
  maxAge: 31536000, // 1 year
  path: "/",
  sameSite: "lax",
});
