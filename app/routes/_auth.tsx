import { json, type LoaderArgs } from "@remix-run/node";
import { Form, Outlet, useLocation, useSubmit } from "@remix-run/react";
import { useTranslation } from "react-i18next";

import { authenticator } from "~/lib/auth.server";

export async function loader({ request, params }: LoaderArgs) {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });
  return json({});
}

export default function () {
  let { i18n } = useTranslation();
  let submit = useSubmit();
  let location = useLocation();
  return (
    <>
      <div className="flex min-h-full">
        <div className="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto flex w-full max-w-sm flex-col gap-4 lg:w-96">
            <Outlet />
            {/* change locale select */}
            <Form
              method="post"
              className="mx-auto flex gap-2"
              action="change-locale"
            >
              <select
                className="border-none text-xs text-gray-500"
                value={i18n.language}
                onChange={(e) => {
                  i18n.changeLanguage(e.target.value);
                  submit(
                    {
                      locale: e.target.value,
                      redirectTo: location.pathname,
                    },
                    {
                      method: "post",
                      action: "change-locale",
                    }
                  );
                }}
              >
                <option value="en">English</option>
                <option value="he">עברית</option>
              </select>
            </Form>
          </div>
        </div>
        <div className="relative hidden w-0 flex-1 lg:block">
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1505904267569-f02eaeb45a4c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1908&q=80"
            alt=""
          />
        </div>
      </div>
    </>
  );
}
