import React from 'react';
import { Bell, User } from 'lucide-react';
import { formatChineseDate } from '../services/storageService';

interface HeaderProps {
  currentDate: string;
  onSelectDate: (dateStr: string) => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  onSelectDate,
  onOpenProfile,
}) => {
  // 生成最近 5 天的日期项用于横向切换
  const generateDates = () => {
    const dates = [];
    const baseDate = new Date(currentDate);
    for (let i = -2; i <= 2; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const iso = `${y}-${m}-${day}`;
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      dates.push({
        iso,
        dayNum: d.getDate(),
        monthNum: d.getMonth() + 1,
        weekday: weekdays[d.getDay()],
        isToday: i === 0,
      });
    }
    return dates;
  };

  const dates = generateDates();
  const activeDateInfo = formatChineseDate(currentDate);

  return (
    <header className="pt-safe px-5 pt-3 pb-2 select-none">
      {/* 顶部标题与功能入口 */}
      <div className="flex items-center justify-between py-2">
        <div className="w-9" /> {/* 占位平衡 */}
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center justify-center gap-1.5">
            Meng Health
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 active:scale-95 transition-transform"
            title="通知"
          >
            <Bell size={18} />
          </button>
          <button
            onClick={onOpenProfile}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-900 text-white active:scale-95 transition-transform shadow-sm"
            title="个人中心与备份"
          >
            <User size={18} />
          </button>
        </div>
      </div>

      {/* 日期滑动选择条 */}
      <div className="flex items-center justify-between mt-3 px-1">
        {dates.map((item) => {
          const isActive = item.iso === currentDate;
          return (
            <button
              key={item.iso}
              onClick={() => onSelectDate(item.iso)}
              className={`flex flex-col items-center py-2 px-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'bg-white shadow-md shadow-slate-200/80 border border-slate-100 text-slate-900 scale-105'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span className="text-[11px] font-medium leading-none mb-1">
                {item.weekday}
              </span>
              <span className={`text-base font-bold leading-none ${isActive ? 'text-blue-600' : ''}`}>
                {item.dayNum}
              </span>
              {isActive && (
                <span className="text-[9px] text-blue-500 font-semibold mt-1">
                  {item.monthNum}月
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
