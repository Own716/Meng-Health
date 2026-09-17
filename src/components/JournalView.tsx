import React from 'react';
import { getAllLogs, formatChineseDate } from '../services/storageService';
import { Calendar, ChevronRight, CheckCircle2 } from 'lucide-react';

interface JournalViewProps {
  onSelectDate: (dateStr: string) => void;
}

export const JournalView: React.FC<JournalViewProps> = ({ onSelectDate }) => {
  const allLogs = getAllLogs();
  const dateKeys = Object.keys(allLogs).sort().reverse();

  return (
    <div className="px-5 pb-28 pt-2 select-none animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Calendar size={20} className="text-blue-600" />
          <span>饮食打卡日记</span>
        </h2>
        <span className="text-xs text-slate-400 font-medium">共记录 {dateKeys.length} 天</span>
      </div>

      <div className="space-y-3">
        {dateKeys.map((dateStr) => {
          const log = allLogs[dateStr];
          const info = formatChineseDate(dateStr);
          const deficit = log.budgetCalories - log.consumedCalories;
          const isSuccess = deficit >= 0;

          return (
            <div
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-slate-900">{info.title}</span>
                  {isSuccess ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold flex items-center gap-0.5">
                      <CheckCircle2 size={10} /> 减脂达标
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-bold">
                      超标放纵
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400">
                  摄入 <span className="font-semibold text-slate-700">{log.consumedCalories}</span> / 预算 {log.budgetCalories} 千卡
                  · 差额 <span className={`font-bold ${isSuccess ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {deficit > 0 ? `-${deficit}` : `+${Math.abs(deficit)}`} 千卡
                  </span>
                </div>
              </div>

              <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
