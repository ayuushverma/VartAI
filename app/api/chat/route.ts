import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

const chatRequestSchema = z.object({
  scenario: z.string().min(1).max(120),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(30),
});

const learningFeedbackSchema = z.object({
  message: z
    .string()
    .describe("A natural conversational response to keep practice moving."),
  feedback: z.object({
    grammar: z
      .array(
        z.object({
          original: z.string().describe("The user's original phrase."),
          correction: z.string().describe("A corrected version of the phrase."),
          explanation: z
            .string()
            .describe("A short, learner-friendly explanation."),
        }),
      )
      .describe("Only useful grammar corrections from the latest user message."),
    vocabulary: z
      .array(
        z.object({
          word: z.string().describe("A useful word or phrase for the learner."),
          meaning: z.string().describe("A simple meaning for the word."),
          example: z.string().describe("A short example sentence."),
        }),
      )
      .describe("Helpful vocabulary opportunities from the conversation."),
    fluency_notes: z
      .array(z.string())
      .describe("Brief notes that help the learner sound more natural."),
  }),
});

const systemInstruction = `You are VartAI, a friendly AI language-learning conversation partner.
Continue the conversation naturally.
Do not overwhelm the learner with corrections during the conversation.
Adapt language difficulty to the learner.
Encourage the user to keep speaking.
The immediate goal is conversation practice, not translation.
Respond naturally rather than sounding like a generic chatbot.
Identify useful mistakes and learning opportunities from the learner's latest message.
Keep feedback brief and practical.
Do not invent mistakes when the user's sentence is correct.
If there are no useful corrections, return empty feedback arrays.`;

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
  const parsedRequest = chatRequestSchema.safeParse(body);

  if (!parsedRequest.success) {
    return Response.json(
      { error: "Invalid chat request." },
      { status: 400 },
    );
  }

  const { messages, scenario } = parsedRequest.data;

  try {
    const response = await openai.responses.parse({
      model: "gpt-5.5",
      instructions: `${systemInstruction}\n\nSelected practice scenario: ${scenario}`,
      input: messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      text: {
        format: zodTextFormat(learningFeedbackSchema, "learning_feedback"),
      },
    });
    const parsedResponse = learningFeedbackSchema.safeParse(
      response.output_parsed,
    );

    if (!parsedResponse.success) {
      return Response.json(
        { error: "VartAI returned an invalid learning response." },
        { status: 502 },
      );
    }

    return Response.json({
      message: parsedResponse.data.message,
      feedback: parsedResponse.data.feedback,
      role: "assistant",
    });
  } catch (error) {
    console.error("OpenAI chat request failed:", error);

    return Response.json(
      { error: "VartAI could not respond right now. Please try again." },
      { status: 500 },
    );
  }
}
