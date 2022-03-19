import { createContext, PropsWithChildren, useContext } from "react";
import { Cookie } from "remix";
import { gdprConsentCookie } from "./cookies";

export type GDPRConsentState = {
  consent: "granted" | "denied" | "unknown";
  consentString: string;
  timestamp: number;
};

type GDPRConsentOptions = {};

export class GDPRConsent {
  constructor(private cookie: Cookie, private options?: GDPRConsentOptions) {}

  async getConsentState(request: Request): Promise<GDPRConsentState> {
    return (
      (await this.cookie.parse(request.clone().headers.get("cookie"))) ?? {
        consent: "unknown",
        consentString: "unknown",
        timestamp: 0,
      }
    );
  }

  public grantAll(options: { successRedirect?: string }): Promise<Response>;
  public grantAll(options?: never): Promise<string>;
  //@ts-ignore
  public async grantAll(options): Promise<Response | string> {
    let cookie: GDPRConsentState = {
      consent: "granted",
      consentString: "granted",
      timestamp: Date.now(),
    };
    if (options?.successRedirect) {
      return new Response("", {
        status: 302,
        headers: {
          Location: options?.successRedirect,
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

export let gdprConsent = new GDPRConsent(gdprConsentCookie);
