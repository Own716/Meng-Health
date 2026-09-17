import React, { useRef, useEffect } from 'react';
import { User, Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { formatChineseDate, getTodayString } from '../services/storageService';

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLButtonElement>(null);
  const todayStr = getTodayString();

  // 生成涵盖过去 21 天到未来 21 天（共 43 天）的可自由滑动日期流
  const generateExtendedDays = () => {
    const [y, m, d] = todayStr.split('-').map(Number);
    const base = new Date(y, m - 1, d);
    const days = [];
    const weekdayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

    for (let i = -21; i <= 21; i++) {
      const dayDate = new Date(base);
      dayDate.setDate(base.getDate() + i);
      const year = dayDate.getFullYear();
      const month = String(dayDate.getMonth() + 1).padStart(2, '0');
      const dateNum = String(dayDate.getDate()).padStart(2, '0');
      const iso = `${year}-${month}-${dateNum}`;

      days.push({
        iso,
        dayNum: dayDate.getDate(),
        monthNum: dayDate.getMonth() + 1,
        weekday: weekdayNames[dayDate.getDay()],
        isToday: iso === todayStr,
      });
    }
    return days;
  };

  const allDays = generateExtendedDays();
  const dateInfo = formatChineseDate(currentDate);

  // 当日期改变时，自动丝滑平移至视口居中
  useEffect(() => {
    if (activeItemRef.current && scrollContainerRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [currentDate]);

  // 快速翻页 7 天 (向前或向后一周)
  const shiftWeek = (offsetDays: number) => {
    const [y, m, d] = currentDate.split('-').map(Number);
    const target = new Date(y, m - 1, d);
    target.setDate(target.getDate() + offsetDays);
    const newY = target.getFullYear();
    const newM = String(target.getMonth() + 1).padStart(2, '0');
    const newD = String(target.getDate()).padStart(2, '0');
    onSelectDate(`${newY}-${newM}-${newD}`);
  };

  return (
    <header className="pt-safe px-3 pt-2 pb-2 select-none">
      {/* 顶部标题与功能入口 */}
      <div className="flex items-center justify-between py-1.5 px-1">
        {/* 日期选择抽屉入口 */}
        <button
          onClick={onOpenCalendar}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-sm text-xs font-bold text-slate-800 active:scale-95 transition-all hover:bg-slate-50"
          title="展开全月日历"
        >
          <CalendarIcon size={14} className="text-blue-600" />
          <span>{dateInfo.short} {dateInfo.weekday}</span>
          <ChevronDown size={14} className="text-slate-400" />
        </button>

        {/* 软件名称 */}
        <div className="text-center">
          <h1 className="text-base font-black text-slate-900 tracking-tight">
            Meng Health · 梦健康
          </h1>
        </div>

        {/* 个人中心入口 */}
        <div className="flex items-center gap-1.5">
          {currentDate !== todayStr && (
            <button
              onClick={() => onSelectDate(todayStr)}
              className="text-[11px] px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 flex items-center gap-0.5 active:scale-95 transition-all"
              title="回到今天"
            >
              <RotateCcw size={11} />
              <span>今日</span>
            </button>
          )}
          <button
            onClick={onOpenProfile}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-900 text-white active:scale-95 transition-transform shadow-sm"
            title="个人身材设置与备份"
          >
            <User size={16} />
          </button>
        </div>
      </div>

      {/* 左右滑动与切周控制栏 */}
      <div className="relative mt-2 flex items-center gap-1">
        <button
          onClick={() => shiftWeek(-7)}
          className="w-7 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-slate-200/60 text-slate-500 hover:text-slate-900 active:scale-90 transition-all"
          title="上一周"
        >
          <ChevronLeft size={16} />
        </button>

        {/* 横向可手势自由滑动的日期条 */}
        <div
          ref={scrollContainerRef}
          className="flex-1 flex gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1"
        >
          {allDays.map((item) => {
            const isActive = item.iso === currentDate;
            return (
              <button
                key={item.iso}
                ref={isActive ? activeItemRef : null}
                onClick={() => onSelectDate(item.iso)}
                className={`w-[48px] flex-shrink-0 flex flex-col items-center py-2 rounded-2xl transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-500/30 scale-105'
                    : item.isToday
                    ? 'bg-white border-2 border-blue-400 text-blue-700 font-bold'
                    : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-100 font-medium'
                }`}
              >
                <span className={`text-[10px] leading-none mb-1 ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                  {item.weekday}
                </span>
                <span className="text-sm leading-none font-bold">
                  {item.dayNum}
                </span>
                <span className={`text-[9px] mt-1 leading-none ${isActive ? 'text-blue-200' : 'text-slate-400'}`}>
                  {item.isToday ? '今天' : `${item.monthNum}月`}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => shiftWeek(7)}
          className="w-7 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-slate-200/60 text-slate-500 hover:text-slate-900 active:scale-90 transition-all"
          title="下一周"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </header>
  );
};
