"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Gift,
  Calendar,
  Plus,
  Check,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import XPBar from "@/components/XPBar";
import AchievementToast from "@/components/AchievementToast";
import { defaultCelebrations, XP_PER_CELEBRATION } from "@/lib/data";
import {
  getState,
  saveState,
  addXP,
  checkAchievements,
  getDaysUntil,
  getMonthlyAnniversaryDate,
} from "@/lib/gameStore";
import type { GameState, Celebration } from "@/lib/types";

function getAllCelebrations(
  state: GameState,
): (Celebration & { daysUntil: number })[] {
  const celebrations: (Celebration & { daysUntil: number })[] = [];

  for (const cel of defaultCelebrations) {
    celebrations.push({ ...cel, daysUntil: getDaysUntil(cel.date) });
  }

  if (state.settings.partnerBirthday) {
    const mmdd = state.settings.partnerBirthday.slice(5);
    celebrations.push({
      id: "cel-birthday",
      name: `${state.settings.partnerName || "Her"}'s Birthday`,
      date: mmdd,
      isRecurring: true,
      icon: "🎂",
      giftIdeas: [
        "Plan a surprise party with her closest friends",
        "A meaningful gift she mentioned wanting",
        "Birthday morning breakfast in bed",
        "A photo book of your time together",
        "A handwritten birthday letter",
        "An experience she's been wanting to try",
      ],
      daysUntil: getDaysUntil(mmdd),
    });
  }

  if (state.settings.partnerNameDay) {
    const mmdd = state.settings.partnerNameDay.slice(5);
    celebrations.push({
      id: "cel-nameday",
      name: `${state.settings.partnerName || "Her"}'s Name Day`,
      date: mmdd,
      isRecurring: true,
      icon: "🌺",
      giftIdeas: [
        "Flowers with a personal card",
        "Her favorite treat or dessert",
        "A small thoughtful gift",
        "Take her out for dinner",
      ],
      daysUntil: getDaysUntil(mmdd),
    });
  }

  if (state.settings.relationshipStartDate) {
    const anniv = getMonthlyAnniversaryDate(
      state.settings.relationshipStartDate,
    );
    if (anniv) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const diff = Math.ceil(
        (anniv.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );
      celebrations.push({
        id: "cel-monthly",
        name: "Monthly Anniversary",
        date: `${String(anniv.date.getMonth() + 1).padStart(2, "0")}-${String(anniv.dayOfMonth).padStart(2, "0")}`,
        isRecurring: true,
        icon: "💕",
        giftIdeas: [
          "Write her a note about your favorite moment this month",
          "Cook her favorite meal",
          "Plan a date night",
          "Small surprise gift",
          "Recreate your first date",
          "A spontaneous adventure together",
        ],
        daysUntil: diff,
      });
    }

    const startDate = new Date(state.settings.relationshipStartDate);
    const yearlyMmdd = `${String(startDate.getMonth() + 1).padStart(2, "0")}-${String(startDate.getDate()).padStart(2, "0")}`;
    celebrations.push({
      id: "cel-anniversary",
      name: "Relationship Anniversary",
      date: yearlyMmdd,
      isRecurring: true,
      icon: "💍",
      giftIdeas: [
        "Plan something special and meaningful",
        "Revisit a place that's significant to your relationship",
        "Create a scrapbook of the past year",
        "Write a heartfelt letter about your journey",
        "Surprise weekend getaway",
        "Renew a promise or commitment to each other",
      ],
      daysUntil: getDaysUntil(yearlyMmdd),
    });
  }

  return celebrations.sort((a, b) => a.daysUntil - b.daysUntil);
}

