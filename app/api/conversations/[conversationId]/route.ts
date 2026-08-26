import { z } from "zod";
import { getConversationWithMessages } from "@/lib/conversationStore";
import { getCurrentUserId } from "@/lib/currentUser";
import { db } from "@/lib/db";

const conversationIdSchema = z.string().cuid();

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const { conversationId } = await params;
  const parsedConversationId = conversationIdSchema.safeParse(conversationId);

  if (!parsedConversationId.success) {
    return Response.json({ error: "Invalid conversation ID." }, { status: 400 });
  }

  try {
    const userId = await getCurrentUserId();
    if (!userId) return Response.json({ error: "You must be signed in." }, { status: 401 });
    const conversation = await getConversationWithMessages(
      parsedConversationId.data,
      userId,
    );

    if (!conversation) {
      return Response.json({ error: "Conversation not found." }, { status: 404 });
    }

    return Response.json(conversation);
  } catch (error) {
    console.error("Conversation retrieval failed:", error);
    return Response.json(
      { error: "VartAI could not load this conversation right now." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const { conversationId } = await params;
  const parsedConversationId = conversationIdSchema.safeParse(conversationId);

  if (!parsedConversationId.success) {
    return Response.json({ error: "Invalid conversation ID." }, { status: 400 });
  }

  try {
    const userId = await getCurrentUserId();
    if (!userId) return Response.json({ error: "You must be signed in." }, { status: 401 });
    const conversation = await db.conversation.updateMany({
      where: {
        id: parsedConversationId.data,
        userId,
      },
      data: { endedAt: new Date() },
    });

    if (conversation.count === 0) {
      return Response.json({ error: "Conversation not found." }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Conversation close failed:", error);
    return Response.json(
      { error: "VartAI could not end this conversation right now." },
      { status: 500 },
    );
  }
}