import * as React from "react";
import type { ActionArgs, LoaderFunction, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

import { getUserId } from "~/lib/session.server";
import { Trans } from "react-i18next";
import { Link } from "~/components/Link";

import { i18n } from "~/lib/i18n.server";
import { zfd } from "zod-form-data";
import { z } from "zod";
import { db } from "~/db.server";
import { add } from "date-fns";
import sendMail from "~/lib/email.server";
import TextEmail from "emails/TextEmail";
import Button from "~/components/Button";

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
  const actionData = useActionData() as
    | { errors: { email: string }; success: never }
    | { success: true; message: string; errors: null }
    | null;
  const emailRef = React.useRef<HTMLInputElement>(null);

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

            <Button disabled={actionData?.success} type="submit">
              {actionData?.success ? (
                actionData.message
              ) : (
                <Trans i18nKey="send_reset_password_link">
                  Send reset passwork link
                </Trans>
              )}
            </Button>
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

export async function action({ request }: ActionArgs) {
  let t = await i18n.getFixedT(request);

  const schema = zfd.formData({
    email: zfd.text(z.string().email(t("email_address_is_invalid"))),
  });

  const formData = await request.formData();
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

  function accepted() {
    return json(
      {
        success: true,
        errors: null,
        message: t("reset_password_email_sent"),
      },
      { status: 201 }
    );
  }

  const user = await db.user.findUnique({
    where: {
      email: result.data.email,
    },
    select: {
      id: true,
      email: true,
    },
  });

  if (!user) {
    return accepted();
  }

  let { token } = await db.resetPasswordToken.create({
    data: {
      expirationDate: add(new Date(), {
        minutes: 15,
      }),
      user: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  let url = new URL(request.url);

  let link = `${url.origin}/reset-password?token=${token}`;

  await sendMail({
    to: user.email,
    subject: "",
    component: (
      <TextEmail
        name={user.email}
        body={
          <>
            We’ve received your request to change your password. Use the link
            below to set up a new password for your account. This link is only
            usable once! If you need to, you can reinitiate the password process
            again <a href={link}>here</a>.
          </>
        }
      />
    ),
  });

  return accepted();
}

// t("invalid_email_or_assword")
// t("email_address_is_invalid")
// t("password_is_too_short")
