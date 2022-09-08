import { type ActionArgs, json, redirect } from "@remix-run/node";
import { z } from "zod";
import { localeCookie } from "~/cookies";

let schema = z.object({
  locale: z.enum(["en", "he"]),
  redirectTo: z.string(),
});
export async function action({ request }: ActionArgs) {
  let formData = await request.formData();
  let result = schema.safeParse(Object.fromEntries(formData));
  console.log(result);

  if (!result.success) {
    return json(
      {
        errors: result.error.flatten().fieldErrors,
      },
      {
        status: 422,
      }
    );
  }

  let { locale, redirectTo } = result.data;

  let cookie = await localeCookie.serialize(locale);

  console.log(locale, redirectTo);

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": cookie,
    },
  });
}

export default () => null;
