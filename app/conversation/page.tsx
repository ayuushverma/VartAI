"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AIAvatar } from "./_components/AIAvatar";
import { ChatInput } from "./_components/ChatInput";
import { ConversationHeader } from "./_components/ConversationHeader";
import {
  LearningFeedback,
  Message,
  MessageBubble,
} from "./_components/MessageBubble";
import {
  SessionEvaluation,
  useSessionEvaluationStore,
} from "@/lib/sessionEvaluationStore";
import { getScenarioTitle } from "@/lib/scenarios";
import { defaultLearningLanguage } from "@/lib/languages";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

const initialMessages: Message[] = [
  {
    id: 1,
    role: "assistant",
    text: "Hey! Let's practice English. Tell me about yourself.",
  },
];

type ChatApiResponse = {
  message?: string;
  role?: "assistant";
  feedback?: LearningFeedback;
  error?: string;
};

type ConversationApiResponse = {
  conversationId?: string;
  error?: string;
};

type EvaluationApiResponse = SessionEvaluation & {
  conversationId?: string;
  error?: string;
};

export default function ConversationPage() {
  return (
    <Suspense fallback={<ConversationLoadingState />}>
      <ConversationPageContent />
    </Suspense>
  );
}

function ConversationPageContent() {
  const searchParams = useSearchParams();
  const selectedScenario = getScenarioTitle(searchParams.get("scenario"));
  const router = useRouter();
  const setSessionResult = useSessionEvaluationStore(
    (state) => state.setSessionResult,
  );
  const [draftMessage, setDraftMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(true);
  const [inputMode, setInputMode] = useState<"text" | "voice">("text");
  const [speakingMessageId, setSpeakingMessageId] = useState<number | null>(null);
  const conversationCreationStarted = useRef(false);
  const conversationCreationPromise = useRef<Promise<string> | null>(null);
  const speechRecognition = useSpeechRecognition({
    language: defaultLearningLanguage.speechRecognitionCode,
    onTranscript: setDraftMessage,
  });
  const speechSynthesis = useSpeechSynthesis();

  useEffect(() => {
    if (conversationCreationStarted.current) {
      return;
    }

    conversationCreationStarted.current = true;
    let isMounted = true;

    const creationPromise = fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario: selectedScenario }),
    }).then(async (response) => {
      const data = (await response.json()) as ConversationApiResponse;

      if (!response.ok || !data.conversationId) {
        throw new Error(data.error || "VartAI could not start this conversation.");
      }

      return data.conversationId;
    });

    conversationCreationPromise.current = creationPromise;
    void creationPromise
      .then((createdConversationId) => {
        if (isMounted) {
          setConversationId(createdConversationId);
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "VartAI could not start this conversation.",
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsStarting(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedScenario]);

  async function sendMessage() {
    const trimmedMessage = draftMessage.trim();

    if (!trimmedMessage || isTyping || isEnding) {
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      text: trimmedMessage,
    };
    const nextMessages = [...messages, userMessage];
    const requestId = crypto.randomUUID();

    setMessages(nextMessages);
    setDraftMessage("");
    setErrorMessage("");
    setIsTyping(true);

    try {
      const activeConversationId =
        conversationId ?? (await conversationCreationPromise.current);

      if (!activeConversationId) {
        throw new Error("VartAI could not start this conversation.");
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scenario: selectedScenario,
          conversationId: activeConversationId,
          requestId,
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.text,
          })),
        }),
      });

      const data = (await response.json()) as ChatApiResponse;

      if (!response.ok || !data.message) {
        throw new Error(
          response.status === 429
            ? "VartAI is temporarily unavailable because the AI usage limit was reached. Please try again later."
            : data.error || "VartAI could not respond right now.",
        );
      }

      const assistantMessage = data.message;

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: assistantMessage,
          feedback: data.feedback,
        },
      ]);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "VartAI could not respond right now.",
      );
    } finally {
      setIsTyping(false);
    }
  }

  function updateDraftMessage(nextMessage: string) {
    setDraftMessage(nextMessage);

    if (errorMessage) {
      setErrorMessage("");
    }
  }

  function toggleListening() {
    if (speechRecognition.isListening) {
      speechRecognition.stopListening();
      return;
    }
    speechRecognition.resetTranscript();
    speechRecognition.startListening();
  }

  function changeInputMode(mode: "text" | "voice") {
    speechRecognition.clearError();
    speechSynthesis.clearError();
    setInputMode(mode);
  }

  function sendCurrentMessage() {
    speechRecognition.stopListening();
    speechRecognition.clearError();
    speechSynthesis.clearError();
    void sendMessage();
  }

  async function endConversation() {
    const hasUserMessage = messages.some((message) => message.role === "user");

    if (isTyping || isEnding || isStarting || !conversationId || !hasUserMessage) {
      setErrorMessage(
        hasUserMessage
          ? ""
          : "Send at least one message before ending the conversation.",
      );
      return;
    }

    setErrorMessage("");
    setIsEnding(true);

    try {
      const learning: {
        grammar: LearningFeedback["grammar"];
        vocabulary: LearningFeedback["vocabulary"];
      } = { grammar: [], vocabulary: [] };

      for (const message of messages) {
        if (message.feedback) {
          learning.grammar.push(...message.feedback.grammar);
          learning.vocabulary.push(...message.feedback.vocabulary);
        }
      }

      const closeResponse = await fetch(`/api/conversations/${conversationId}`, {
        method: "PATCH",
      });

      const closeData = (await closeResponse.json()) as { error?: string };

      if (!closeResponse.ok) {
        throw new Error(
          closeData.error || "VartAI could not end this conversation.",
        );
      }

      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scenario: selectedScenario,
          conversationId,
          messages: messages.map((message) => ({
            role: message.role,
            content: message.text,
          })),
          learning,
        }),
      });
      const data = (await response.json()) as EvaluationApiResponse;

      if (!response.ok || data.error) {
        throw new Error(data.error || "VartAI could not evaluate this session.");
      }

      setSessionResult({
        evaluation: data,
        scenario: selectedScenario,
        conversationId: data.conversationId || conversationId,
      });
      router.push("/session");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "VartAI could not evaluate this session.",
      );
    } finally {
      setIsEnding(false);
    }
  }

  return (
    <main className="v-page text-white">
      <section className="v-shell mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col overflow-hidden">
        <ConversationHeader
          isEnding={isEnding}
          isStarting={isStarting}
          onEndConversation={endConversation}
          scenario={selectedScenario}
        />

        <div className="grid min-h-0 flex-1 gap-4 p-5 sm:p-8 lg:grid-cols-[340px_1fr]">
          <AIAvatar status={isTyping ? "thinking" : speechRecognition.isListening ? "listening" : "idle"} />

          <section className="v-panel flex min-h-[560px] flex-col overflow-hidden">
            <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
              {messages.map((message) => (
                <MessageBubble
                  isSpeaking={speechSynthesis.isSpeaking && speakingMessageId === message.id}
                  key={message.id}
                  message={message}
                  onSpeak={
                    message.role === "assistant" && speechSynthesis.isSupported
                      ? (text) => {
                          if (speakingMessageId === message.id) {
                            speechSynthesis.stopSpeaking();
                          } else {
                            setSpeakingMessageId(message.id);
                            speechSynthesis.speak(text);
                          }
                        }
                      : undefined
                  }
                />
              ))}

              {isTyping ? (
                <div className="flex justify-start">
                    <div className="v-fade-up rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-slate-400">
                      VartAI is thinking...
                  </div>
                </div>
              ) : null}

              {errorMessage ? (
                <div className="v-fade-up rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
                  {errorMessage}
                </div>
              ) : null}
            </div>

            <ChatInput
              disabled={isTyping || isEnding}
              isListening={speechRecognition.isListening}
              isVoiceSupported={speechRecognition.isSupported}
              voiceError={speechRecognition.error || speechSynthesis.error}
              message={draftMessage}
              mode={inputMode}
              onChange={updateDraftMessage}
              onModeChange={changeInputMode}
              onSend={sendCurrentMessage}
              onToggleListening={toggleListening}
            />
          </section>
        </div>
      </section>
    </main>
  );
}

function ConversationLoadingState() {
  return (
    <main className="min-h-screen bg-[#07090c] px-5 py-6 text-white sm:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl items-center justify-center rounded-lg border border-white/10 bg-[#10141a]">
        <p className="text-sm text-slate-400">Loading practice session...</p>
      </section>
    </main>
  );
}
