import assert from "node:assert/strict";
import {
  buildPersonalizationContext,
  calculateLearnerProfile,
  formatPersonalizationContext,
} from "@/lib/learnerProfile";

const older = new Date("2026-01-01T00:00:00Z");
const newer = new Date("2026-01-02T00:00:00Z");
const profile = calculateLearnerProfile({
  completedConversations: 3,
  evaluations: [
    {
      fluency: 80,
      grammar: 70,
      vocabulary: 90,
      communication: 80,
      strengths: ["Clear vocabulary"],
      areasToImprove: ["Past tense"],
      createdAt: newer,
    },
    {
      fluency: 60,
      grammar: 50,
      vocabulary: 70,
      communication: 60,
      strengths: ["Clear vocabulary"],
      areasToImprove: ["Sentence rhythm"],
      createdAt: older,
    },
  ],
  mistakes: [
    { original: "I go yesterday", correction: "I went yesterday", explanation: "Use past tense.", createdAt: newer },
    { original: "I go last week", correction: "I went last week", explanation: "Use past tense.", createdAt: older },
  ],
  vocabulary: [
    { word: "negotiate", meaning: "Discuss an agreement", example: "We negotiate the price.", createdAt: newer },
    { word: "negotiate", meaning: "Discuss an agreement", example: "They negotiate clearly.", createdAt: older },
  ],
});

assert.equal(profile.completedConversations, 3);
assert.deepEqual(profile.averageScores, { fluency: 70, grammar: 60, vocabulary: 80, communication: 70 });
assert.deepEqual(profile.commonGrammarMistakes, ["Past tense"]);
assert.deepEqual(profile.frequentlyLearnedVocabulary, ["negotiate"]);
const context = buildPersonalizationContext(profile);
assert.equal(context.approximateLevel, "intermediate");
const formattedContext = formatPersonalizationContext(context);
assert.match(formattedContext, /Approximate level: intermediate/);
assert.match(formattedContext, /Weak areas: Past tense, Sentence rhythm/);
assert.match(formattedContext, /Recently learned vocabulary: negotiate/);
assert.doesNotMatch(formattedContext, /DATABASE_URL|OPENAI_API_KEY/);
console.log("Learner profile calculation test passed.");