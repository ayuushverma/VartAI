"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

const selectedScenario = "Daily Conversation";

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

type EvaluationApiResponse = SessionEvaluation & {
  error?: string;
};

export default function ConversationPage() {
  const router = useRouter();
  const setSessionResult = useSessionEvaluationStore(
    (state) => state.setSessionResult,
  );
  const [draftMessage, setDraftMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function sendMessage() {
    const trimmedMessage = draftMessage.trim();

    if (!trimmedMessage || isTyping) {
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      text: trimmedMessage,
    };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setDraftMessage("");
    setErrorMessage("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scenario: selectedScenario,
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.text,
          })),
        }),
      });

      const data = (await response.json()) as ChatApiResponse;

      if (!response.ok || !data.message) {
        throw new Error(data.error || "VartAI could not respond right now.");
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

  async function endConversation() {
    const hasUserMessage = messages.some((message) => message.role === "user");

    if (isTyping || isEnding || !hasUserMessage) {
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
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scenario: selectedScenario,
          messages: messages.map((message) => ({
            role: message.role,
            content: message.text,
          })),
        }),
      });
      const data = (await response.json()) as EvaluationApiResponse;

      if (!response.ok || data.error) {
        throw new Error(data.error || "VartAI could not evaluate this session.");
      }

      setSessionResult({
        evaluation: data,
        scenario: selectedScenario,
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
    <main className="min-h-screen bg-[#07090c] px-5 py-6 text-white sm:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col overflow-hidden rounded-lg border border-white/10 bg-[#10141a] shadow-2xl shadow-black/30">
        <ConversationHeader
          isEnding={isEnding}
          onEndConversation={endConversation}
          scenario={selectedScenario}
        />

        <div className="grid min-h-0 flex-1 gap-4 p-5 sm:p-8 lg:grid-cols-[340px_1fr]">
          <AIAvatar />

          <section className="flex min-h-[560px] flex-col overflow-hidden rounded-lg border border-white/10 bg-[#0c1015]">
            <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}

              {isTyping ? (
                <div className="flex justify-start">
                  <div className="rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-slate-400">
                    VartAI is typing...
                  </div>
                </div>
              ) : null}

              {errorMessage ? (
                <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
                  {errorMessage}
                </div>
              ) : null}
            </div>

            <ChatInput
              disabled={isTyping || isEnding}
              message={draftMessage}
              onChange={updateDraftMessage}
              onSend={sendMessage}
            />
          </section>
        </div>
      </section>
    </main>
  );
}
