import { z } from "zod";
import { getCurrentUserId } from "@/lib/currentUser";
import { db } from "@/lib/db";
import { scenarios } from "@/lib/scenarios";

const createConversationSchema = z.object({
  scenario: z.enum(scenarios.map((scenario) => scenario.id) as [string, ...string[]]),
}).strict();

const initialGreeting = "Hey! Let's practice English. Tell me about yourself.";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsedRequest = createConversationSchema.safeParse(body);

  if (!parsedRequest.success) {
    return Response.json(
      { error: "Invalid conversation request." },
      { status: 400 },
    );
  }

  try {
    const userId = await getCurrentUserId();
    if (!userId) return Response.json({ error: "You must be signed in." }, { status: 401 });
    const conversation = await db.conversation.create({
      data: {
        userId,
        scenario: parsedRequest.data.scenario,
        messages: {
          create: {
            role: "assistant",
            content: initialGreeting,
          },
        },
      },
      select: { id: true },
    });

    return Response.json({ conversationId: conversation.id }, { status: 201 });
  } catch (error) {
    console.error("Conversation creation failed:", error);
    return Response.json(
      { error: "VartAI could not start this conversation right now." },
      { status: 500 },
    );
  }
}