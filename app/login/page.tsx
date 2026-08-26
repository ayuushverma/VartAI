import { AuthForm } from "@/app/_components/AuthForm";
import { googleLoginAction, loginAction } from "@/app/login/actions";

export default function LoginPage() {
  return <AuthForm action={loginAction} googleAction={googleLoginAction} googleConfigured={Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET)} mode="login" />;
}