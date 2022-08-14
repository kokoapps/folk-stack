import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { authenticator } from "~/lib/auth.server";

export const action: ActionFunction = async ({ request }) => {
  return await authenticator.logout(request, {
    redirectTo: "/",
  });
};

export const loader: LoaderFunction = async () => {
  return redirect("/");
};
