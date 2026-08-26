import { z } from "zod";
import {
  buildPersonalizationContext,
  LearnerProfile,
} from "@/lib/learnerProfile";

const emptyArgumentsSchema = z.object({}).strict();
const recommendedPracticeArgumentsSchema = z
  .object({
    language: z.enum(["english", "spanish"]).nullable(),
    scenario: z.string().min(1).max(120).nullable(),
  })
  .strict();

export type LearningToolContext = {
  learnerProfile: LearnerProfile;
  scenario: string;
};

export const maxLearningToolCallsPerRequest = 1;

type LearningToolDefinition = {
  name: LearningToolName;
  description: string;
  parameters: z.ZodType;
  execute: (
    argumentsValue: unknown,
    context: LearningToolContext,
  ) => unknown;
};

export const learningToolDefinitions = [
  {
    name: "get_learner_profile",
    description: "Get the learner's compact strengths, weaknesses, level, and performance context.",
    parameters: emptyArgumentsSchema,
    execute: (_argumentsValue, context) =>
      buildPersonalizationContext(context.learnerProfile),
  },
  {
    name: "get_recent_progress",
    description: "Get compact recent learner progress, scores, strengths, weaknesses, and vocabulary.",
    parameters: emptyArgumentsSchema,
    execute: (_argumentsValue, context) => {
      const profile = buildPersonalizationContext(context.learnerProfile);
      return {
        recentConversationCount: profile.completedConversations,
        recentScores: profile.averageScores,
        recentStrengths: profile.strengths,
        recentWeaknesses: profile.weakAreas,
        recentVocabulary: profile.recentVocabulary,
      };
    },
  },
  {
    name: "get_recommended_practice",
    description: "Get a small deterministic practice recommendation for the learner's current needs.",
    parameters: recommendedPracticeArgumentsSchema,
    execute: (argumentsValue, context) => {
      const argumentsResult = recommendedPracticeArgumentsSchema.parse(argumentsValue);
      const profile = buildPersonalizationContext(context.learnerProfile);
      const focus = profile.weakAreas[0] ?? "natural conversation";
      return {
        language: argumentsResult.language ?? "english",
        scenario: argumentsResult.scenario ?? context.scenario,
        focus,
        activity: `Practice a short conversation that naturally uses ${focus.toLowerCase()}.`,
      };
    },
  },
] satisfies LearningToolDefinition[];

export type LearningToolName =
  | "get_learner_profile"
  | "get_recent_progress"
  | "get_recommended_practice";

const toolMap = new Map(
  learningToolDefinitions.map((definition) => [definition.name, definition]),
);

export function executeLearningToolCall(
  name: string,
  argumentsValue: unknown,
  context: LearningToolContext,
) {
  const definition = toolMap.get(name as LearningToolName);
  if (!definition) {
    return { ok: false as const, error: "Unknown learning tool." };
  }

  const parsedArguments = definition.parameters.safeParse(argumentsValue);
  if (!parsedArguments.success) {
    return { ok: false as const, error: "Invalid learning tool arguments." };
  }

  try {
    return { ok: true as const, result: definition.execute(parsedArguments.data, context) };
  } catch {
    return { ok: false as const, error: "Learning tool execution failed." };
  }
}

export function getLearningToolDefinition(name: string) {
  return toolMap.get(name as LearningToolName);
}