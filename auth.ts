import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/authValidation";

export const REMEMBERED_SESSION_MAX_AGE = 30 * 24 * 60 * 60;
export const STANDARD_SESSION_MAX_AGE = 8 * 60 * 60;

export function createAuthConfig(sessionMaxAge = REMEMBERED_SESSION_MAX_AGE) {
  return {
    adapter: PrismaAdapter(db),
    session: { strategy: "jwt" as const, maxAge: sessionMaxAge },
    pages: { signIn: "/login" },
    providers: [
      ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
        ? [
            Google({
              clientId: process.env.AUTH_GOOGLE_ID,
              clientSecret: process.env.AUTH_GOOGLE_SECRET,
            }),
          ]
        : []),
      Credentials({
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          const parsed = loginSchema.safeParse(credentials);
          if (!parsed.success) return null;

          const user = await db.user.findUnique({
            where: { email: parsed.data.email },
            select: { id: true, name: true, email: true, passwordHash: true },
          });
          if (!user?.passwordHash || !(await compare(parsed.data.password, user.passwordHash))) {
            return null;
          }
          return { id: user.id, name: user.name, email: user.email };
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }) {
        if (user?.id) token.userId = user.id;
        return token;
      },
      async session({ session, token }) {
        if (session.user && token.userId) session.user.id = token.userId;
        return session;
      },
    },
  } satisfies NextAuthConfig;
}

export const authConfig = createAuthConfig();

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

export async function signInWithSessionDuration(
  email: string,
  password: string,
  rememberMe: boolean,
) {
  const sessionAuth = NextAuth(
    createAuthConfig(rememberMe ? REMEMBERED_SESSION_MAX_AGE : STANDARD_SESSION_MAX_AGE),
  );
  await sessionAuth.signIn("credentials", { email, password, redirectTo: "/" });
}