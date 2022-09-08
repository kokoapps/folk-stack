import * as React from "react";
import type { ActionFunction, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";

import { commitSession, getSession } from "~/lib/session.server";

import { resetPassword } from "~/models/user.server";

import { Trans } from "react-i18next";
import { Link } from "~/components/Link";
import { i18n } from "~/lib/i18n.server";
import { zfd } from "zod-form-data";
import { z } from "zod";
import { authenticator } from "~/lib/auth.server";
import { getSearchParams } from "~/lib/urls";
import { db } from "~/db.server";

let schema = z.object({
  token: z.string(),
});
export async function loader({ request }: LoaderArgs) {
  await authenticator.isAuthenticated(request.clone(), {
    successRedirect: "/",
  });
  const { token } = schema.parse(getSearchParams(request));
  const resetPasswordToken = await db.resetPasswordToken.findUnique({
    where: { token },
    select: {
      token: true,
      expirationDate: true,
      user: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!resetPasswordToken) {
    throw redirect("/auth/forgot-password", {
      headers: {
        "Set-Cookie": `flash=Invalid token; Path=/; Max-Age=60`,
      },
    });
  }
  if (
    resetPasswordToken.expirationDate &&
    resetPasswordToken.expirationDate < new Date()
  ) {
    throw redirect("/auth/forgot-password", {
      headers: {
        "Set-Cookie": `flash=Token expired; Path=/; Max-Age=60`,
      },
    });
  }

  return json({
    token: resetPasswordToken.token,
  });
}

export const meta: MetaFunction = () => {
  return {
    title: "Reset Password",
  };
};

export default function ResetPassword() {
  let { token } = useLoaderData<typeof loader>();

  const actionData = useActionData() as ActionData;
  const passwordRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <>
      <div>
        <img
          className="h-12 w-auto"
          src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
          alt="Your Company"
        />
        <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
          <Trans i18nKey={"reset_password"}>Reset password</Trans>
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            <Trans i18nKey="take_me_to_login">Take me to login</Trans>
          </Link>
        </p>
      </div>

      <div className="mt-6">
        <Form method="post" className="space-y-6">
          <input type="hidden" name="token" value={token} />
          <div className="space-y-1">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              <Trans i18nKey="password">Password</Trans>
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Trans i18nKey="reset_password">Reset password</Trans>
          </button>
        </Form>
      </div>
    </>
  );
}

interface ActionData {
  errors: {
    password?: string;
    token?: string;
  };
}

export const action: ActionFunction = async ({ request }) => {
  let t = await i18n.getFixedT(request);

  const schema = zfd.formData({
    token: zfd.text(z.string()),
    password: zfd.text(z.string().min(8, t("password_is_too_short"))),
  });

  const formData = await request.formData();
  const result = await schema.safeParseAsync(formData);

  if (!result.success) {
    return json(
      { errors: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { token, password } = result.data;

  let resetPasswordToken = await db.resetPasswordToken.findUnique({
    where: {
      token,
    },
    select: {
      expirationDate: true,
      user: {
        select: {
          id: true,
        },
      },
    },
  });
  if (
    !resetPasswordToken ||
    (resetPasswordToken.expirationDate &&
      resetPasswordToken.expirationDate < new Date())
  ) {
    return json<ActionData>(
      { errors: { token: "Invalid token" } },

      { status: 400 }
    );
  }

  await resetPassword(resetPasswordToken.user.id, password);

  let session = await getSession(request);
  session.flash("resetPasswordFlash", t("password_reset_success"));

  return redirect("/login", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};
