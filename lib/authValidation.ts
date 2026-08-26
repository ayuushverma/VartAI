import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
}).strict();

export const signupSchema = z
  .object({
    name: z.string().trim().min(1, "Enter your name.").max(80),
    email: z.string().trim().toLowerCase().email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters.").max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  }).strict();