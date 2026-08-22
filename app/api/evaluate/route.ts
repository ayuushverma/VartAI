import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

const evaluateRequestSchema = z.object({
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

  const { messages, scenario } = parsedRequest.data;
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

    return Response.json(parsedEvaluation.data);
  } catch (error) {
    console.error("OpenAI evaluation request failed:", error);

    return Response.json(
      { error: "VartAI could not evaluate this session right now." },
      { status: 500 },
    );
  }
}
