import * as React from "react";
import type { ActionArgs, LoaderFunction, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

import { createUserSession, getUserId } from "~/lib/session.server";

import { authenticator } from "~/lib/auth.server";
import { Trans } from "react-i18next";
import Link from "~/components/Link";

import { i18n } from "~/lib/i18n.server";
import { zfd } from "zod-form-data";
import { z } from "zod";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

export const meta: MetaFunction = () => {
  return {
    title: "Login",
  };
};

export default function LoginPage() {
  const actionData = useActionData() as ActionData;
  const emailRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.email) {
      emailRef.current?.focus();
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
          <Trans i18nKey={"trouble_signing_in"}>Trouble signing in?</Trans>
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          <Trans i18nKey="forgot_password_instructions">
            Enter your email, phone, or username and we'll send you a link to
            get back into your account.
          </Trans>
        </p>
      </div>

      <div className="mt-8">
        <div className="mt-6">
          <Form method="post" className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                <Trans i18nKey="email_address">Email address</Trans>
              </label>
              <div className="mt-1">
                <input
                  ref={emailRef}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
                {actionData?.errors?.email && (
                  <div className="pt-1 text-red-700" id="email-error">
                    {actionData.errors.email}
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <Trans i18nKey="send_reset_password_link">
                Send reset passwork link
              </Trans>
            </button>
          </Form>

          <div className="relative mt-6 ">
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">
                <Trans i18nKey="or">Or</Trans>
              </span>
            </div>
          </div>
          <div className="mx-auto mt-4 text-center">
            <Link to="/register">
              <Trans i18nKey="create_a_new_account">Create a new account</Trans>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

interface ActionData {
  errors?: {
    email?: string;
  };
}

export const action = async ({ request }: ActionArgs) => {
  let t = await i18n.getFixedT(request);

  const schema = zfd.formData({
    email: zfd.text(z.string().email(t("email_address_is_invalid"))),
    password: zfd.text(z.string().min(8, t("password_is_too_short"))),
    remember: zfd.checkbox(),
    redirectTo: zfd.text(z.string().optional()),
  });

  const formData = await request.clone().formData();
  const result = schema.safeParse(formData);
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

  const { remember, redirectTo } = result.data;

  const user = await authenticator.authenticate("local", request);

  if (!user) {
    return json<ActionData>(
      { errors: { email: t("invalid_email_or_assword") } },
      { status: 400 }
    );
  }

  return createUserSession({
    request,
    user,
    remember: remember ? true : false,
    redirectTo: typeof redirectTo === "string" ? redirectTo : "/",
  });
};

// t("invalid_email_or_assword")
// t("email_address_is_invalid")
// t("password_is_too_short")