export default function CelebrationsPage() {
  const [state, setState] = useState<GameState | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [plannedCelebrations, setPlannedCelebrations] = useState<
    Record<string, string[]>
  >({});
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const s = getState();
    setState(s);
    const stored = localStorage.getItem("planned-celebrations");
    if (stored) setPlannedCelebrations(JSON.parse(stored));
    if (!s.settings.partnerBirthday && !s.settings.relationshipStartDate) {
      setShowSettings(true);
    }
  }, []);

  const toggleIdea = useCallback(
    (celebrationId: string, idea: string) => {
      const current = plannedCelebrations[celebrationId] || [];
      const updated = current.includes(idea)
        ? current.filter((i) => i !== idea)
        : [...current, idea];

      const newPlanned = { ...plannedCelebrations, [celebrationId]: updated };
      setPlannedCelebrations(newPlanned);
      localStorage.setItem("planned-celebrations", JSON.stringify(newPlanned));
    },
    [plannedCelebrations],
  );

  const confirmPlanned = useCallback(
    (celebrationId: string) => {
      if (!state) return;
      if (state.plannedCelebrationIds.includes(celebrationId)) return;

      let newState: GameState = {
        ...state,
        celebrationsPlanned: state.celebrationsPlanned + 1,
        plannedCelebrationIds: [...state.plannedCelebrationIds, celebrationId],
      };
      newState = addXP(newState, XP_PER_CELEBRATION);
      const { state: achievedState, newAchievements: unlocked } =
        checkAchievements(newState);
      if (unlocked.length > 0) setNewAchievements(unlocked);
      setState(achievedState);
      saveState(achievedState);
    },
    [state],
  );

  const updateSetting = useCallback(
    (key: keyof GameState["settings"], value: string) => {
      if (!state) return;
      const newState = {
        ...state,
        settings: { ...state.settings, [key]: value },
      };
      setState(newState);
      saveState(newState);
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

  const celebrations = getAllCelebrations(state);

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-6">
      <AchievementToast
        achievementIds={newAchievements}
        onDismiss={() => setNewAchievements([])}
      />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Celebrations</h1>
        <p className="text-sm text-gray-500">
          Never miss a moment to celebrate her
        </p>
      </div>

      <div className="mb-6">
        <XPBar xp={state.xp} level={state.level} streak={state.streak} />
      </div>

      {/* Settings panel */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="mb-4 flex w-full items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700"
      >
        <span>⚙️ Important Dates</span>
        {showSettings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {showSettings && (
        <div className="mb-6 space-y-3 rounded-2xl border-2 border-gray-100 bg-white p-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Her Name
            </label>
            <input
              type="text"
              value={state.settings.partnerName}
              onChange={(e) => updateSetting("partnerName", e.target.value)}
              placeholder="Enter her name"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-pink-300"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Relationship Start Date
            </label>
            <input
              type="date"
              value={state.settings.relationshipStartDate || ""}
              onChange={(e) =>
                updateSetting("relationshipStartDate", e.target.value)
              }
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-pink-300"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Her Birthday
            </label>
            <input
              type="date"
              value={state.settings.partnerBirthday || ""}
              onChange={(e) => updateSetting("partnerBirthday", e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-pink-300"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Her Name Day
            </label>
            <input
              type="date"
              value={state.settings.partnerNameDay || ""}
              onChange={(e) => updateSetting("partnerNameDay", e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-pink-300"
            />
          </div>
        </div>
      )}

      {/* Celebration cards */}
      <div className="space-y-3">
        {celebrations.map((cel) => {
          const isExpanded = expandedId === cel.id;
          const planned = plannedCelebrations[cel.id] || [];
          const isUrgent = cel.daysUntil <= 14;
          const isVeryUrgent = cel.daysUntil <= 3;

          return (
            <div
              key={cel.id}
              className={`rounded-2xl border-2 transition-all ${
                isVeryUrgent
                  ? "border-red-300 bg-red-50/50"
                  : isUrgent
                    ? "border-orange-200 bg-orange-50/50"
                    : "border-gray-100 bg-white"
              }`}
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : cel.id)}
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                <span className="text-2xl">{cel.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{cel.name}</p>
                  <div className="flex items-center gap-2">
                    <Clock
                      size={12}
                      className={
                        isVeryUrgent
                          ? "text-red-500"
                          : isUrgent
                            ? "text-orange-500"
                            : "text-gray-400"
                      }
                    />
                    <span
                      className={`text-xs font-medium ${
                        isVeryUrgent
                          ? "text-red-600"
                          : isUrgent
                            ? "text-orange-600"
                            : "text-gray-500"
                      }`}
                    >
                      {cel.daysUntil === 0
                        ? "TODAY! 🎉"
                        : cel.daysUntil === 1
                          ? "Tomorrow!"
                          : `${cel.daysUntil} days away`}
                    </span>
                  </div>
                </div>
                {planned.length > 0 && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-600">
                    {planned.length} planned
                  </span>
                )}
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100 px-4 pb-4 pt-3">
                  <p className="mb-3 text-xs font-medium text-gray-500">
                    Gift & Surprise Ideas:
                  </p>
                  <div className="space-y-2">
                    {cel.giftIdeas.map((idea) => {
                      const isPlanned = planned.includes(idea);
                      return (
                        <button
                          key={idea}
                          onClick={() => toggleIdea(cel.id, idea)}
                          className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-all ${
                            isPlanned
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {isPlanned ? (
                            <Check
                              size={16}
                              className="shrink-0 text-green-500"
                            />
                          ) : (
                            <Gift
                              size={16}
                              className="shrink-0 text-gray-400"
                            />
                          )}
                          <span
                            className={
                              isPlanned ? "line-through opacity-70" : ""
                            }
                          >
                            {idea}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {planned.length > 0 &&
                    !state.plannedCelebrationIds.includes(cel.id) && (
                      <button
                        onClick={() => confirmPlanned(cel.id)}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-green-500 to-emerald-500 px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg"
                      >
                        <Check size={16} />
                        Mark as Planned (+{XP_PER_CELEBRATION} XP)
                      </button>
                    )}
                  {state.plannedCelebrationIds.includes(cel.id) && (
                    <div className="mt-3 rounded-xl bg-green-100 p-2.5 text-center">
                      <p className="text-sm font-medium text-green-700">
                        Planned ✓
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {celebrations.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-4xl">📅</p>
          <p className="mt-2 font-medium text-gray-600">
            Set up important dates above
          </p>
          <p className="text-sm text-gray-400">to see upcoming celebrations</p>
        </div>
      )}
    </div>
  );
}
