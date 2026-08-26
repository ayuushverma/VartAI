import assert from "node:assert/strict";
import { config } from "dotenv";

config({ path: ".env.local" });
config();

async function main() {
  const { db } = await import("@/lib/db");
  const { getConversationWithMessages } = await import("@/lib/conversationStore");
  const { getGamificationSummary } = await import("@/lib/gamification");

  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const userA = await db.user.create({ data: { email: `ownership-a-${suffix}@example.com` }, select: { id: true } });
  const userB = await db.user.create({ data: { email: `ownership-b-${suffix}@example.com` }, select: { id: true } });

  try {
    const conversationA = await db.conversation.create({
      data: {
        userId: userA.id,
        scenario: "Ownership A",
        endedAt: new Date(),
        messages: { create: { role: "user", content: "private A", clientRequestId: crypto.randomUUID() } },
        sessionEvaluation: { create: { fluency: 80, grammar: 80, vocabulary: 80, communication: 80, strengths: ["A"], areasToImprove: [], recommendations: [] } },
        mistakes: { create: { original: "A", correction: "A", explanation: "A" } },
        vocabulary: { create: { word: "A", meaning: "A", example: "A" } },
      },
      select: { id: true },
    });
    const conversationB = await db.conversation.create({ data: { userId: userB.id, scenario: "Ownership B" }, select: { id: true } });

    assert.equal((await getConversationWithMessages(conversationB.id, userA.id)), null);
    assert.equal((await getConversationWithMessages(conversationA.id, userB.id)), null);
    assert.equal((await getConversationWithMessages(conversationA.id, userA.id))?.userId, userA.id);
    assert.equal((await getGamificationSummary(userA.id)).xp > 0, true);
    assert.equal((await getGamificationSummary(userB.id)).xp, 0);

    const requestId = crypto.randomUUID();
    await db.message.create({ data: { conversationId: conversationA.id, role: "user", content: "idempotent", clientRequestId: requestId } });
    await assert.rejects(() => db.message.create({ data: { conversationId: conversationA.id, role: "user", content: "duplicate", clientRequestId: requestId } }));
    console.log("Ownership and idempotency test passed.");
  } finally {
    await db.user.deleteMany({ where: { id: { in: [userA.id, userB.id] } } });
    await db.$disconnect();
  }
}

void main().catch((error) => {
  console.error(error instanceof Error ? `Ownership and idempotency test failed: ${error.message}` : "Ownership and idempotency test failed.");
  process.exitCode = 1;
});
