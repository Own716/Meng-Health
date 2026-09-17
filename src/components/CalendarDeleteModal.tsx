import React, { useState, useMemo } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
  AlertTriangle,
  Calendar as CalendarIcon,
  CheckSquare,
  Square,
  Check
} from 'lucide-react';
import { getAllLogs, hasLogRecords, batchDeleteDayLogs } from '../services/storageService';

interface CalendarDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBatchDeleted: (deletedDates: string[]) => void;
}

export const CalendarDeleteModal: React.FC<CalendarDeleteModalProps> = ({
  isOpen,
  onClose,
  onBatchDeleted,
}) => {
  if (!isOpen) return null;

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1); // 1-12
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // 实时读取当前本地所有记录
  const allLogs = useMemo(() => getAllLogs(), [isOpen, showConfirmDialog]);

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

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayWeekday = (year: number, month: number) => {
    const d = new Date(year, month - 1, 1).getDay();
    return d === 0 ? 6 : d - 1; // 0 = 周一, 6 = 周日
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayWeekday = getFirstDayWeekday(viewYear, viewMonth);

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayWeekday; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // 格式化特定天日期字符串
  const getDateStr = (day: number) => {
    const mStr = String(viewMonth).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    return `${viewYear}-${mStr}-${dStr}`;
  };

  // 切换单个日期选中状态
  const toggleDate = (dateStr: string) => {
    const next = new Set(selectedDates);
    if (next.has(dateStr)) {
      next.delete(dateStr);
    } else {
      next.add(dateStr);
    }
    setSelectedDates(next);
  };

  // 本月全选：优先全选当前月份中有记录的日期，若均无记录则全选本月全部天数
  const selectAllThisMonth = () => {
    const next = new Set(selectedDates);
    const recordedDays: string[] = [];
    const allMonthDays: string[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dStr = getDateStr(d);
      allMonthDays.push(dStr);
      if (hasLogRecords(allLogs[dStr])) {
        recordedDays.push(dStr);
      }
    }

    const targetList = recordedDays.length > 0 ? recordedDays : allMonthDays;
    targetList.forEach((dateStr) => next.add(dateStr));
    setSelectedDates(next);
  };

  // 清空选择
  const clearSelection = () => {
    setSelectedDates(new Set());
  };

  // 执行最终级联删除
  const handleExecuteDelete = () => {
    const datesToDelete = Array.from(selectedDates);
    if (datesToDelete.length === 0) return;

    batchDeleteDayLogs(datesToDelete);
    setShowConfirmDialog(false);
    setSelectedDates(new Set());
    onBatchDeleted(datesToDelete);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm select-none animate-fadeIn p-0 sm:p-4">
      <div className="w-full sm:max-w-lg bg-white rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl max-h-[92vh] flex flex-col animate-slideDown">
        {/* 顶部标题与关闭 */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">饮食与打卡记录管理</h3>
              <p className="text-[11px] text-slate-400">按日历多选批量清除历史饮食日记与数据</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        </div>

        {/* 快捷操作条与已选提示 */}
        <div className="flex items-center justify-between py-2.5 px-1 flex-shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={selectAllThisMonth}
              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1 transition-all active:scale-95"
            >
              <CheckSquare size={13} className="text-rose-500" />
              <span>本月全选</span>
            </button>
            <button
              onClick={clearSelection}
              disabled={selectedDates.size === 0}
              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-600 font-medium flex items-center gap-1 transition-all"
            >
              <Square size={13} />
              <span>清空选择</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">已选择</span>
            <span className="px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-black text-xs">
              {selectedDates.size} 天
            </span>
          </div>
        </div>

        {/* 月份切换器 */}
        <div className="flex items-center justify-between px-2 py-1.5 bg-slate-50 rounded-2xl border border-slate-100 flex-shrink-0 my-1">
          <div className="flex items-center gap-2">
            <CalendarIcon size={16} className="text-rose-500" />
            <span className="text-sm font-bold text-slate-800">
              {viewYear}年 {viewMonth}月
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-xl hover:bg-white text-slate-600 transition-colors shadow-none hover:shadow-sm"
              title="上一月"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-xl hover:bg-white text-slate-600 transition-colors shadow-none hover:shadow-sm"
              title="下一月"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* 星期行 */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 my-2 flex-shrink-0">
          <span>一</span>
          <span>二</span>
          <span>三</span>
          <span>四</span>
          <span>五</span>
          <span>六</span>
          <span>日</span>
        </div>

        {/* 日期网格 */}
        <div className="grid grid-cols-7 gap-1.5 text-center overflow-y-auto flex-1 py-1">
          {days.map((day, idx) => {
            if (day === null) {
              return <div key={'empty-' + idx} className="h-12" />;
            }

            const dateStr = getDateStr(day);
            const isSelected = selectedDates.has(dateStr);
            const log = allLogs[dateStr];
            const hasRecord = hasLogRecords(log);

            return (
              <button
                key={day}
                onClick={() => toggleDate(dateStr)}
                type="button"
                className={`h-12 rounded-2xl flex flex-col items-center justify-center relative transition-all active:scale-95 border ${
                  isSelected
                    ? 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-500/30 scale-105 font-bold z-10'
                    : hasRecord
                    ? 'bg-blue-50/70 border-blue-200/80 text-slate-800 hover:bg-blue-100/60 font-semibold'
                    : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs leading-none">{day}</span>
                {/* 蓝色小圆点指示该日有实际打卡或饮食记录 */}
                {hasRecord && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-1.5 transition-colors ${
                      isSelected ? 'bg-white' : 'bg-blue-500'
                    }`}
                  />
                )}
                {/* 选中时的微标勾选 */}
                {isSelected && (
                  <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-white text-rose-500 flex items-center justify-center">
                    <Check size={9} strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* 图例说明 */}
        <div className="flex items-center justify-center gap-4 py-2 border-t border-slate-100 text-[11px] text-slate-400 flex-shrink-0 mt-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>含打卡记录</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-md bg-rose-500" />
            <span>已选待删除</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-200" />
            <span>无记录空白日</span>
          </div>
        </div>

        {/* 底部操作区 */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all active:scale-98"
          >
            取消
          </button>
          <button
            type="button"
            disabled={selectedDates.size === 0}
            onClick={() => setShowConfirmDialog(true)}
            className="flex-[2] py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-xs shadow-lg shadow-rose-500/25 flex items-center justify-center gap-1.5 transition-all active:scale-98"
          >
            <Trash2 size={15} />
            <span>确认删除 ({selectedDates.size} 天)</span>
          </button>
        </div>
      </div>

      {/* 二次防误触警示对话框 */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none animate-fadeIn">
          <div className="w-full max-w-xs bg-white rounded-3xl p-5 shadow-2xl space-y-4 animate-scaleUp text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center shadow-inner">
              <AlertTriangle size={24} />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900">确定永久删除这 {selectedDates.size} 天记录？</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                清除后，所选日期的所有摄入热量、营养素配比、三餐明细及体重记录将被彻底清空且无法恢复。
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 text-[11px] text-slate-600 font-mono text-left max-h-24 overflow-y-auto border border-slate-100">
              {Array.from(selectedDates).sort().join(', ')}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
              >
                放弃
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition-all"
              >
                确认彻底清空
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
