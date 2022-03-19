import { createContext, PropsWithChildren, useContext } from "react";
import { Cookie } from "remix";

type GDPRConsentState = {
  consent: "granted" | "denied" | "unknown";
  consentString: string;
  timestamp: number;
};

type GDPRConsentOptions = {};

export class GDPRConsent {
  constructor(private cookie: Cookie, private options: GDPRConsentOptions) {}

  async getConsentState(request: Request): Promise<GDPRConsentState> {
    return (
      (await this.cookie.parse(request.clone().headers.get("cookie"))) ?? {
        consent: "unknown",
        consentString: "unknown",
        timestamp: 0,
      }
    ).consent;
  }

  public grantAll(options: { successRedirect?: string }): Promise<Response>;
  public grantAll(options: never): Promise<string>;
  public async grantAll({
    successRedirect,
  }: {
    successRedirect?: string;
  }): Promise<Response | string> {
    let cookie: GDPRConsentState = {
      consent: "granted",
      consentString: "granted",
      timestamp: Date.now(),
    };
    if (successRedirect) {
      return new Response("", {
        status: 302,
        headers: {
          Location: successRedirect,
          "Set-Cookie": await this.cookie.serialize(cookie),
        },
      });
    }
    return this.cookie.serialize(cookie);
  }
}

let GDPRContext = createContext<GDPRConsentState | null>(null);
export let GDPRProvider = (
  props: PropsWithChildren<{ consent: GDPRConsentState }>
) => {
  return (
    <GDPRContext.Provider value={props.consent}>
      {props.children}
    </GDPRContext.Provider>
  );
};

export let useGDPRConsent = () => {
  let consent = useContext(GDPRContext);
  if (consent === null) {
    throw new Error("useGDPRConsent must be used within a GDPRProvider");
  }
  return consent;
};
