"use client";

import { useEffect, useState } from "react";
import { achievements } from "@/lib/data";

interface AchievementToastProps {
  achievementIds: string[];
  onDismiss: () => void;
}

export default function AchievementToast({
  achievementIds,
  onDismiss,
}: AchievementToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (achievementIds.length > 0) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [achievementIds, onDismiss]);

  if (achievementIds.length === 0) return null;

  const achievement = achievements.find((a) => a.id === achievementIds[0]);
  if (!achievement) return null;

  return (
    <div
      className={`fixed left-4 right-4 top-4 z-100 mx-auto max-w-sm transform transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div className="rounded-2xl bg-linear-to-r from-yellow-400 to-orange-400 p-0.5 shadow-2xl">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
          <span className="text-3xl">{achievement.icon}</span>
          <div>
            <p className="text-xs font-medium text-orange-500">
              Achievement Unlocked!
            </p>
            <p className="font-bold text-gray-800">{achievement.name}</p>
            <p className="text-xs text-gray-500">
              {achievement.description} · +{achievement.xpReward} XP
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
