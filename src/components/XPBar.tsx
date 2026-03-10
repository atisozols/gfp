"use client";

import { getXPProgress, getCurrentTitle } from "@/lib/gameStore";

interface XPBarProps {
  xp: number;
  level: number;
  streak: number;
}

export default function XPBar({ xp, level, streak }: XPBarProps) {
  const progress = getXPProgress(xp);
  const title = getCurrentTitle(level);

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-linear-to-r from-pink-50 to-purple-50 px-4 py-3">
      <div className="flex flex-col items-center">
        <span className="text-2xl">{title.emoji}</span>
        <span className="text-[10px] font-bold text-pink-600">LVL {level}</span>
      </div>
      <div className="flex-1">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-700">
            {title.name}
          </span>
          <span className="text-[10px] text-gray-500">
            {progress.current}/{progress.needed} XP
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-pink-100">
          <div
            className="h-full rounded-full bg-linear-to-r from-pink-400 to-purple-400 transition-all duration-500"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>
      {streak > 0 && (
        <div className="flex flex-col items-center rounded-xl bg-orange-50 px-2.5 py-1.5">
          <span className="text-lg">🔥</span>
          <span className="text-[10px] font-bold text-orange-600">
            {streak}
          </span>
        </div>
      )}
    </div>
  );
}
