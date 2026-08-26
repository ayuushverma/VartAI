import assert from "node:assert/strict";
import { formatRetrievedKnowledge } from "@/lib/rag/context";
import { retrieveKnowledge } from "@/lib/rag/retrieve";

const pastTense = retrieveKnowledge({
  query: "Can you explain the difference between past tense and present tense?",
  language: "english",
  level: "beginner",
});
assert.equal(pastTense[0]?.id, "grammar-past-tense");

const politeRequest = retrieveKnowledge({
  query: "Can you explain polite requests in English?",
  language: "english",
  level: "beginner",
});
assert.equal(politeRequest[0]?.id, "vocabulary-polite-requests");

const politeBill = retrieveKnowledge({
  query: "How do I politely ask for the bill?",
  language: "english",
  scenario: "Travel",
});
assert.equal(politeBill[0]?.id, "travel-restaurant");

const simpleGreeting = retrieveKnowledge({ query: "Hi", language: "english" });
assert.deepEqual(simpleGreeting, []);

const spanishGreeting = retrieveKnowledge({
  query: "Hola, how do I greet someone?",
  language: "spanish",
});
assert.equal(spanishGreeting[0]?.id, "spanish-greetings");

const workplace = retrieveKnowledge({
  query: "How can I clarify a point?",
  language: "english",
  level: "intermediate",
  scenario: "Meeting / Workplace",
});
assert.equal(workplace[0]?.id, "workplace-meeting");

const context = formatRetrievedKnowledge(pastTense);
assert.match(context, /Retrieved learning reference:/);
assert.match(context, /simple past/);
console.log("RAG retrieval test passed.");