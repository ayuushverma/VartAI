import assert from "node:assert/strict";
import { compare, hash } from "bcryptjs";
import { loginSchema, signupSchema } from "@/lib/authValidation";

assert.equal(loginSchema.safeParse({ email: "learner@example.com", password: "correct horse" }).success, true);
assert.equal(loginSchema.safeParse({ email: "not-an-email", password: "short" }).success, false);
assert.equal(signupSchema.safeParse({ name: "Learner", email: "learner@example.com", password: "password123", confirmPassword: "password123" }).success, true);
assert.equal(signupSchema.safeParse({ name: "Learner", email: "learner@example.com", password: "password123", confirmPassword: "different123" }).success, false);
assert.equal(signupSchema.safeParse({ name: "Learner", email: "learner@example.com", password: "password123", confirmPassword: "password123", userId: "other-user" }).success, false);
async function main() {
	const passwordHash = await hash("password123", 12);
	assert.notEqual(passwordHash, "password123");
	assert.equal(await compare("password123", passwordHash), true);
	assert.equal(await compare("wrong-password", passwordHash), false);
	console.log("Auth validation test passed.");
}

void main();