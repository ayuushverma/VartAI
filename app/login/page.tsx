import { auth } from "@/auth";
import { AuthForm } from "@/app/_components/AuthForm";
import { googleLoginAction, loginAction } from "@/app/login/actions";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  if (await auth()) redirect("/");
  return <AuthForm action={loginAction} googleAction={googleLoginAction} googleConfigured={Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET)} mode="login" />;
}