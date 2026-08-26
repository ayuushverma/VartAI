"use client";

import { create } from "zustand";

export type SessionEvaluation = {
  earnedXp?: number;
  scores: {
    fluency: number;
    grammar: number;
    vocabulary: number;
    communication: number;
  };
  strengths: string[];
  areas_to_improve: string[];
  recommendations: string[];
};

type SessionEvaluationState = {
  evaluation: SessionEvaluation | null;
  scenario: string;
  conversationId: string | null;
  setSessionResult: (result: {
    evaluation: SessionEvaluation;
    scenario: string;
    conversationId: string;
  }) => void;
  clearSessionResult: () => void;
};

export const useSessionEvaluationStore = create<SessionEvaluationState>(
  (set) => ({
    evaluation: null,
    scenario: "",
    conversationId: null,
    setSessionResult: ({ evaluation, scenario, conversationId }) =>
      set({ evaluation, scenario, conversationId }),
    clearSessionResult: () =>
      set({ evaluation: null, scenario: "", conversationId: null }),
  }),
);
