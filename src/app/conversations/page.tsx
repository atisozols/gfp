"use client";

import { useState, useEffect, useCallback } from "react";
import { Shuffle, Check, MessageCircle, Sparkles } from "lucide-react";
import XPBar from "@/components/XPBar";
import AchievementToast from "@/components/AchievementToast";
import { conversationTopics, XP_PER_CONVERSATION } from "@/lib/data";
import { getState, saveState, addXP, checkAchievements } from "@/lib/gameStore";
import type { GameState, ConversationTopic } from "@/lib/types";

const categories = [
  { key: "all", label: "All", emoji: "✨" },
  { key: "dreams", label: "Dreams", emoji: "🌟" },
  { key: "fears", label: "Fears", emoji: "😰" },
  { key: "memories", label: "Memories", emoji: "📸" },
  { key: "values", label: "Values", emoji: "⚖️" },
  { key: "future", label: "Future", emoji: "🔮" },
  { key: "hypothetical", label: "What If", emoji: "🤔" },
  { key: "emotional", label: "Emotional", emoji: "💗" },
  { key: "fun", label: "Fun", emoji: "🎲" },
];

const depthLabels = {
  1: { label: "Light", color: "bg-green-100 text-green-700" },
  2: { label: "Medium", color: "bg-yellow-100 text-yellow-700" },
  3: { label: "Deep", color: "bg-purple-100 text-purple-700" },
};

export default function ConversationsPage() {
  const [state, setState] = useState<GameState | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentTopic, setCurrentTopic] = useState<ConversationTopic | null>(
    null,
  );
  const [newAchievements, setNewAchievements] = useState<string[]>([]);

  useEffect(() => {
    setState(getState());
  }, []);

  const filteredTopics =
    activeCategory === "all"
      ? conversationTopics
      : conversationTopics.filter((t) => t.category === activeCategory);

  const getRandomTopic = useCallback(() => {
    const available = filteredTopics.filter(
      (t) => !state?.completedConversations.includes(t.id),
    );
    const pool = available.length > 0 ? available : filteredTopics;
    const random = pool[Math.floor(Math.random() * pool.length)];
    setCurrentTopic(random);
  }, [filteredTopics, state]);

  const markComplete = useCallback(
    (topicId: string) => {
      if (!state) return;
      let newState = addXP({ ...state }, XP_PER_CONVERSATION);
      newState.totalConversations += 1;
      if (!newState.completedConversations.includes(topicId)) {
        newState.completedConversations = [
          ...newState.completedConversations,
          topicId,
        ];
      }
      const { state: achievedState, newAchievements: unlocked } =
        checkAchievements(newState);
      if (unlocked.length > 0) setNewAchievements(unlocked);
      setState(achievedState);
      saveState(achievedState);
      setCurrentTopic(null);
    },
    [state],
  );

  if (!state) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-pink-300 border-t-pink-600" />
      </div>
    );
  }

  const completedCount = state.completedConversations.length;

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-6">
      <AchievementToast
        achievementIds={newAchievements}
        onDismiss={() => setNewAchievements([])}
      />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Deep Conversations</h1>
        <p className="text-sm text-gray-500">
          Go beyond the surface · {completedCount}/{conversationTopics.length}{" "}
          explored
        </p>
      </div>

      <div className="mb-6">
        <XPBar xp={state.xp} level={state.level} streak={state.streak} />
      </div>

      {/* Random topic generator */}
      {!currentTopic ? (
        <button
          onClick={getRandomTopic}
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-purple-500 to-pink-500 px-6 py-4 text-white shadow-lg transition-transform active:scale-95"
        >
          <Sparkles size={20} />
          <span className="font-semibold">Draw a Conversation Topic</span>
        </button>
      ) : (
        <div className="mb-6 rounded-2xl bg-linear-to-br from-purple-50 to-pink-50 p-5 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${depthLabels[currentTopic.depth].color}`}
            >
              {depthLabels[currentTopic.depth].label}
            </span>
            <span className="text-xs text-gray-400">
              {currentTopic.category}
            </span>
          </div>
          <p className="mb-2 text-lg font-semibold text-gray-800">
            {currentTopic.topic}
          </p>
          <p className="mb-4 text-sm text-gray-500">
            {currentTopic.description}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => markComplete(currentTopic.id)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-medium text-white transition-all active:scale-95"
            >
              <Check size={16} />
              We talked about it!
            </button>
            <button
              onClick={getRandomTopic}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-200 active:scale-95"
            >
              <Shuffle size={16} />
              Skip
            </button>
          </div>
        </div>
      )}

      {/* Category filter */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              activeCategory === cat.key
                ? "bg-pink-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Topic list */}
      <div className="space-y-2">
        {filteredTopics.map((topic) => {
          const isCompleted = state.completedConversations.includes(topic.id);
          return (
            <div
              key={topic.id}
              className={`rounded-2xl border-2 p-4 transition-all ${
                isCompleted
                  ? "border-green-200 bg-green-50/50"
                  : "border-gray-100 bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${depthLabels[topic.depth].color}`}
                    >
                      {depthLabels[topic.depth].label}
                    </span>
                    {isCompleted && (
                      <span className="text-[10px] text-green-600">✓ Done</span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-800">
                    {topic.topic}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {topic.description}
                  </p>
                </div>
                {!isCompleted && (
                  <button
                    onClick={() => markComplete(topic.id)}
                    className="shrink-0 rounded-xl bg-gray-100 p-2 text-gray-400 transition-all hover:bg-green-100 hover:text-green-600"
                  >
                    <Check size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
