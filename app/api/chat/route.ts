import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { ParsedResponseFunctionToolCall } from "openai/resources/responses/responses";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/currentUser";
import { db } from "@/lib/db";
import {
  buildPersonalizationContext,
  formatPersonalizationContext,
  getLearnerProfile,
} from "@/lib/learnerProfile";
import { formatRetrievedKnowledge } from "@/lib/rag/context";
import { retrieveKnowledge } from "@/lib/rag/retrieve";
import {
  executeLearningToolCall,
  LearningToolContext,
  maxLearningToolCallsPerRequest,
} from "@/lib/agent/tools/learningTools";
import { responseLearningTools } from "@/lib/agent/tools/responseTools";
import { scenarios } from "@/lib/scenarios";
import { checkRateLimit, rateLimitKey } from "@/lib/rateLimit";

const chatRequestSchema = z.object({
  conversationId: z.string().cuid(),
  requestId: z.string().uuid(),
  scenario: z.enum(scenarios.map((scenario) => scenario.id) as [string, ...string[]]),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }).strict(),
    )
    .min(1)
    .max(30),
    }).strict();

const learningFeedbackSchema = z.object({
  message: z
    .string()
    .describe("A natural conversational response to keep practice moving."),
  feedback: z.object({
    grammar: z
      .array(
        z.object({
          original: z.string().max(400).describe("The user's original phrase."),
          correction: z.string().max(400).describe("A corrected version of the phrase."),
          explanation: z
            .string().max(800)
            .describe("A short, learner-friendly explanation."),
        }),
      )
      .max(10)
      .describe("Only useful grammar corrections from the latest user message."),
    vocabulary: z
      .array(
        z.object({
          word: z.string().max(120).describe("A useful word or phrase for the learner."),
          meaning: z.string().max(400).describe("A simple meaning for the word."),
          example: z.string().max(400).describe("A short example sentence."),
        }),
      )
      .max(10)
      .describe("Helpful vocabulary opportunities from the conversation."),
    fluency_notes: z
      .array(z.string().max(400))
      .max(10)
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
If there are no useful corrections, return empty feedback arrays.
You have access to a small set of read-only learning tools. Use them only when they provide information unavailable in the current context.
Never reveal internal tool names or implementation details. Never claim a tool was used unless it actually was.
Do not turn every conversation into an analysis.`;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 1,
  timeout: 30_000,
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

  const { conversationId, messages, requestId, scenario } = parsedRequest.data;

  try {
    const userId = await getCurrentUserId();
    if (!userId) return Response.json({ error: "You must be signed in." }, { status: 401 });
    const rateLimit = await checkRateLimit({ key: rateLimitKey("chat", userId), limit: 20, windowSeconds: 600 });
    if (!rateLimit.allowed) {
      return Response.json({ error: rateLimit.configured ? "VartAI is temporarily busy. Please try again shortly." : "Chat rate limiting is not configured for production." }, { status: rateLimit.configured ? 429 : 503, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } });
    }
    const conversation = await db.conversation.findFirst({
      where: { id: conversationId, userId },
      select: { id: true },
    });

    if (!conversation) {
      return Response.json({ error: "Conversation not found." }, { status: 404 });
    }

    const existingUserMessage = await db.message.findFirst({
      where: { clientRequestId: requestId, conversationId, role: "user" },
      select: { id: true },
    });
    if (existingUserMessage) {
      const existingAssistantMessage = await db.message.findFirst({
        where: { conversationId, replyToRequestId: requestId, role: "assistant" },
        select: { content: true, feedback: true },
      });
      if (existingAssistantMessage) {
        const feedback = learningFeedbackSchema.shape.feedback.safeParse(existingAssistantMessage.feedback);
        return Response.json({ message: existingAssistantMessage.content, feedback: feedback.success ? feedback.data : { grammar: [], vocabulary: [], fluency_notes: [] }, role: "assistant" });
      }
      const claim = await db.message.updateMany({ where: { id: existingUserMessage.id, processing: false }, data: { processing: true } });
      if (claim.count === 0) return Response.json({ error: "This message is already being processed. Please retry shortly." }, { status: 409 });
    }

    const learnerProfile = await getLearnerProfile(userId);

    const latestMessage = messages[messages.length - 1];

    if (latestMessage.role !== "user") {
      return Response.json(
        { error: "The latest message must be from the learner." },
        { status: 400 },
      );
    }

    const personalizationContext = formatPersonalizationContext(
      buildPersonalizationContext(learnerProfile),
    );
    const learnerContext = buildPersonalizationContext(learnerProfile);
    const retrievedKnowledge = retrieveKnowledge({
      query: latestMessage.content,
      language: "english",
      level: learnerContext.approximateLevel,
      scenario,
    });
    const retrievedContext = formatRetrievedKnowledge(retrievedKnowledge);

    if (process.env.NODE_ENV !== "production" && retrievedKnowledge.length > 0) {
      console.info("RAG retrieval", {
        conversationId,
        documentIds: retrievedKnowledge.map((document) => document.id),
      });
    }

    await db.message.create({
      data: {
        conversationId,
        role: "user",
        content: latestMessage.content,
        clientRequestId: requestId,
        processing: true,
      },
    });

    const instructions = [
      systemInstruction,
      `Selected practice scenario: ${scenario}`,
      personalizationContext,
      retrievedContext || "No additional learning reference is needed for this message.",
      "Use this context quietly to personalize the conversation. Keep the exchange natural, and do not mention this profile or its data to the learner.",
      "Retrieved learning reference is optional reference material. Use it only when relevant, do not repeat it blindly, and never mention retrieval, documents, RAG, or internal systems.",
    ].join("\n\n");
    const response = await requestChatResponse({
      input: messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      instructions,
      toolContext: { learnerProfile, scenario },
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

    await db.message.create({
      data: {
        conversationId,
        role: "assistant",
        content: parsedResponse.data.message,
        replyToRequestId: requestId,
        feedback: parsedResponse.data.feedback,
        processing: false,
      },
    });

    return Response.json({
      message: parsedResponse.data.message,
      feedback: parsedResponse.data.feedback,
      role: "assistant",
    });
  } catch (error) {
    await db.message.updateMany({ where: { conversationId, clientRequestId: requestId, role: "user" }, data: { processing: false } }).catch(() => undefined);
    console.error("OpenAI chat request failed:", error);

    return Response.json(
      { error: "VartAI could not respond right now. Please try again." },
      { status: 500 },
    );
  }
}

async function requestChatResponse({
  input,
  instructions,
  toolContext,
}: {
  input: { role: "user" | "assistant"; content: string }[];
  instructions: string;
  toolContext: LearningToolContext;
}) {
  const firstResponse = await openai.responses.parse({
    model: "gpt-5.5",
    instructions,
    input,
    tools: responseLearningTools,
    text: {
      format: zodTextFormat(learningFeedbackSchema, "learning_feedback"),
    },
  });
  const toolCalls = firstResponse.output.filter(
    (item): item is ParsedResponseFunctionToolCall => item.type === "function_call",
  );

  if (toolCalls.length === 0) {
    return firstResponse;
  }

  if (toolCalls.length > maxLearningToolCallsPerRequest) {
    console.warn("Learning tool limit reached", { requested: toolCalls.length });
  }

  const toolCall = toolCalls[0];
  const parsedArguments = JSON.parse(toolCall.arguments) as unknown;
  const toolResult = executeLearningToolCall(
    toolCall.name,
    parsedArguments,
    toolContext,
  );

  if (process.env.NODE_ENV !== "production") {
    console.info("Learning tool call", {
      name: toolCall.name,
      validationSucceeded: toolResult.ok,
      executionSucceeded: toolResult.ok,
    });
  }

  const followUpInput = [
    ...input,
    toolCall,
    {
      type: "function_call_output" as const,
      call_id: toolCall.call_id,
      output: JSON.stringify(
        toolResult.ok ? toolResult.result : { error: toolResult.error },
      ),
    },
  ];

  return openai.responses.parse({
    model: "gpt-5.5",
    instructions,
    input: followUpInput,
    text: {
      format: zodTextFormat(learningFeedbackSchema, "learning_feedback"),
    },
  });
}
