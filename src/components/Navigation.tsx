"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, MessageCircle, Search, Gift, Trophy } from "lucide-react";

const tabs = [
  { href: "/", icon: Heart, label: "Check-in" },
  { href: "/conversations", icon: MessageCircle, label: "Deep Talk" },
  { href: "/discover", icon: Search, label: "Discover" },
  { href: "/celebrations", icon: Gift, label: "Celebrate" },
  { href: "/profile", icon: Trophy, label: "Profile" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-pink-100 bg-white/90 backdrop-blur-lg safe-area-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 transition-all ${
                isActive
                  ? "text-pink-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.5}
                className={isActive ? "fill-pink-100" : ""}
              />
              <span className={`text-[10px] font-medium ${isActive ? "text-pink-600" : ""}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
