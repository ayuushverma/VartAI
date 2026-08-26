"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { db } from "@/lib/db";
import { signupSchema } from "@/lib/authValidation";

export async function signupAction(_previousState: string, formData: FormData) {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Check your details.";

  try {
    const existingUser = await db.user.findUnique({ where: { email: parsed.data.email }, select: { id: true } });
    if (existingUser) return "An account with this email already exists.";
    await db.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash: await hash(parsed.data.password, 12),
      },
    });
    await signIn("credentials", { email: parsed.data.email, password: parsed.data.password, redirectTo: "/" });
    return "";
  } catch (error) {
    if (error instanceof AuthError) return "Your account was created, but sign-in could not be completed.";
    console.error("Signup failed.");
    return "We could not create your account right now. Please try again.";
  }
}

export async function googleSignupAction() {
  if (!process.env.AUTH_GOOGLE_ID || !process.env.AUTH_GOOGLE_SECRET) {
    return;
  }
  await signIn("google", { redirectTo: "/" });
}