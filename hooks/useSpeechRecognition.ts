"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  abort: () => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

type SpeechRecognitionOptions = {
  language?: string;
  onTranscript?: (transcript: string) => void;
};

export function useSpeechRecognition({
  language = "en-US",
  onTranscript,
}: SpeechRecognitionOptions = {}) {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const isListeningRef = useRef(false);
  const manuallyStoppedRef = useRef(false);
  const hadRecognitionErrorRef = useRef(false);
  const transcriptRef = useRef("");
  const onTranscriptRef = useRef(onTranscript);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) {
      return;
    }

    window.setTimeout(() => setIsSupported(true), 0);
    const recognition = new Recognition();
      recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language;
      recognition.onstart = () => {
        isListeningRef.current = true;
        setIsListening(true);
      };
    recognition.onresult = (event) => {
      let nextTranscript = "";
      for (let index = 0; index < event.results.length; index += 1) {
        nextTranscript += event.results[index][0].transcript;
      }
      const trimmedTranscript = nextTranscript.trim();
        transcriptRef.current = trimmedTranscript;
      setTranscript(trimmedTranscript);
      if (trimmedTranscript) {
        setError(null);
      }
        onTranscriptRef.current?.(trimmedTranscript);
    };
    recognition.onerror = (event) => {
        hadRecognitionErrorRef.current = true;
        isListeningRef.current = false;
      setIsListening(false);
      setError(
        event.error === "not-allowed" || event.error === "service-not-allowed"
          ? "Microphone permission is required for voice practice."
          : "Voice input stopped unexpectedly. You can still type.",
      );
    };
      recognition.onend = () => {
        isListeningRef.current = false;
        setIsListening(false);

        if (
          !manuallyStoppedRef.current &&
          !hadRecognitionErrorRef.current &&
          !transcriptRef.current
        ) {
          setError("Voice input ended before speech was detected. You can still type.");
        }

        manuallyStoppedRef.current = false;
        hadRecognitionErrorRef.current = false;
      };
    recognitionRef.current = recognition;

    return () => {
        manuallyStoppedRef.current = true;
      recognition.abort();
        isListeningRef.current = false;
      recognitionRef.current = null;
    };
  }, [language]);

  const startListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      setError("Voice input isn't supported in this browser. You can still type.");
      return;
    }

      if (isListeningRef.current) {
        return;
      }

    setError(null);
      manuallyStoppedRef.current = false;
      hadRecognitionErrorRef.current = false;
      transcriptRef.current = "";
    try {
      recognition.start();
    } catch {
        isListeningRef.current = false;
      setError("Voice input could not start. You can still type.");
    }
  }, []);

  const stopListening = useCallback(() => {
      if (!isListeningRef.current) {
        return;
      }
      manuallyStoppedRef.current = true;
      recognitionRef.current?.stop();
      isListeningRef.current = false;
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => setTranscript(""), []);
  const clearError = useCallback(() => setError(null), []);

  return {
    clearError,
    error,
    isListening,
    isSupported,
    resetTranscript,
    startListening,
    stopListening,
    transcript,
  };
}