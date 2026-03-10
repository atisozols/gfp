"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, BookOpen, ChevronRight, EyeOff } from "lucide-react";
import XPBar from "@/components/XPBar";
import AchievementToast from "@/components/AchievementToast";
import { discoverQuestions, XP_PER_DISCOVER } from "@/lib/data";
import { getState, saveState, addXP, checkAchievements } from "@/lib/gameStore";
import type { GameState } from "@/lib/types";

const categories = [
  { key: "all", label: "All", emoji: "📖" },
  { key: "childhood", label: "Childhood", emoji: "🧒" },
  { key: "family", label: "Family", emoji: "👨‍👩‍👧" },
  { key: "preferences", label: "Preferences", emoji: "💜" },
  { key: "dreams", label: "Dreams", emoji: "✨" },
  { key: "past", label: "Past", emoji: "📜" },
  { key: "beliefs", label: "Beliefs", emoji: "🕊️" },
  { key: "daily-life", label: "Daily Life", emoji: "☀️" },
  { key: "relationships", label: "Relationships", emoji: "💕" },
];

export default function DiscoverPage() {
  const [state, setState] = useState<GameState | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [newAchievements, setNewAchievements] = useState<string[]>([]);

  useEffect(() => {
    setState(getState());
    const stored = localStorage.getItem("discover-notes");
    if (stored) setNotes(JSON.parse(stored));
  }, []);

  const markComplete = useCallback(
    (questionId: string) => {
      if (!state) return;
      if (state.completedDiscovers.includes(questionId)) return;

      let newState = addXP({ ...state }, XP_PER_DISCOVER);
      newState.totalDiscovers += 1;
      newState.completedDiscovers = [
        ...newState.completedDiscovers,
        questionId,
      ];

      const { state: achievedState, newAchievements: unlocked } =
        checkAchievements(newState);
      if (unlocked.length > 0) setNewAchievements(unlocked);
      setState(achievedState);
      saveState(achievedState);
    },
    [state],
  );

  const markDismissed = useCallback(
    (questionId: string) => {
      if (!state) return;
      if (
        state.completedDiscovers.includes(questionId) ||
        state.dismissedDiscovers.includes(questionId)
      ) {
        return;
      }

      const newState = {
        ...state,
        dismissedDiscovers: [...state.dismissedDiscovers, questionId],
      };

      setState(newState);
      saveState(newState);
      if (expandedId === questionId) {
        setExpandedId(null);
      }
    },
    [state, expandedId],
  );

  const saveNote = useCallback(
    (questionId: string, note: string) => {
      const newNotes = { ...notes, [questionId]: note };
      setNotes(newNotes);
      localStorage.setItem("discover-notes", JSON.stringify(newNotes));
    },
    [notes],
  );

  if (!state) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-pink-300 border-t-pink-600" />
      </div>
    );
  }

  const activeQuestions = discoverQuestions.filter(
    (q) => !state.dismissedDiscovers.includes(q.id),
  );

  const filteredQuestions =
    activeCategory === "all"
      ? activeQuestions
      : activeQuestions.filter((q) => q.category === activeCategory);

  const completedCount = state.completedDiscovers.length;
  const dismissedCount = state.dismissedDiscovers.length;
  const categoryCompleted = filteredQuestions.filter((q) =>
    state.completedDiscovers.includes(q.id),
  ).length;
  const progressPercentage =
    filteredQuestions.length === 0
      ? 0
      : (categoryCompleted / filteredQuestions.length) * 100;

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-6">
      <AchievementToast
        achievementIds={newAchievements}
        onDismiss={() => setNewAchievements([])}
      />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Discover Her</h1>
        <p className="text-sm text-gray-500">
          Learn something new · {completedCount}/{activeQuestions.length}{" "}
          answered
        </p>
        {dismissedCount > 0 && (
          <p className="mt-1 text-xs text-gray-400">
            {dismissedCount} marked as already known
          </p>
        )}
      </div>

      <div className="mb-6">
        <XPBar xp={state.xp} level={state.level} streak={state.streak} />
      </div>

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

      {/* Progress for category */}
      <div className="mb-4 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-pink-400 transition-all duration-500"
            style={{
              width: `${progressPercentage}%`,
            }}
          />
        </div>
        <span className="text-xs text-gray-500">
          {categoryCompleted}/{filteredQuestions.length}
        </span>
      </div>

      {/* Questions */}
      <div className="space-y-2">
        {filteredQuestions.map((q) => {
          const isCompleted = state.completedDiscovers.includes(q.id);
          const isDismissed = state.dismissedDiscovers.includes(q.id);
          const isExpanded = expandedId === q.id;

          return (
            <div
              key={q.id}
              className={`rounded-2xl border-2 transition-all ${
                isCompleted
                  ? "border-pink-200 bg-pink-50/50"
                  : isDismissed
                    ? "border-gray-200 bg-gray-50"
                    : "border-gray-100 bg-white"
              }`}
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : q.id)}
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                {isCompleted ? (
                  <Check size={18} className="shrink-0 text-pink-500" />
                ) : isDismissed ? (
                  <EyeOff size={18} className="shrink-0 text-gray-400" />
                ) : (
                  <BookOpen size={18} className="shrink-0 text-gray-300" />
                )}
                <span className="flex-1 text-sm font-medium text-gray-800">
                  {q.question}
                </span>
                <ChevronRight
                  size={16}
                  className={`shrink-0 text-gray-400 transition-transform ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                />
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100 px-4 pb-4 pt-3">
                  <textarea
                    placeholder="Write down her answer here so you remember..."
                    value={notes[q.id] || ""}
                    onChange={(e) => saveNote(q.id, e.target.value)}
                    className="mb-3 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-200"
                    rows={3}
                  />
                  {!isCompleted && !isDismissed && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => markComplete(q.id)}
                        className="flex items-center gap-1.5 rounded-xl bg-pink-500 px-4 py-2 text-sm font-medium text-white transition-all active:scale-95"
                      >
                        <Check size={14} />I learned this about her
                      </button>
                      <button
                        onClick={() => markDismissed(q.id)}
                        className="flex items-center gap-1.5 rounded-xl bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-all active:scale-95"
                      >
                        <EyeOff size={14} />
                        Already know this
                      </button>
                    </div>
                  )}
                  {isCompleted && notes[q.id] && (
                    <p className="text-xs text-pink-500">
                      💡 You know this! Saved.
                    </p>
                  )}
                  {isDismissed && (
                    <p className="text-xs text-gray-500">
                      Hidden from your active discover pool because you already
                      know it.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredQuestions.length === 0 && (
        <div className="mt-8 rounded-2xl bg-white p-5 text-center shadow-sm">
          <p className="text-lg font-semibold text-gray-700">
            No active questions here
          </p>
          <p className="mt-1 text-sm text-gray-400">
            You either completed or already know the questions in this category.
          </p>
        </div>
      )}
    </div>
  );
}
