import { ActionFunction } from "remix";
import { gdprConsent } from "~/gdpr";

export let action: ActionFunction = async () => {
  return gdprConsent.grantAll({ successRedirect: "/" });
};
