"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { loginSchema } from "@/lib/authValidation";

export async function loginAction(_previousState: string, formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Check your details.";

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/",
    });
    return "";
  } catch (error) {
    if (error instanceof AuthError) return "Email or password is incorrect.";
    console.error("Login failed.");
    return "We could not sign you in right now. Please try again.";
  }
}

export async function googleLoginAction() {
  if (!process.env.AUTH_GOOGLE_ID || !process.env.AUTH_GOOGLE_SECRET) {
    return;
  }
  await signIn("google", { redirectTo: "/" });
}