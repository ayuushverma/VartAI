import { knowledgeDocuments, KnowledgeDocument } from "@/lib/rag/knowledge";

type RetrievalOptions = {
  query: string;
  language?: KnowledgeDocument["language"];
  level?: KnowledgeDocument["level"] | "unknown";
  scenario?: string;
  limit?: number;
};

export function retrieveKnowledge({
  query,
  language = "english",
  level = "unknown",
  scenario = "",
  limit = 2,
}: RetrievalOptions): KnowledgeDocument[] {
  const queryWords = meaningfulWords(normalize(query));

  if (queryWords.length < 2 && !hasExplicitLearningIntent(normalize(query))) {
    return [];
  }

  return knowledgeDocuments
    .filter((document) => document.language === language)
    .map((document) => ({ document, score: scoreDocument(document, queryWords, scenario, level) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map(({ document }) => document);
}

function scoreDocument(
  document: KnowledgeDocument,
  queryWords: string[],
  scenario: string,
  level: RetrievalOptions["level"],
) {
  const searchableText = normalize(`${document.title} ${document.content} ${document.tags.join(" ")}`);
  const keywordScore = queryWords.reduce(
    (score, word) => score + (searchableText.includes(word) ? 2 : 0),
    0,
  );
  const scenarioWords = meaningfulWords(normalize(scenario));
  const scenarioScore = scenarioWords.reduce(
    (score, word) => score + (document.tags.some((tag) => normalize(tag) === word) ? 4 : 0),
    0,
  );
  const levelScore = level !== "unknown" && document.level === level ? 1 : 0;
  return keywordScore + scenarioScore + levelScore;
}

function hasExplicitLearningIntent(query: string) {
  return ["difference", "explain", "how do", "what is", "grammar", "pronunciation", "phrase", "politely"].some(
    (term) => query.includes(term),
  );
}

function meaningfulWords(value: string) {
  return value
    .split(/[^a-záéíóúñü]+/i)
    .filter((word) => word.length >= 3 && !["the", "and", "how", "are", "you", "can", "for"].includes(word));
}

function normalize(value: string) {
  return value.toLocaleLowerCase();
}