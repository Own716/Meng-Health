import React from 'react';
import { Home, Utensils, BookOpen, TrendingUp, User } from 'lucide-react';

export type NavTab = 'home' | 'meals' | 'journal' | 'progress' | 'profile';

interface FloatingNavBarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const FloatingNavBar: React.FC<FloatingNavBarProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const navItems = [
    { key: 'home' as NavTab, label: '首页', icon: Home },
    { key: 'meals' as NavTab, label: '餐食', icon: Utensils },
    { key: 'journal' as NavTab, label: '日记', icon: BookOpen },
    { key: 'progress' as NavTab, label: '趋势', icon: TrendingUp },
    { key: 'profile' as NavTab, label: '我的', icon: User },
  ];

  return (
    <div className="fixed bottom-6 inset-x-0 flex justify-center z-40 px-6 pointer-events-none select-none">
      {/* 悬浮胶囊底栏：双层物理高悬浮阴影与超强立体景深 */}
      <nav className="pointer-events-auto flex items-center justify-between w-full max-w-sm px-4 py-2.5 rounded-full bg-white/85 backdrop-blur-2xl border border-white/90 shadow-[0_16px_36px_-6px_rgba(15,23,42,0.22),0_6px_16px_-4px_rgba(15,23,42,0.12)] ring-1 ring-slate-900/5 transition-all duration-300">
        {navItems.map(({ key, label, icon: Icon }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => onSelectTab(key)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all duration-200 active:scale-90 ${
                isActive
                  ? 'text-blue-600 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                {isActive && (
                  <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-blue-600" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
