import { db } from "@/lib/db";

type EvaluationRecord = {
  fluency: number;
  grammar: number;
  vocabulary: number;
  communication: number;
  strengths: string[];
  areasToImprove: string[];
  createdAt: Date;
};

type MistakeRecord = {
  original: string;
  correction: string;
  explanation: string;
  createdAt: Date;
};

type VocabularyRecord = {
  word: string;
  meaning: string;
  example: string;
  createdAt: Date;
};

export type LearnerProfileInput = {
  completedConversations: number;
  evaluations: EvaluationRecord[];
  mistakes: MistakeRecord[];
  vocabulary: VocabularyRecord[];
};

export type LearnerProfile = {
  completedConversations: number;
  averageScores: {
    fluency: number | null;
    grammar: number | null;
    vocabulary: number | null;
    communication: number | null;
  };
  commonGrammarMistakes: string[];
  frequentlyLearnedVocabulary: string[];
  recentWeaknesses: string[];
  recentStrengths: string[];
};

const scoreKeys = ["fluency", "grammar", "vocabulary", "communication"] as const;

const weaknessPatterns = [
  { label: "Past tense", terms: ["past tense", "past", "yesterday", "went", "did"] },
  { label: "Articles", terms: ["article", " a ", " an ", " the "] },
  { label: "Prepositions", terms: ["preposition", " in ", " on ", " at ", " to ", "for "] },
  { label: "Word order", terms: ["word order", "sentence structure"] },
  { label: "Verb agreement", terms: ["verb agreement", "subject-verb", "third person"] },
];

export function calculateLearnerProfile(input: LearnerProfileInput): LearnerProfile {
  const recentEvaluations = [...input.evaluations]
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
  const recentMistakes = [...input.mistakes]
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
  const recentVocabulary = [...input.vocabulary]
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());

  const averageScores = Object.fromEntries(
    scoreKeys.map((key) => [key, average(recentEvaluations.map((evaluation) => evaluation[key]))]),
  ) as LearnerProfile["averageScores"];

  const mistakeCounts = new Map<string, number>();
  for (const mistake of recentMistakes) {
    const text = ` ${mistake.original} ${mistake.correction} ${mistake.explanation} `.toLowerCase();
    for (const pattern of weaknessPatterns) {
      if (pattern.terms.some((term) => text.includes(term))) {
        mistakeCounts.set(pattern.label, (mistakeCounts.get(pattern.label) ?? 0) + 1);
      }
    }
  }

  const recurringWeaknesses = [...mistakeCounts.entries()]
    .filter(([, count]) => count >= 2)
    .sort((left, right) => right[1] - left[1])
    .map(([label]) => label);
  const recentAreas = recentEvaluations.flatMap((evaluation) => evaluation.areasToImprove);
  const recentWeaknesses = unique([...recurringWeaknesses, ...recentAreas]).slice(0, 5);
  const recentStrengths = unique(
    recentEvaluations
      .filter((evaluation) => evaluation.strengths.length > 0)
      .flatMap((evaluation) => evaluation.strengths),
  ).slice(0, 5);

  const vocabularyCounts = new Map<string, number>();
  for (const item of recentVocabulary) {
    const word = item.word.trim();
    const key = word.toLowerCase();
    vocabularyCounts.set(key, (vocabularyCounts.get(key) ?? 0) + 1);
  }
  const frequentlyLearnedVocabulary = [...vocabularyCounts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 10)
    .map(([word]) => word);

  return {
    completedConversations: input.completedConversations,
    averageScores,
    commonGrammarMistakes: recurringWeaknesses,
    frequentlyLearnedVocabulary,
    recentWeaknesses,
    recentStrengths,
  };
}

export function buildPersonalizationContext(profile: LearnerProfile) {
  return {
    approximateLevel: getApproximateLevel(profile.averageScores),
    strengths: profile.recentStrengths,
    weakAreas: profile.recentWeaknesses,
    recentVocabulary: profile.frequentlyLearnedVocabulary,
    averageScores: profile.averageScores,
    completedConversations: profile.completedConversations,
  };
}

export function formatPersonalizationContext(
  context: ReturnType<typeof buildPersonalizationContext>,
) {
  return [
    "Learner personalization context:",
    `Approximate level: ${context.approximateLevel}`,
    `Completed conversations: ${context.completedConversations}`,
    `Average scores: ${formatScores(context.averageScores)}`,
    `Strengths: ${formatList(context.strengths)}`,
    `Weak areas: ${formatList(context.weakAreas)}`,
    `Recently learned vocabulary: ${formatList(context.recentVocabulary)}`,
  ].join("\n");
}

export async function getLearnerProfile(userId: string): Promise<LearnerProfile> {
  const conversations = await db.conversation.findMany({
    where: { userId, endedAt: { not: null } },
    select: {
      sessionEvaluation: {
        select: {
          fluency: true,
          grammar: true,
          vocabulary: true,
          communication: true,
          strengths: true,
          areasToImprove: true,
          createdAt: true,
        },
      },
      mistakes: {
        select: { original: true, correction: true, explanation: true, createdAt: true },
      },
      vocabulary: {
        select: { word: true, meaning: true, example: true, createdAt: true },
      },
    },
  });

  return calculateLearnerProfile({
    completedConversations: conversations.length,
    evaluations: conversations.flatMap((conversation) => conversation.sessionEvaluation ? [conversation.sessionEvaluation] : []),
    mistakes: conversations.flatMap((conversation) => conversation.mistakes),
    vocabulary: conversations.flatMap((conversation) => conversation.vocabulary),
  });
}

function average(values: number[]) {
  if (values.length === 0) {
    return null;
  }
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function unique(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function getApproximateLevel(scores: LearnerProfile["averageScores"]) {
  const availableScores = scoreKeys.flatMap((key) => scores[key] === null ? [] : [scores[key]]);
  const averageScore = availableScores.length > 0
    ? availableScores.reduce((sum, score) => sum + score, 0) / availableScores.length
    : null;
  if (averageScore === null) return "unknown" as const;
  if (averageScore >= 80) return "advanced" as const;
  if (averageScore >= 60) return "intermediate" as const;
  return "beginner" as const;
}

function formatList(values: string[]) {
  return values.length > 0 ? values.join(", ") : "none recorded";
}

function formatScores(scores: LearnerProfile["averageScores"]) {
  return scoreKeys
    .map((key) => `${key} ${scores[key] === null ? "n/a" : scores[key]}`)
    .join(", ");
}