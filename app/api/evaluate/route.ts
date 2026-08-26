import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/currentUser";
import { db } from "@/lib/db";
import { persistSessionEvaluation } from "@/lib/sessionEvaluation";
import { getEarnedSessionXp } from "@/lib/gamification";

const evaluateRequestSchema = z.object({
  conversationId: z.string().cuid(),
  scenario: z.string().min(1).max(120),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(50),
  learning: z.object({
    grammar: z.array(
      z.object({
        original: z.string().min(1),
        correction: z.string().min(1),
        explanation: z.string().min(1),
      }),
    ),
    vocabulary: z.array(
      z.object({
        word: z.string().min(1),
        meaning: z.string().min(1),
        example: z.string().min(1),
      }),
    ),
  }),
});

const scoreSchema = z
  .number()
  .int()
  .min(0)
  .max(100)
  .describe("An integer score from 0 to 100.");

const sessionEvaluationSchema = z.object({
  scores: z.object({
    fluency: scoreSchema,
    grammar: scoreSchema,
    vocabulary: scoreSchema,
    communication: scoreSchema,
  }),
  strengths: z
    .array(z.string())
    .describe("Concise strengths shown by the learner."),
  areas_to_improve: z
    .array(z.string())
    .describe("Concise language areas the learner can improve."),
  recommendations: z
    .array(z.string())
    .describe("Actionable next practice recommendations."),
});

const evaluationInstruction = `You are VartAI's session evaluator.
Evaluate the learner, not the AI.
Consider only the user's messages when evaluating language ability.
Use the conversation context to understand meaning.
Do not penalize the learner for intentionally simple language if it is appropriate for their level.
Do not invent mistakes.
Be realistic rather than excessively positive.
Scores should reflect the entire conversation.
Give actionable recommendations.
Do not translate the entire conversation.
Keep feedback concise and useful.`;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: "OpenAI API key is not configured." },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsedRequest = evaluateRequestSchema.safeParse(body);

  if (!parsedRequest.success) {
    return Response.json(
      { error: "Invalid evaluation request." },
      { status: 400 },
    );
  }

  const { conversationId, learning, messages, scenario } = parsedRequest.data;
  const userMessageCount = messages.filter(
    (message) => message.role === "user",
  ).length;

  if (userMessageCount === 0) {
    return Response.json(
      { error: "At least one learner message is required for evaluation." },
      { status: 400 },
    );
  }

  try {
    const userId = await getCurrentUserId();
    if (!userId) return Response.json({ error: "You must be signed in." }, { status: 401 });
    const conversation = await db.conversation.findFirst({
      where: { id: conversationId, userId },
      select: { id: true },
    });

    if (!conversation) {
      return Response.json({ error: "Conversation not found." }, { status: 404 });
    }

    const response = await openai.responses.parse({
      model: "gpt-5.5",
      instructions: `${evaluationInstruction}\n\nSelected practice scenario: ${scenario}`,
      input: messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      text: {
        format: zodTextFormat(sessionEvaluationSchema, "session_evaluation"),
      },
    });
    const parsedEvaluation = sessionEvaluationSchema.safeParse(
      response.output_parsed,
    );

    if (!parsedEvaluation.success) {
      return Response.json(
        { error: "VartAI returned an invalid session evaluation." },
        { status: 502 },
      );
    }

    try {
      await persistSessionEvaluation({
        conversationId: conversation.id,
        scores: parsedEvaluation.data.scores,
        strengths: parsedEvaluation.data.strengths,
        areasToImprove: parsedEvaluation.data.areas_to_improve,
        recommendations: parsedEvaluation.data.recommendations,
        learning,
      });
    } catch (error) {
      console.error("Session evaluation persistence failed:", error);
      return Response.json(
        { error: "VartAI could not save this session evaluation." },
        { status: 500 },
      );
    }

    return Response.json({
      ...parsedEvaluation.data,
      conversationId: conversation.id,
      earnedXp: getEarnedSessionXp(learning.grammar.length, learning.vocabulary.length),
    });
  } catch (error) {
    console.error("OpenAI evaluation request failed:", error);

    return Response.json(
      { error: "VartAI could not evaluate this session right now." },
      { status: 500 },
    );
  }
}
