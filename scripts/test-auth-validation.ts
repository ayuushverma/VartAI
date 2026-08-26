import assert from "node:assert/strict";
import { compare, hash } from "bcryptjs";
import { loginSchema, signupSchema } from "@/lib/authValidation";
import { getForwardedIp } from "@/lib/rateLimit";

assert.equal(loginSchema.safeParse({ email: "learner@example.com", password: "correct horse" }).success, true);
assert.equal(loginSchema.safeParse({ email: "not-an-email", password: "short" }).success, false);
assert.equal(signupSchema.safeParse({ name: "Learner", email: "learner@example.com", password: "password123", confirmPassword: "password123" }).success, true);
assert.equal(signupSchema.safeParse({ name: "Learner", email: "learner@example.com", password: "password123", confirmPassword: "different123" }).success, false);
assert.equal(signupSchema.safeParse({ name: "Learner", email: "learner@example.com", password: "password123", confirmPassword: "password123", userId: "other-user" }).success, false);
assert.equal(getForwardedIp(" 203.0.113.10, 198.51.100.2 "), "203.0.113.10");
assert.equal(getForwardedIp(null), "unknown");
async function main() {
	const passwordHash = await hash("password123", 12);
	assert.notEqual(passwordHash, "password123");
	assert.equal(await compare("password123", passwordHash), true);
	assert.equal(await compare("wrong-password", passwordHash), false);
	console.log("Auth validation test passed.");
}

void main();