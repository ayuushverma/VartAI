"use client";

import { create } from "zustand";

export type SessionEvaluation = {
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
  setSessionResult: (result: {
    evaluation: SessionEvaluation;
    scenario: string;
  }) => void;
  clearSessionResult: () => void;
};

export const useSessionEvaluationStore = create<SessionEvaluationState>(
  (set) => ({
    evaluation: null,
    scenario: "",
    setSessionResult: ({ evaluation, scenario }) =>
      set({ evaluation, scenario }),
    clearSessionResult: () => set({ evaluation: null, scenario: "" }),
  }),
);
