"use client";

import { useState, useEffect } from "react";
import {
  Trophy,
  Flame,
  Target,
  Heart,
  MessageCircle,
  Search,
  Gift,
  Star,
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from "lucide-react";
import XPBar from "@/components/XPBar";
import {
  achievements,
  titles,
  conversationTopics,
  discoverQuestions,
  checkInQuestions,
} from "@/lib/data";
import {
  getState,
  saveState,
  getCurrentTitle,
  getNextTitle,
  getXPProgress,
} from "@/lib/gameStore";
import type { GameState } from "@/lib/types";

export default function ProfilePage() {
  const [state, setState] = useState<GameState | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    setState(getState());
  }, []);

  if (!state) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-pink-300 border-t-pink-600" />
      </div>
    );
  }

  const title = getCurrentTitle(state.level);
  const nextTitle = getNextTitle(state.level);
  const progress = getXPProgress(state.xp);

  const stats = [
    {
      icon: Heart,
      label: "Check-ins",
      value: state.totalCheckIns,
      color: "text-pink-500",
      bg: "bg-pink-50",
    },
    {
      icon: MessageCircle,
      label: "Deep Talks",
      value: state.totalConversations,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
    {
      icon: Search,
      label: "Discoveries",
      value: state.totalDiscovers,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      icon: Gift,
      label: "Celebrations",
      value: state.celebrationsPlanned,
      color: "text-green-500",
      bg: "bg-green-50",
    },
    {
      icon: ClipboardCheck,
      label: "Weekly Reviews",
      value: state.totalWeeklyReviews,
      color: "text-indigo-500",
      bg: "bg-indigo-50",
    },
  ];

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Progress</h1>
        <p className="text-sm text-gray-500">Keep growing as a partner</p>
      </div>

      {/* Hero card */}
      <div className="mb-6 rounded-2xl bg-linear-to-br from-pink-500 via-purple-500 to-indigo-500 p-6 text-white shadow-lg">
        <div className="mb-4 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-3xl backdrop-blur-sm">
            {title.emoji}
          </div>
          <div>
            <p className="text-lg font-bold">{title.name}</p>
            <p className="text-sm opacity-80">Level {state.level}</p>
          </div>
        </div>
        <div className="mb-2 flex justify-between text-xs opacity-80">
          <span>{progress.current} XP</span>
          <span>{progress.needed} XP to next level</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-white transition-all duration-500"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        {nextTitle && (
          <p className="mt-2 text-xs opacity-70">
            Next title: {nextTitle.emoji} {nextTitle.name} at Level{" "}
            {nextTitle.minLevel}
          </p>
        )}
      </div>

      {/* Streak section */}
      <div className="mb-6 flex gap-3">
        <div className="flex-1 rounded-2xl bg-orange-50 p-4 text-center">
          <Flame size={24} className="mx-auto mb-1 text-orange-500" />
          <p className="text-2xl font-bold text-orange-600">{state.streak}</p>
          <p className="text-xs text-orange-400">Current Streak</p>
        </div>
        <div className="flex-1 rounded-2xl bg-yellow-50 p-4 text-center">
          <Star size={24} className="mx-auto mb-1 text-yellow-500" />
          <p className="text-2xl font-bold text-yellow-600">
            {state.longestStreak}
          </p>
          <p className="text-xs text-yellow-400">Best Streak</p>
        </div>
        <div className="flex-1 rounded-2xl bg-purple-50 p-4 text-center">
          <Target size={24} className="mx-auto mb-1 text-purple-500" />
          <p className="text-2xl font-bold text-purple-600">{state.xp}</p>
          <p className="text-xs text-purple-400">Total XP</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`rounded-2xl ${stat.bg} p-4`}>
              <Icon size={20} className={stat.color} />
              <p className="mt-2 text-2xl font-bold text-gray-800">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Achievements */}
      <div className="mb-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <Trophy size={20} className="text-yellow-500" />
          Achievements
        </h2>
        <p className="text-xs text-gray-500">
          {state.unlockedAchievements.length}/{achievements.length} unlocked
        </p>
      </div>

      <div className="space-y-2">
        {achievements.map((ach) => {
          const isUnlocked = state.unlockedAchievements.includes(ach.id);
          return (
            <div
              key={ach.id}
              className={`flex items-center gap-3 rounded-2xl border-2 p-3 transition-all ${
                isUnlocked
                  ? "border-yellow-200 bg-yellow-50/50"
                  : "border-gray-100 bg-gray-50/50 opacity-60"
              }`}
            >
              <span className={`text-2xl ${isUnlocked ? "" : "grayscale"}`}>
                {ach.icon}
              </span>
              <div className="flex-1">
                <p
                  className={`text-sm font-semibold ${isUnlocked ? "text-gray-800" : "text-gray-500"}`}
                >
                  {ach.name}
                </p>
                <p className="text-xs text-gray-400">{ach.description}</p>
              </div>
              {isUnlocked ? (
                <span className="text-xs font-medium text-yellow-600">
                  +{ach.xpReward} XP
                </span>
              ) : (
                <span className="text-xs text-gray-400">🔒</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Data Management */}
      <div className="mb-4 mt-8">
        <button
          onClick={() => setShowAdmin(!showAdmin)}
          className="flex w-full items-center justify-between text-lg font-bold text-gray-900"
        >
          <span className="flex items-center gap-2">
            <RotateCcw size={20} className="text-gray-400" />
            Data Management
          </span>
          {showAdmin ? (
            <ChevronUp size={18} className="text-gray-400" />
          ) : (
            <ChevronDown size={18} className="text-gray-400" />
          )}
        </button>
        <p className="text-xs text-gray-500">
          Fix accidental actions or reset counters
        </p>
      </div>

      {showAdmin && (
        <div className="mb-6 space-y-2">
          <button
            onClick={() => {
              if (!state) return;
              const achXP = achievements
                .filter(
                  (a) =>
                    state.unlockedAchievements.includes(a.id) &&
                    ["ach-8", "ach-9", "ach-26"].includes(a.id),
                )
                .reduce((sum, a) => sum + a.xpReward, 0);
              const celXP = state.celebrationsPlanned * 50;
              const totalRemove = achXP + celXP;
              const newState: GameState = {
                ...state,
                celebrationsPlanned: 0,
                plannedCelebrationIds: [],
                xp: Math.max(0, state.xp - totalRemove),
                level: Math.max(
                  1,
                  Math.floor(Math.max(0, state.xp - totalRemove) / 100) + 1,
                ),
                unlockedAchievements: state.unlockedAchievements.filter(
                  (id) => !["ach-8", "ach-9", "ach-26"].includes(id),
                ),
              };
              setState(newState);
              saveState(newState);
              localStorage.removeItem("planned-celebrations");
            }}
            className="flex w-full items-center justify-between rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-left text-sm transition-all hover:bg-orange-100"
          >
            <div>
              <p className="font-medium text-orange-700">
                Reset Celebration Data
              </p>
              <p className="text-xs text-orange-500">
                Removes all celebration plans, XP, and related achievements
              </p>
            </div>
            <RotateCcw size={16} className="text-orange-400" />
          </button>

          <button
            onClick={() => {
              if (!state) return;
              const newState: GameState = {
                ...state,
                xp: 0,
                level: 1,
                streak: 0,
                longestStreak: 0,
                lastCheckInDate: null,
                completedCheckIns: [],
                completedConversations: [],
                completedDiscovers: [],
                dismissedDiscovers: [],
                unlockedAchievements: [],
                totalCheckIns: 0,
                totalConversations: 0,
                totalDiscovers: 0,
                celebrationsPlanned: 0,
                plannedCelebrationIds: [],
                totalWeeklyReviews: 0,
                weeklyReviews: {},
              };
              setState(newState);
              saveState(newState);
              localStorage.removeItem("planned-celebrations");
            }}
            className="flex w-full items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm transition-all hover:bg-red-100"
          >
            <div>
              <p className="font-medium text-red-700">Reset All Progress</p>
              <p className="text-xs text-red-500">
                Resets everything except settings (name, dates)
              </p>
            </div>
            <RotateCcw size={16} className="text-red-400" />
          </button>
        </div>
      )}

      {/* Title progression */}
      <div className="mb-4 mt-8">
        <h2 className="text-lg font-bold text-gray-900">Title Progression</h2>
      </div>
      <div className="space-y-2">
        {titles.map((t) => {
          const isActive = t.name === title.name;
          const isLocked = state.level < t.minLevel;
          return (
            <div
              key={t.name}
              className={`flex items-center gap-3 rounded-2xl border-2 p-3 ${
                isActive
                  ? "border-pink-300 bg-pink-50"
                  : isLocked
                    ? "border-gray-100 bg-gray-50 opacity-50"
                    : "border-green-200 bg-green-50/50"
              }`}
            >
              <span className="text-xl">{t.emoji}</span>
              <div className="flex-1">
                <p
                  className={`text-sm font-semibold ${isActive ? "text-pink-700" : "text-gray-700"}`}
                >
                  {t.name}
                </p>
                <p className="text-xs text-gray-400">Level {t.minLevel}+</p>
              </div>
              {isActive && (
                <span className="rounded-full bg-pink-200 px-2 py-0.5 text-xs font-medium text-pink-700">
                  Current
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
