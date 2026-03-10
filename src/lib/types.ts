export interface CheckInQuestion {
  id: string;
  question: string;
  type: "yesno" | "scale" | "freeform";
  category: "emotional" | "physical" | "quality-time" | "appreciation" | "communication";
}

export interface ConversationTopic {
  id: string;
  topic: string;
  description: string;
  category: "dreams" | "fears" | "memories" | "values" | "future" | "hypothetical" | "emotional" | "fun";
  depth: 1 | 2 | 3;
}

export interface DiscoverQuestion {
  id: string;
  question: string;
  category: "childhood" | "family" | "preferences" | "dreams" | "past" | "beliefs" | "daily-life" | "relationships";
}

export interface Celebration {
  id: string;
  name: string;
  date: string; // MM-DD or YYYY-MM-DD
  isRecurring: boolean;
  giftIdeas: string[];
  icon: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  condition: string;
}

export interface GameState {
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  lastCheckInDate: string | null;
  completedCheckIns: string[]; // question IDs
  completedConversations: string[]; // topic IDs
  completedDiscovers: string[]; // question IDs
  unlockedAchievements: string[]; // achievement IDs
  totalCheckIns: number;
  totalConversations: number;
  totalDiscovers: number;
  celebrationsPlanned: number;
  settings: {
    relationshipStartDate: string | null;
    partnerBirthday: string | null;
    partnerNameDay: string | null;
    partnerName: string;
  };
}

export type Title = {
  name: string;
  minLevel: number;
  emoji: string;
};
