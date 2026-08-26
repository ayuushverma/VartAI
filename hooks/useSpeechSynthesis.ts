"use client";

import { useCallback, useEffect, useState } from "react";

export function useSpeechSynthesis() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.setTimeout(
      () =>
        setIsSupported(
          "speechSynthesis" in window && "SpeechSynthesisUtterance" in window,
        ),
      0,
    );
    return () => window.speechSynthesis?.cancel();
  }, []);

  const stopSpeaking = useCallback(() => {
    if (!("speechSynthesis" in window)) {
      return;
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const speak = useCallback((text: string) => {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      setError("Audio playback isn't supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    setError(null);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      setError("VartAI could not play this message aloud.");
    };
    window.speechSynthesis.speak(utterance);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { clearError, error, isSpeaking, isSupported, speak, stopSpeaking };
}