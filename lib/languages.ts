export const learningLanguages = {
  english: { label: "English", speechRecognitionCode: "en-US" },
  spanish: { label: "Spanish", speechRecognitionCode: "es-ES" },
} as const;

export const defaultLearningLanguage = learningLanguages.english;