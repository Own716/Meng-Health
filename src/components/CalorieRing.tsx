import React from 'react';

interface CalorieRingProps {
  budget: number;       // 今日总目标/预算 (例如 2200)
  consumed: number;     // 已摄入 (例如 1100)
  stageGoal?: number;   // 阶段目标 (例如 1650)
  expenditure?: number; // 摄出消耗量 (例如 2400)
}

export const CalorieRing: React.FC<CalorieRingProps> = ({
  budget,
  consumed,
  stageGoal,
  expenditure,
}) => {
  // 剩余可吃热量
  const remaining = Math.max(0, budget - consumed);
  const percentage = Math.min(100, Math.round((consumed / (budget || 1)) * 100));

  // SVG 圆环参数
  const size = 250;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  return (
    <div className="flex flex-col items-center justify-center my-2 relative select-none">
      {/* 圆环容器：必须使用与 SVG 一致的高度，杜绝文本重叠 */}
      <div className="relative w-[250px] h-[250px] flex items-center justify-center">
        {/* SVG 圆环 */}
        <svg
          className="w-[250px] h-[250px] -rotate-90 transform"
          viewBox={`0 0 ${size} ${size}`}
        >
          <defs>
            <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>

          {/* 浅灰底环 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />

          {/* 渐变进度环 */}
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

        {/* 圆环正中心的核心数据 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-black text-slate-900 tracking-tight">
              {remaining}
            </span>
            <span className="text-xs font-bold text-slate-500">千卡</span>
          </div>
          <span className="text-xs font-semibold text-slate-400 mt-1">
            今日剩余可吃
          </span>
        </div>
      </div>

      {/* 圆环正下方的辅助信息卡片：今日最多摄入量与今日已摄入 */}
      <div className="flex items-center justify-center gap-4 mt-2 px-4 py-1.5 rounded-full bg-slate-100/90 text-xs font-semibold text-slate-700 shadow-sm border border-slate-200/50">
        <div>
          今日最多摄入量: <span className="font-black text-slate-900">{budget}</span> 千卡
        </div>
        <div className="w-[1px] h-3.5 bg-slate-300" />
        <div>
          今日已摄入: <span className="font-black text-blue-600">{consumed}</span> 千卡
        </div>
      </div>
    </div>
  );
};
