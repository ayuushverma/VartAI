import { AuthForm } from "@/app/_components/AuthForm";
import { googleSignupAction, signupAction } from "@/app/signup/actions";

export default function SignupPage() {
  return <AuthForm action={signupAction} googleAction={googleSignupAction} googleConfigured={Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET)} mode="signup" />;
}