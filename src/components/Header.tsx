import React from 'react';
import { Bell, User, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { formatChineseDate } from '../services/storageService';

interface HeaderProps {
  currentDate: string;
  onSelectDate: (dateStr: string) => void;
  onOpenProfile: () => void;
  onOpenCalendar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  onSelectDate,
  onOpenProfile,
  onOpenCalendar,
}) => {
  // 生成当前选中日期所在自然周的 7 天（周一至周日），位置完全固定，点击时绝不突兀跳动
  const generateWeekDays = () => {
    const [y, m, d] = currentDate.split('-').map(Number);
    const current = new Date(y, m - 1, d);
    
    // 获取这天是周几 (0 = 周日, 1 = 周一 ... 6 = 周六)
    const dayOfWeek = current.getDay();
    // 换算成距离周一的偏移量 (周一偏移0, 周日偏移6)
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const monday = new Date(current);
    monday.setDate(current.getDate() + mondayOffset);

    const weekDays = [];
    const weekdaysNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);
      const year = dayDate.getFullYear();
      const month = String(dayDate.getMonth() + 1).padStart(2, '0');
      const dateNum = String(dayDate.getDate()).padStart(2, '0');
      const iso = `${year}-${month}-${dateNum}`;

      weekDays.push({
        iso,
        dayNum: dayDate.getDate(),
        monthNum: dayDate.getMonth() + 1,
        weekday: weekdaysNames[i],
      });
    }
    return weekDays;
  };

  const weekDays = generateWeekDays();
  const dateInfo = formatChineseDate(currentDate);

  return (
    <header className="pt-safe px-4 pt-2 pb-2 select-none">
      {/* 顶部标题与功能入口 */}
      <div className="flex items-center justify-between py-1.5">
        <button
          onClick={onOpenCalendar}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-sm text-xs font-bold text-slate-700 active:scale-95 transition-all"
          title="展开全月日历"
        >
          <CalendarIcon size={14} className="text-blue-600" />
          <span>{dateInfo.short} {dateInfo.weekday}</span>
          <ChevronDown size={14} className="text-slate-400" />
        </button>

        <h1 className="text-lg font-black text-slate-900 tracking-tight">
          Meng Health
        </h1>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenProfile}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-900 text-white active:scale-95 transition-transform shadow-sm"
            title="个人身材设置与备份"
          >
            <User size={16} />
          </button>
        </div>
      </div>

      {/* 丝滑自然周横向切换条：周一到周日位置稳固，点击只平滑移动高亮背景 */}
      <div className="grid grid-cols-7 gap-1 mt-2.5 bg-slate-200/50 p-1 rounded-2xl">
        {weekDays.map((item) => {
          const isActive = item.iso === currentDate;
          return (
            <button
              key={item.iso}
              onClick={() => onSelectDate(item.iso)}
              className={`relative flex flex-col items-center py-1.5 px-1 rounded-xl transition-all duration-300 ease-out active:scale-95 ${
                isActive
                  ? 'bg-white shadow-md shadow-slate-300/60 text-slate-900 font-bold scale-[1.03]'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <span className={`text-[10px] leading-none mb-1 ${isActive ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                {item.weekday}
              </span>
              <span className={`text-sm leading-none ${isActive ? 'text-slate-900 font-black' : ''}`}>
                {item.dayNum}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
