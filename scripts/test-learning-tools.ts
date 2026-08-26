import assert from "node:assert/strict";
import {
  executeLearningToolCall,
  getLearningToolDefinition,
  maxLearningToolCallsPerRequest,
} from "@/lib/agent/tools/learningTools";
import { calculateLearnerProfile } from "@/lib/learnerProfile";

const profile = calculateLearnerProfile({
  completedConversations: 2,
  evaluations: [],
  mistakes: [],
  vocabulary: [],
});
const context = { learnerProfile: profile, scenario: "Daily Conversation" };

const learnerProfile = executeLearningToolCall("get_learner_profile", {}, context);
assert.equal(learnerProfile.ok, true);
if (learnerProfile.ok && "completedConversations" in learnerProfile.result) {
  assert.equal(learnerProfile.result.completedConversations, 2);
}

const recentProgress = executeLearningToolCall("get_recent_progress", {}, context);
assert.equal(recentProgress.ok, true);

const recommendation = executeLearningToolCall(
  "get_recommended_practice",
  { language: "english", scenario: "Job Interview" },
  context,
);
assert.equal(recommendation.ok, true);

assert.equal(executeLearningToolCall("unknown_tool", {}, context).ok, false);
assert.equal(executeLearningToolCall("get_learner_profile", { userId: "other-user" }, context).ok, false);
assert.equal(getLearningToolDefinition("get_recent_progress")?.name, "get_recent_progress");
assert.equal(maxLearningToolCallsPerRequest, 1);
console.log("Learning tools test passed.");