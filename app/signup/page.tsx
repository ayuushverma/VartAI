import { auth } from "@/auth";
import { AuthForm } from "@/app/_components/AuthForm";
import { googleSignupAction, signupAction } from "@/app/signup/actions";
import { redirect } from "next/navigation";

export default async function SignupPage() {
  if (await auth()) redirect("/");
  return <AuthForm action={signupAction} googleAction={googleSignupAction} googleConfigured={Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET)} mode="signup" />;
}