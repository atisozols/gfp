"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import XPBar from "@/components/XPBar";
import AchievementToast from "@/components/AchievementToast";
import { checkInQuestions, XP_PER_CHECKIN } from "@/lib/data";
import {
  getState,
  saveState,
  addXP,
  updateStreak,
  checkAchievements,
} from "@/lib/gameStore";
import type { GameState } from "@/lib/types";

function getTodayQuestions() {
  const today = new Date();
  const seed =
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate();
  const shuffled = [...checkInQuestions].sort((a, b) => {
    const hashA = ((seed * 31 + a.id.charCodeAt(3)) % 1000) / 1000;
    const hashB = ((seed * 31 + b.id.charCodeAt(3)) % 1000) / 1000;
    return hashA - hashB;
  });
  return shuffled.slice(0, 5);
}

export default function CheckInPage() {
  const [state, setState] = useState<GameState | null>(null);
  const [answered, setAnswered] = useState<Record<string, string>>({});
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const todayQuestions = useMemo(() => getTodayQuestions(), []);

  useEffect(() => {
    setState(getState());
    const todayKey = `checkin-answers-${new Date().toISOString().split("T")[0]}`;
    const stored = localStorage.getItem(todayKey);
    if (stored) setAnswered(JSON.parse(stored));
  }, []);

  const handleAnswer = useCallback(
    (questionId: string, answer: string) => {
      if (!state) return;

      const newAnswered = { ...answered, [questionId]: answer };
      setAnswered(newAnswered);
      const todayKey = `checkin-answers-${new Date().toISOString().split("T")[0]}`;
      localStorage.setItem(todayKey, JSON.stringify(newAnswered));

      let newState = { ...state };
      if (!answered[questionId]) {
        newState = addXP(newState, XP_PER_CHECKIN);
        newState = updateStreak(newState);
        newState.totalCheckIns += 1;
        if (!newState.completedCheckIns.includes(questionId)) {
          newState.completedCheckIns = [
            ...newState.completedCheckIns,
            questionId,
          ];
        }
      }

      const { state: achievedState, newAchievements: unlocked } =
        checkAchievements(newState);
      if (unlocked.length > 0) setNewAchievements(unlocked);
      setState(achievedState);
      saveState(achievedState);
    },
    [state, answered],
  );

  const completedCount = Object.keys(answered).length;
  const totalCount = todayQuestions.length;

  if (!state) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-pink-300 border-t-pink-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-6">
      <AchievementToast
        achievementIds={newAchievements}
        onDismiss={() => setNewAchievements([])}
      />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Daily Check-in</h1>
        <p className="text-sm text-gray-500">
          How did you show up for her today?
        </p>
      </div>

      <div className="mb-6">
        <XPBar xp={state.xp} level={state.level} streak={state.streak} />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100">
            <span className="text-sm font-bold text-pink-600">
              {completedCount}/{totalCount}
            </span>
          </div>
          <span className="text-sm text-gray-600">completed today</span>
        </div>
        {completedCount === totalCount && completedCount > 0 && (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
            All done! ✨
          </span>
        )}
      </div>

      <div className="space-y-3">
        {todayQuestions.map((q) => {
          const isAnswered = answered[q.id] !== undefined;
          return (
            <div
              key={q.id}
              className={`rounded-2xl border-2 p-4 transition-all ${
                isAnswered
                  ? "border-pink-200 bg-pink-50/50"
                  : "border-gray-100 bg-white"
              }`}
            >
              <div className="mb-3 flex items-start gap-2">
                {isAnswered ? (
                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0 text-pink-500"
                  />
                ) : (
                  <Circle size={20} className="mt-0.5 shrink-0 text-gray-300" />
                )}
                <p className="text-sm font-medium text-gray-800">
                  {q.question}
                </p>
              </div>

              {q.type === "yesno" && (
                <div className="flex gap-2 pl-7">
                  <button
                    onClick={() => handleAnswer(q.id, "yes")}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                      answered[q.id] === "yes"
                        ? "bg-pink-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Yes ✓
                  </button>
                  <button
                    onClick={() => handleAnswer(q.id, "no")}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                      answered[q.id] === "no"
                        ? "bg-gray-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Not yet
                  </button>
                  {answered[q.id] === "no" && (
                    <span className="flex items-center text-xs text-gray-400">
                      Go do it now! 💪
                    </span>
                  )}
                </div>
              )}

              {q.type === "scale" && (
                <div className="flex items-center gap-1 pl-7">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => handleAnswer(q.id, String(n))}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-medium transition-all ${
                        answered[q.id] === String(n)
                          ? "bg-pink-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}

              {q.type === "freeform" && (
                <div className="pl-7">
                  <input
                    type="text"
                    placeholder="Type your answer..."
                    value={answered[q.id] || ""}
                    onChange={(e) => {
                      if (e.target.value.length > 2) {
                        handleAnswer(q.id, e.target.value);
                      }
                    }}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-200"
                  />
                </div>
              )}

              <div className="mt-2 pl-7">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    q.category === "emotional"
                      ? "bg-purple-100 text-purple-600"
                      : q.category === "communication"
                        ? "bg-blue-100 text-blue-600"
                        : q.category === "appreciation"
                          ? "bg-yellow-100 text-yellow-600"
                          : q.category === "quality-time"
                            ? "bg-green-100 text-green-600"
                            : "bg-pink-100 text-pink-600"
                  }`}
                >
                  {q.category}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {completedCount === totalCount && completedCount > 0 && (
        <div className="mt-6 rounded-2xl bg-linear-to-r from-pink-500 to-purple-500 p-4 text-center text-white">
          <p className="text-lg font-bold">Great job today! 🎉</p>
          <p className="text-sm opacity-90">
            You earned {completedCount * XP_PER_CHECKIN} XP. Keep the streak
            going!
          </p>
        </div>
      )}
    </div>
  );
}
