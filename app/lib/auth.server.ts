import { Authenticator } from "remix-auth";
import { sessionStorage, USER_SESSION_KEY } from "~/lib/session.server";
import { verifyLogin, type User } from "~/models/user.server";
import { FormStrategy } from "remix-auth-form";
import { z } from "zod";
// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export let authenticator = new Authenticator<User>(sessionStorage, {
  sessionKey: USER_SESSION_KEY,
});

let schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
const localStrategy = new FormStrategy(async ({ form }) => {
  let { email, password } = schema.parse(Object.fromEntries(form));
  let user = await verifyLogin(email, password);
  if (!user) {
    throw new Error("Invalid credentials");
  }
  return user;
});

authenticator.use(localStrategy, "local");
