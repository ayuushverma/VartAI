import { KnowledgeDocument } from "@/lib/rag/knowledge";

export function formatRetrievedKnowledge(documents: KnowledgeDocument[]) {
  if (documents.length === 0) {
    return "";
  }

  return [
    "Retrieved learning reference:",
    ...documents.map(
      (document) => `[${document.title}] ${document.content}`,
    ),
  ].join("\n");
}