import { config } from "dotenv";
config({ path: ".env.local" });
config();

async function main() {
  const { getDevelopmentUser } = await import("@/lib/developmentUser");
  const { db } = await import("@/lib/db");
  const {
    getSessionEvaluationByConversationId,
    persistSessionEvaluation,
  } = await import("@/lib/sessionEvaluation");
  const user = await getDevelopmentUser();
  const conversation = await db.conversation.create({
    data: {
      userId: user.id,
      scenario: "Step 8D persistence test",
    },
    select: { id: true },
  });

  try {
    await persistSessionEvaluation({
      conversationId: conversation.id,
      scores: { fluency: 80, grammar: 75, vocabulary: 85, communication: 90 },
      strengths: ["Clear communication"],
      areasToImprove: ["Past tense"],
      recommendations: ["Practice storytelling"],
      learning: {
        grammar: [
          {
            original: "I go yesterday",
            correction: "I went yesterday",
            explanation: "Use the past tense for yesterday.",
          },
        ],
        vocabulary: [
          {
            word: "storytelling",
            meaning: "The activity of telling stories",
            example: "Storytelling is a useful speaking practice.",
          },
        ],
      },
    });

    const result = await getSessionEvaluationByConversationId(
      conversation.id,
    );

    if (
      !result ||
      result.conversation.id !== conversation.id ||
      result.conversation.userId !== user.id ||
      result.conversation.mistakes.length !== 1 ||
      result.conversation.vocabulary.length !== 1
    ) {
      throw new Error("Session evaluation persistence assertion failed.");
    }

    console.log("Session evaluation persistence test passed.");
  } finally {
    await db.conversation.delete({ where: { id: conversation.id } });
    await db.$disconnect();
  }
}

void main().catch((error) => {
  console.error(
    error instanceof Error
      ? `Session evaluation persistence test failed: ${error.message}`
      : "Session evaluation persistence test failed.",
  );
  process.exitCode = 1;
});