import { ActionFunction } from "@remix-run/node";
import { gdprConsent } from "~/gdpr";

export let action: ActionFunction = async () => {
  return gdprConsent.grantAll({ successRedirect: "/" });
};
