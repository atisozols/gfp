import { GameState } from "./types";
import { achievements, titles, XP_PER_LEVEL } from "./data";

const STORAGE_KEY = "gf-project-state";

const defaultState: GameState = {
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
  settings: {
    relationshipStartDate: null,
    partnerBirthday: null,
    partnerNameDay: null,
    partnerName: "",
  },
};

export function getState(): GameState {
  if (typeof window === "undefined") return defaultState;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultState;
    return { ...defaultState, ...JSON.parse(stored) };
  } catch {
    return defaultState;
  }
}

export function saveState(state: GameState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function addXP(state: GameState, amount: number): GameState {
  const newXP = state.xp + amount;
  const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;
  return { ...state, xp: newXP, level: newLevel };
}

export function updateStreak(state: GameState): GameState {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (state.lastCheckInDate === today) {
    return state;
  }

  let newStreak: number;
  if (state.lastCheckInDate === yesterday) {
    newStreak = state.streak + 1;
  } else {
    newStreak = 1;
  }

  const longestStreak = Math.max(newStreak, state.longestStreak);
  return { ...state, streak: newStreak, longestStreak, lastCheckInDate: today };
}

export function checkAchievements(state: GameState): {
  state: GameState;
  newAchievements: string[];
} {
  const newAchievements: string[] = [];
  let updatedState = { ...state };

  for (const achievement of achievements) {
    if (updatedState.unlockedAchievements.includes(achievement.id)) continue;

    let unlocked = false;
    try {
      const fn = new Function(
        "totalCheckIns",
        "totalConversations",
        "totalDiscovers",
        "celebrationsPlanned",
        "streak",
        "longestStreak",
        "totalWeeklyReviews",
        "dismissedCount",
        `return ${achievement.condition}`,
      );
      unlocked = fn(
        updatedState.totalCheckIns,
        updatedState.totalConversations,
        updatedState.totalDiscovers,
        updatedState.celebrationsPlanned,
        updatedState.streak,
        updatedState.longestStreak,
        updatedState.totalWeeklyReviews,
        updatedState.dismissedDiscovers.length,
      );
    } catch {
      unlocked = false;
    }

    if (unlocked) {
      updatedState = addXP(updatedState, achievement.xpReward);
      updatedState.unlockedAchievements = [
        ...updatedState.unlockedAchievements,
        achievement.id,
      ];
      newAchievements.push(achievement.id);
    }
  }

  return { state: updatedState, newAchievements };
}

export function getCurrentTitle(level: number): {
  name: string;
  emoji: string;
} {
  let current = titles[0];
  for (const title of titles) {
    if (level >= title.minLevel) {
      current = title;
    }
  }
  return current;
}

export function getNextTitle(
  level: number,
): { name: string; minLevel: number; emoji: string } | null {
  for (const title of titles) {
    if (level < title.minLevel) {
      return title;
    }
  }
  return null;
}

export function getXPProgress(xp: number): {
  current: number;
  needed: number;
  percentage: number;
} {
  const current = xp % XP_PER_LEVEL;
  return {
    current,
    needed: XP_PER_LEVEL,
    percentage: (current / XP_PER_LEVEL) * 100,
  };
}

export function getDaysUntil(dateStr: string): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let targetDate: Date;
  if (dateStr.length === 5) {
    // MM-DD format
    const [month, day] = dateStr.split("-").map(Number);
    targetDate = new Date(today.getFullYear(), month - 1, day);
    if (targetDate < today) {
      targetDate = new Date(today.getFullYear() + 1, month - 1, day);
    }
  } else {
    // YYYY-MM-DD format
    const [year, month, day] = dateStr.split("-").map(Number);
    targetDate = new Date(year, month - 1, day);
  }

  const diff = targetDate.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getMonthlyAnniversaryDate(
  startDateStr: string,
): { date: Date; dayOfMonth: number } | null {
  if (!startDateStr) return null;
  const startDate = new Date(startDateStr);
  const dayOfMonth = startDate.getDate();
  const now = new Date();
  let nextDate = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);
  if (nextDate <= now) {
    nextDate = new Date(now.getFullYear(), now.getMonth() + 1, dayOfMonth);
  }
  return { date: nextDate, dayOfMonth };
}
