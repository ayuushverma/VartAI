export type KnowledgeCategory =
  | "grammar"
  | "vocabulary"
  | "conversation"
  | "pronunciation"
  | "scenario";

export type KnowledgeDocument = {
  id: string;
  title: string;
  category: KnowledgeCategory;
  language: "english" | "spanish";
  level: "beginner" | "intermediate" | "advanced";
  content: string;
  tags: string[];
};

export const knowledgeDocuments: KnowledgeDocument[] = [
  {
    id: "grammar-past-tense",
    title: "Talking about completed actions",
    category: "grammar",
    language: "english",
    level: "beginner",
    content: "Use the simple past for finished actions. Regular verbs often end in -ed, while common irregular verbs include go/went and buy/bought. Use did for many past-tense questions.",
    tags: ["past", "past tense", "yesterday", "did", "irregular verbs"],
  },
  {
    id: "grammar-articles",
    title: "Using a, an, and the",
    category: "grammar",
    language: "english",
    level: "beginner",
    content: "Use a before a consonant sound, an before a vowel sound, and the when the listener knows which specific thing you mean.",
    tags: ["articles", "a", "an", "the", "grammar"],
  },
  {
    id: "vocabulary-polite-requests",
    title: "Polite requests",
    category: "vocabulary",
    language: "english",
    level: "beginner",
    content: "Could I have...?, Would you mind...?, and I'd like... are useful polite phrases for making requests. Add please when it sounds natural.",
    tags: ["polite", "request", "please", "could", "would", "ask"],
  },
  {
    id: "travel-restaurant",
    title: "Ordering at a restaurant",
    category: "scenario",
    language: "english",
    level: "beginner",
    content: "Useful restaurant phrases include: Could I see the menu?, I'd like to order..., Could we have the bill, please?, and Is service included?",
    tags: ["travel", "restaurant", "menu", "bill", "order", "food"],
  },
  {
    id: "workplace-meeting",
    title: "Joining a workplace meeting",
    category: "scenario",
    language: "english",
    level: "intermediate",
    content: "Useful meeting phrases include: Could you clarify that?, I agree with that point, and Shall we come back to this item later?",
    tags: ["workplace", "meeting", "clarify", "agree", "agenda"],
  },
  {
    id: "pronunciation-th",
    title: "The th sound",
    category: "pronunciation",
    language: "english",
    level: "intermediate",
    content: "For the th sound in think, place the tongue lightly between the teeth and let air pass. For the th sound in this, add voice.",
    tags: ["pronunciation", "th", "think", "this", "sound"],
  },
  {
    id: "spanish-greetings",
    title: "Everyday Spanish greetings",
    category: "conversation",
    language: "spanish",
    level: "beginner",
    content: "Hola, ¿cómo estás? is a common informal greeting. Buenos días means good morning, and Mucho gusto means nice to meet you.",
    tags: ["spanish", "greeting", "hola", "buenos días", "introductions"],
  },
];