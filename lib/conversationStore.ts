import { db } from "@/lib/db";

export async function getConversationWithMessages(
  conversationId: string,
  userId: string,
) {
  return db.conversation.findUnique({
    where: { id: conversationId, userId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}