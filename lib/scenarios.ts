export const scenarios = [
  {
    id: "daily",
    title: "Daily Conversation",
    description: "Build confidence with relaxed, everyday speaking practice.",
    difficulty: "Beginner",
  },
  {
    id: "job-interview",
    title: "Job Interview",
    description: "Practice clear answers to common professional questions.",
    difficulty: "Intermediate",
  },
  {
    id: "travel",
    title: "Travel",
    description: "Handle useful conversations for airports, hotels, and trips.",
    difficulty: "Beginner",
  },
  {
    id: "workplace",
    title: "Meeting / Workplace",
    description: "Speak naturally in meetings and day-to-day work situations.",
    difficulty: "Intermediate",
  },
  {
    id: "free",
    title: "Free Conversation",
    description: "Choose the topic and let the conversation develop naturally.",
    difficulty: "All levels",
  },
] as const;

export function getScenarioTitle(id: string | null | undefined) {
  return scenarios.find((scenario) => scenario.id === id)?.title ?? scenarios[0].title;
}