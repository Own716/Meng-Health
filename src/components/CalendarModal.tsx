import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle } from 'lucide-react';
import { getAllLogs } from '../services/storageService';

interface CalendarModalProps {
  isOpen: boolean;
  currentDate: string; // YYYY-MM-DD
  onClose: () => void;
  onSelectDate: (dateStr: string) => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  currentDate,
  onClose,
  onSelectDate,
}) => {
  if (!isOpen) return null;

  const [currY, currM] = currentDate.split('-').map(Number);
  const [viewYear, setViewYear] = useState(currY);
  const [viewMonth, setViewMonth] = useState(currM); // 1-12

  const allLogs = getAllLogs();

  const prevMonth = () => {
    if (viewMonth === 1) {
      setViewYear(viewYear - 1);
      setViewMonth(12);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 12) {
      setViewYear(viewYear + 1);
      setViewMonth(1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // 生成该月份日历网格
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayWeekday = (year: number, month: number) => {
    // 0 = Sunday, 1 = Monday
    const d = new Date(year, month - 1, 1).getDay();
    // 转换为周一为起始 (0 = 周一, 6 = 周日)
    return d === 0 ? 6 : d - 1;
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayWeekday = getFirstDayWeekday(viewYear, viewMonth);

  const days = [];
  for (let i = 0; i < firstDayWeekday; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handlePick = (day: number) => {
    const mStr = String(viewMonth).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    onSelectDate(`${viewYear}-${mStr}-${dStr}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm select-none animate-fadeIn pt-12 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl animate-slideDown">
        {/* 顶部标题与切换月份 */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CalendarIcon size={18} className="text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              {viewYear}年 {viewMonth}月
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              title="上一月"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              title="下一月"
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={onClose}
              className="ml-2 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* 星期头部 */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 my-3">
          <span>一</span>
          <span>二</span>
          <span>三</span>
          <span>四</span>
          <span>五</span>
          <span>六</span>
          <span>日</span>
        </div>

        {/* 日期网格 */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {days.map((day, idx) => {
            if (day === null) {
              return <div key={'empty-' + idx} className="h-10" />;
            }

            const mStr = String(viewMonth).padStart(2, '0');
            const dStr = String(day).padStart(2, '0');
            const dateIso = `${viewYear}-${mStr}-${dStr}`;
            const isSelected = dateIso === currentDate;
            const log = allLogs[dateIso];
            const hasLog = log && log.consumedCalories > 0;

            return (
              <button
                key={day}
                onClick={() => handlePick(day)}
                className={`h-10 rounded-2xl flex flex-col items-center justify-center relative transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30 scale-105'
                    : 'text-slate-700 hover:bg-slate-100 font-medium'
                }`}
              >
                <span className="text-sm leading-none">{day}</span>
                {hasLog && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-1 ${
                      isSelected ? 'bg-emerald-300' : 'bg-emerald-500'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* 图例说明 */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>有饮食打卡记录</span>
          </span>
          <span>点击任意日期直接跳转</span>
        </div>
      </div>
    </div>
  );
};
