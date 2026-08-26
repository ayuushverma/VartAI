import { zodResponsesFunction } from "openai/helpers/zod";
import { learningToolDefinitions } from "@/lib/agent/tools/learningTools";

export const responseLearningTools = learningToolDefinitions.map((tool) =>
  zodResponsesFunction({
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters,
  }),
);