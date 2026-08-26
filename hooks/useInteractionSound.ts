"use client";

import { useCallback, useState } from "react";

type InteractionSound = "tap" | "success" | "complete";

export function useInteractionSound() {
  const [enabled, setEnabled] = useState(false);

  const play = useCallback(
    (sound: InteractionSound) => {
      if (!enabled || typeof window === "undefined" || !window.AudioContext) {
        return;
      }

      const context = new window.AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const frequency = sound === "tap" ? 440 : sound === "success" ? 660 : 880;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.04, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.08);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.08);
      void context.close();
    },
    [enabled],
  );

  return { enabled, play, setEnabled };
}