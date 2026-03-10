"use client";

import { useState, useCallback, useMemo } from "react";
import {
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
} from "lucide-react";
import { weeklyReviewItems, XP_PER_WEEKLY_REVIEW } from "@/lib/data";
import { addXP, checkAchievements, saveState } from "@/lib/gameStore";
import type { GameState, WeeklyRating } from "@/lib/types";

function getWeekKey(): string {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  return monday.toISOString().split("T")[0];
}

function getWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  return Math.ceil(((diff / oneWeek) + start.getDay() + 1) / 7);
}

function getDaysUntilSunday(): number {
  const now = new Date();
  const day = now.getDay();
  return day === 0 ? 0 : 7 - day;
}

interface WeeklyReviewProps {
  state: GameState;
  onStateChange: (state: GameState) => void;
  onAchievements: (ids: string[]) => void;
}

export default function WeeklyReview({
  state,
  onStateChange,
  onAchievements,
}: WeeklyReviewProps) {
  const [expanded, setExpanded] = useState(false);

  const weekKey = useMemo(() => getWeekKey(), []);
  const weekNum = useMemo(() => getWeekNumber(), []);
  const daysLeft = useMemo(() => getDaysUntilSunday(), []);

  const currentReview = state.weeklyReviews[weekKey] || {};
  const ratedCount = Object.keys(currentReview).length;
  const totalItems = weeklyReviewItems.length;
  const isComplete = ratedCount === totalItems;

  const doneCount = Object.values(currentReview).filter((r) => r === "done").length;
  const partialCount = Object.values(currentReview).filter((r) => r === "partial").length;
  const missedCount = Object.values(currentReview).filter((r) => r === "missed").length;

  const wasAlreadySubmitted = useMemo(() => {
    const review = state.weeklyReviews[weekKey];
    if (!review) return false;
    return Object.keys(review).length === totalItems;
  }, [state.weeklyReviews, weekKey, totalItems]);

  const [submitted, setSubmitted] = useState(wasAlreadySubmitted);

  const rateItem = useCallback(
    (itemId: string, rating: WeeklyRating) => {
      if (submitted) return;
      const updatedReview = { ...currentReview, [itemId]: rating };
      const newState: GameState = {
        ...state,
        weeklyReviews: {
          ...state.weeklyReviews,
          [weekKey]: updatedReview,
        },
      };
      onStateChange(newState);
      saveState(newState);
    },
    [state, currentReview, weekKey, submitted, onStateChange],
  );

  const submitReview = useCallback(() => {
    if (!isComplete || submitted) return;

    let newState: GameState = {
      ...state,
      totalWeeklyReviews: state.totalWeeklyReviews + 1,
    };
    newState = addXP(newState, XP_PER_WEEKLY_REVIEW);

    const { state: achievedState, newAchievements } = checkAchievements(newState);
    if (newAchievements.length > 0) onAchievements(newAchievements);

    onStateChange(achievedState);
    saveState(achievedState);
    setSubmitted(true);
  }, [state, isComplete, submitted, onStateChange, onAchievements]);

  const ratingButton = (
    itemId: string,
    rating: WeeklyRating,
    icon: React.ReactNode,
    label: string,
    activeClass: string,
  ) => {
    const isActive = currentReview[itemId] === rating;
    return (
      <button
        onClick={() => rateItem(itemId, rating)}
        disabled={submitted}
        className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
          isActive
            ? activeClass
            : submitted
              ? "bg-gray-50 text-gray-300"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
        }`}
      >
        {icon}
        {label}
      </button>
    );
  };

  return (
    <div
      className={`rounded-2xl border-2 transition-all ${
        submitted
          ? "border-indigo-200 bg-indigo-50/50"
          : isComplete
            ? "border-indigo-400 bg-indigo-50"
            : "border-indigo-200 bg-white"
      }`}
    >
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-4"
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              submitted
                ? "bg-indigo-100"
                : "bg-linear-to-br from-indigo-500 to-purple-500"
            }`}
          >
            {submitted ? (
              <CheckCircle2 size={20} className="text-indigo-600" />
            ) : (
              <ClipboardCheck size={20} className="text-white" />
            )}
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-gray-900">
              Weekly Review
              <span className="ml-1.5 text-xs font-normal text-gray-400">
                W{weekNum}
              </span>
            </h3>
            {submitted ? (
              <p className="text-xs text-indigo-600">
                Completed — {doneCount} done, {partialCount} partial, {missedCount} missed
              </p>
            ) : (
              <p className="text-xs text-gray-500">
                {ratedCount}/{totalItems} rated
                {daysLeft > 0 && ` · ${daysLeft}d until Sunday`}
                {daysLeft === 0 && " · Review day!"}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!submitted && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
              <span className="text-[10px] font-bold text-indigo-600">
                {ratedCount}/{totalItems}
              </span>
            </div>
          )}
          {expanded ? (
            <ChevronUp size={18} className="text-gray-400" />
          ) : (
            <ChevronDown size={18} className="text-gray-400" />
          )}
        </div>
      </button>

      {/* Expandable content */}
      {expanded && (
        <div className="border-t border-indigo-100 px-4 pb-4 pt-3">
          <div className="space-y-3">
            {weeklyReviewItems.map((item) => {
              const rated = currentReview[item.id];
              return (
                <div
                  key={item.id}
                  className={`rounded-xl border p-3 transition-all ${
                    rated
                      ? rated === "done"
                        ? "border-green-200 bg-green-50/50"
                        : rated === "partial"
                          ? "border-yellow-200 bg-yellow-50/50"
                          : "border-red-200 bg-red-50/50"
                      : "border-gray-100 bg-gray-50/50"
                  }`}
                >
                  <div className="mb-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-indigo-500">
                      {item.area}
                    </span>
                  </div>
                  <p className="mb-1 text-sm font-medium text-gray-800">
                    {item.question}
                  </p>
                  <p className="mb-2.5 text-xs text-gray-400">
                    {item.description}
                  </p>
                  <div className="flex gap-2">
                    {ratingButton(
                      item.id,
                      "done",
                      <CheckCircle2 size={13} />,
                      "Done",
                      "bg-green-500 text-white shadow-sm",
                    )}
                    {ratingButton(
                      item.id,
                      "partial",
                      <AlertTriangle size={13} />,
                      "Partial",
                      "bg-yellow-500 text-white shadow-sm",
                    )}
                    {ratingButton(
                      item.id,
                      "missed",
                      <XCircle size={13} />,
                      "Missed",
                      "bg-red-500 text-white shadow-sm",
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit button */}
          {isComplete && !submitted && (
            <button
              onClick={submitReview}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-500 to-purple-500 px-4 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl"
            >
              <Sparkles size={16} />
              Complete Review (+{XP_PER_WEEKLY_REVIEW} XP)
            </button>
          )}

          {submitted && (
            <div className="mt-4 rounded-xl bg-indigo-100 p-3 text-center">
              <p className="text-sm font-medium text-indigo-700">
                Week {weekNum} review submitted ✓
              </p>
              <p className="text-xs text-indigo-500">
                +{XP_PER_WEEKLY_REVIEW} XP earned · Next review next week
              </p>
            </div>
          )}

          {!isComplete && !submitted && (
            <p className="mt-3 text-center text-xs text-gray-400">
              Rate all {totalItems} areas to complete this week&apos;s review
            </p>
          )}
        </div>
      )}
    </div>
  );
}
