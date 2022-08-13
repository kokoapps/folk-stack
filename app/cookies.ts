import { createCookie } from "@remix-run/node";
import type { Cookie, CookieSerializeOptions } from "@remix-run/node";

function createCookieHandlers<CookieValue = any>(cookie: Cookie) {
  let getValue = async (request: Request): Promise<CookieValue> => {
    return await cookie.parse(request.headers.get("Cookie"));
  };
  let getHeaders = async (
    value: CookieValue,
    headers: ResponseInit["headers"] = new Headers(),
    serializeOptions?: CookieSerializeOptions
  ) => {
    const serialized = await cookie.serialize(value, serializeOptions);
    if (!value) return headers;
    if (headers instanceof Headers) {
      headers.append("Set-Cookie", serialized);
    } else if (Array.isArray(headers)) {
      headers.push(["Set-Cookie", serialized]);
    } else {
      headers["Set-Cookie"] = serialized;
    }
    return headers;
  };

  return [getValue, getHeaders] as any as [typeof getValue, typeof getHeaders];
}

export let localeCookie = createCookie("locale", {
  path: "/",
  sameSite: "lax",
  secure: false,
  httpOnly: true,
});
