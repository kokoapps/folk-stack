import * as React from "react";
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useSearchParams } from "@remix-run/react";

import { getUserId, createUserSession } from "~/lib/session.server";

import { createUser, getUserByEmail } from "~/models/user.server";

import sendMail from "emails";
import Welcome from "emails/Welcome";
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
    title: "Sign Up",
  };
};

export default function Join() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const actionData = useActionData() as ActionData;
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
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
          <Trans i18nKey={"create_a_new_account"}>Create a new account</Trans>
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            <Trans i18nKey="have_an_account">Already have an account?</Trans>
          </Link>
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
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

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

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="acceptTermsAndConditions"
                  name="acceptTermsAndConditions"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="acceptTermsAndConditions"
                  className="block text-sm text-gray-900 ltr:ml-2 rtl:mr-2"
                >
                  <Trans i18nKey="accept_terms_and_conditions">
                    I accept the{" "}
                    <Link
                      as="a"
                      href="#"
                      target="_blank"
                      rel="noopener noreferer"
                    >
                      terms of use
                    </Link>{" "}
                    and the{" "}
                    <Link
                      as="a"
                      href="#"
                      target="_blank"
                      rel="noopener noreferer"
                    >
                      privacy policy
                    </Link>
                  </Trans>
                </label>
              </div>
            </div>
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <button
              type="submit"
              className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <Trans i18nKey="register">Register</Trans>
            </button>
          </Form>
        </div>
      </div>
    </>
  );
}

interface ActionData {
  errors: {
    email?: string;
    password?: string;
    acceptTermsAndConditions?: string;
  };
}

export const action: ActionFunction = async ({ request }) => {
  let t = await i18n.getFixedT(request);

  const schema = zfd.formData({
    email: zfd.text(z.string().email(t("email_address_is_invalid"))),
    password: zfd.text(z.string().min(8, t("password_is_too_short"))),
    acceptTermsAndConditions: zfd.checkbox(),
    redirectTo: zfd.text(z.string().optional()),
  });

  const formData = await request.formData();
  const result = await schema.safeParseAsync(formData);

  if (!result.success) {
    return json(
      { errors: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { email, password, redirectTo, acceptTermsAndConditions } = result.data;

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return json<ActionData>(
      { errors: { email: "A user already exists with this email" } },
      { status: 400 }
    );
  }

  if (!acceptTermsAndConditions) {
    return json<ActionData>(
      {
        errors: {
          acceptTermsAndConditions: "You must accept the terms and conditions",
        },
      },
      { status: 400 }
    );
  }

  const user = await createUser(email, password);

  await sendMail({
    subject: "Welcome",
    to: email,
    component: <Welcome name={email} />,
  });

  return createUserSession({
    request,
    user: user,
    remember: false,
    redirectTo: typeof redirectTo === "string" ? redirectTo : "/",
  });
};
