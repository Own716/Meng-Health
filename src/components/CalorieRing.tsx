import React from 'react';

interface CalorieRingProps {
  budget: number;       // 今日总目标/预算 (例如 2200)
  consumed: number;     // 已摄入 (例如 1100)
  stageGoal?: number;   // 阶段目标 (例如 1650)
}

export const CalorieRing: React.FC<CalorieRingProps> = ({
  budget,
  consumed,
  stageGoal = 1650,
}) => {
  // 剩余可吃热量
  const remaining = Math.max(0, budget - consumed);
  const percentage = Math.min(100, Math.round((consumed / (budget || 1)) * 100));

  // SVG 圆环参数
  const size = 260;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // 留出底部缺口形成仪表盘效果 (展示 240度)
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  return (
    <div className="flex flex-col items-center justify-center my-3 relative select-none">
      <div className="relative w-[260px] h-[220px] flex items-center justify-center">
        {/* SVG 圆环背景与进度 */}
        <svg
          className="w-[260px] h-[260px] -rotate-90 transform"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* 渐变定义 */}
          <defs>
            <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>

          {/* 底环轨道 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* 进度环 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="url(#calorieGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* 圆环中间的核心数据 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-slate-900 tracking-tight">
              {remaining}
            </span>
            <span className="text-sm font-semibold text-slate-500">千卡</span>
          </div>
          <span className="text-xs font-medium text-slate-400 mt-0.5 tracking-wide">
            今日剩余可吃
          </span>
        </div>
      </div>

      {/* 圆环下方的数据明细展示 */}
      <div className="text-center mt-[-10px]">
        <div className="text-xs font-medium text-slate-600">
          减脂目标: <span className="font-semibold text-slate-800">{stageGoal}</span> / {budget} 千卡
        </div>
        <div className="text-xs text-slate-400 mt-0.5">
          今日已摄入: <span className="font-semibold text-blue-600">{consumed}</span> 千卡
        </div>
      </div>
    </div>
  );
};
