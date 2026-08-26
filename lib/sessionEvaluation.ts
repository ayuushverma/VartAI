import { db } from "@/lib/db";

export type EvaluationLearningData = {
  grammar: {
    original: string;
    correction: string;
    explanation: string;
  }[];
  vocabulary: {
    word: string;
    meaning: string;
    example: string;
  }[];
};

export type EvaluationScores = {
  fluency: number;
  grammar: number;
  vocabulary: number;
  communication: number;
};

export async function persistSessionEvaluation({
  conversationId,
  scores,
  strengths,
  areasToImprove,
  recommendations,
  learning,
}: {
  conversationId: string;
  scores: EvaluationScores;
  strengths: string[];
  areasToImprove: string[];
  recommendations: string[];
  learning: EvaluationLearningData;
}) {
  return db.$transaction(async (transaction) => {
    const evaluation = await transaction.sessionEvaluation.upsert({
      where: { conversationId },
      create: {
        conversationId,
        fluency: scores.fluency,
        grammar: scores.grammar,
        vocabulary: scores.vocabulary,
        communication: scores.communication,
        strengths,
        areasToImprove,
        recommendations,
      },
      update: {
        fluency: scores.fluency,
        grammar: scores.grammar,
        vocabulary: scores.vocabulary,
        communication: scores.communication,
        strengths,
        areasToImprove,
        recommendations,
      },
    });

    const existingMistakes = await transaction.mistake.findMany({
      where: { conversationId },
      select: { original: true, correction: true, explanation: true },
    });
    const existingMistakeKeys = new Set(
      existingMistakes.map((mistake) =>
        JSON.stringify([
          mistake.original,
          mistake.correction,
          mistake.explanation,
        ]),
      ),
    );
    const newMistakes = learning.grammar.filter((mistake) => {
      const key = JSON.stringify([
        mistake.original,
        mistake.correction,
        mistake.explanation,
      ]);
      if (existingMistakeKeys.has(key)) {
        return false;
      }
      existingMistakeKeys.add(key);
      return true;
    });

    const existingVocabulary = await transaction.vocabulary.findMany({
      where: { conversationId },
      select: { word: true, meaning: true, example: true },
    });
    const existingVocabularyKeys = new Set(
      existingVocabulary.map((item) =>
        JSON.stringify([item.word, item.meaning, item.example]),
      ),
    );
    const newVocabulary = learning.vocabulary.filter((item) => {
      const key = JSON.stringify([item.word, item.meaning, item.example]);
      if (existingVocabularyKeys.has(key)) {
        return false;
      }
      existingVocabularyKeys.add(key);
      return true;
    });

    if (newMistakes.length > 0) {
      await transaction.mistake.createMany({
        data: newMistakes.map((mistake) => ({
          conversationId,
          original: mistake.original,
          correction: mistake.correction,
          explanation: mistake.explanation,
        })),
      });
    }

    if (newVocabulary.length > 0) {
      await transaction.vocabulary.createMany({
        data: newVocabulary.map((item) => ({
          conversationId,
          word: item.word,
          meaning: item.meaning,
          example: item.example,
        })),
      });
    }

    return evaluation;
  });
}

export async function getSessionEvaluationByConversationId(
  conversationId: string,
) {
  return db.sessionEvaluation.findUnique({
    where: { conversationId },
    include: {
      conversation: {
        select: {
          id: true,
          scenario: true,
          userId: true,
          mistakes: { orderBy: { createdAt: "asc" } },
          vocabulary: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  });
}