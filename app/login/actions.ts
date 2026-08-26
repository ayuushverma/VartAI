"use server";

import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { signIn, signInWithSessionDuration } from "@/auth";
import { loginSchema } from "@/lib/authValidation";
import { checkRateLimit, getForwardedIp, rateLimitKey } from "@/lib/rateLimit";

export async function loginAction(_previousState: string, formData: FormData) {
  const requestHeaders = await headers();
  const rateLimit = await checkRateLimit({ key: rateLimitKey("login", getForwardedIp(requestHeaders.get("x-forwarded-for"))), limit: 10, windowSeconds: 600 });
  if (!rateLimit.allowed) return "Too many sign-in attempts. Please try again shortly.";
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Check your details.";

  try {
    await signInWithSessionDuration(
      parsed.data.email,
      parsed.data.password,
      formData.get("rememberMe") === "on",
    );
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