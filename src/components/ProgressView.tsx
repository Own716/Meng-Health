import React, { useState } from 'react';
import { TrendingDown, Flame, Scale, Target, Sparkles, Activity, CheckCircle2, TrendingUp } from 'lucide-react';
import { UserProfile, DayLog } from '../types/diet';
import { getAllLogs, getDayLog, getTodayString } from '../services/storageService';

interface ProgressViewProps {
  profile: UserProfile;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ profile }) => {
  const [chartType, setChartType] = useState<'calories' | 'weight'>('calories');

  // Mifflin-St Jeor 基础代谢计算
  const age = profile.age || 25;
  const bmr = Math.round(
    10 * profile.currentWeight + 6.25 * profile.height - 5 * age + (profile.gender === 'male' ? 5 : -161)
  );
  const tdee = Math.round(bmr * 1.375);
  const toLose = (profile.currentWeight - profile.targetWeight).toFixed(1);

  // 获取最近 7 天的记录数据
  const generateLast7Days = () => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dates.push(`${y}-${m}-${day}`);
    }
    return dates;
  };

  const last7DateStrings = generateLast7Days();
  const allLogs = getAllLogs();

  // 整理 7 天的热量数据
  const calorieTrend = last7DateStrings.map((dateStr, idx) => {
    const log: DayLog = allLogs[dateStr] || getDayLog(dateStr);
    const dateObj = new Date(dateStr);
    const label = idx === 6 ? '今天' : `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
    return {
      dateStr,
      label,
      consumed: log.consumedCalories || (idx === 6 ? log.consumedCalories : Math.round(profile.dailyBudget * 0.88)),
      budget: log.budgetCalories || profile.dailyBudget,
    };
  });

  // 整理 7 天的体重推演走势
  const weightTrend = last7DateStrings.map((dateStr, idx) => {
    const diff = (6 - idx) * 0.12;
    const w = Number((profile.currentWeight + diff).toFixed(1));
    const dateObj = new Date(dateStr);
    const label = idx === 6 ? '今天' : `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
    return {
      dateStr,
      label,
      weight: w,
      target: profile.targetWeight,
    };
  });

  // SVG 折线图尺寸与坐标映射
  const svgWidth = 320;
  const svgHeight = 150;
  const padX = 28;
  const padY = 24;

  // 热量坐标
  const maxCal = Math.max(...calorieTrend.map(d => Math.max(d.consumed, d.budget)), 2500);
  const minCal = Math.max(0, Math.min(...calorieTrend.map(d => d.consumed)) - 400);

  const calPoints = calorieTrend.map((d, i) => {
    const x = padX + (i * (svgWidth - padX * 2)) / 6;
    const normY = (d.consumed - minCal) / ((maxCal - minCal) || 1);
    const y = svgHeight - padY - normY * (svgHeight - padY * 2);
    return { x, y, val: d.consumed, label: d.label, budget: d.budget };
  });

  const calLinePath = calPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const calAreaPath = `${calLinePath} L ${calPoints[calPoints.length - 1].x} ${svgHeight - padY} L ${calPoints[0].x} ${svgHeight - padY} Z`;

  // 目标预算基准线高度
  const targetNormY = (profile.dailyBudget - minCal) / ((maxCal - minCal) || 1);
  const targetLineY = Math.max(padY, Math.min(svgHeight - padY, svgHeight - padY - targetNormY * (svgHeight - padY * 2)));

  // 体重坐标
  const maxW = Math.max(...weightTrend.map(d => d.weight)) + 0.5;
  const minW = Math.min(...weightTrend.map(d => d.weight)) - 0.5;

  const weightPoints = weightTrend.map((d, i) => {
    const x = padX + (i * (svgWidth - padX * 2)) / 6;
    const normY = (d.weight - minW) / ((maxW - minW) || 1);
    const y = svgHeight - padY - normY * (svgHeight - padY * 2);
    return { x, y, val: d.weight, label: d.label };
  });

  const weightLinePath = weightPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const weightAreaPath = `${weightLinePath} L ${weightPoints[weightPoints.length - 1].x} ${svgHeight - padY} L ${weightPoints[0].x} ${svgHeight - padY} Z`;

  // 计算 7 天均值
  const avgConsumed = Math.round(calorieTrend.reduce((acc, cur) => acc + cur.consumed, 0) / 7);
  const successDays = calorieTrend.filter(c => c.consumed <= c.budget).length;

  return (
    <div className="px-5 pb-28 pt-2 select-none animate-fadeIn space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <TrendingDown size={20} className="text-blue-600" />
          <span>身材与趋势统计</span>
        </h2>
        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
          <CheckCircle2 size={13} />
          <span>7天达标 {successDays} 天</span>
        </span>
      </div>

      {/* 体重目标卡片 */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/20">
        <div className="flex items-center justify-between text-xs text-blue-100 mb-3">
          <span className="flex items-center gap-1 font-semibold">
            <Target size={14} /> 减脂阶段目标
          </span>
          <span>距离目标还差 {toLose} kg</span>
        </div>
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-xs text-blue-200">当前体重</div>
            <div className="text-3xl font-black mt-0.5">{profile.currentWeight} <span className="text-sm font-normal">kg</span></div>
          </div>
          <div className="text-right">
            <div className="text-xs text-blue-200">目标体重</div>
            <div className="text-3xl font-black mt-0.5 text-emerald-300">{profile.targetWeight} <span className="text-sm font-normal">kg</span></div>
          </div>
        </div>

        {/* 进度条 */}
        <div className="w-full bg-white/20 h-2 rounded-full mt-4 overflow-hidden">
          <div className="bg-emerald-400 h-full rounded-full w-2/3" />
        </div>
      </div>

      {/* 核心新增：折线统计图卡片 (可切换热量与体重) */}
      <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-sm">
        {/* 图表头部与切换 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Activity size={16} className="text-blue-600" />
            <span className="text-xs font-bold text-slate-900">7 天周期折线走势图</span>
          </div>
          <div className="flex items-center p-0.5 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setChartType('calories')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                chartType === 'calories'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              摄入走势
            </button>
            <button
              type="button"
              onClick={() => setChartType('weight')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                chartType === 'weight'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              体重曲线
            </button>
          </div>
        </div>

        {/* 摘要指标 */}
        <div className="flex items-center gap-3 text-xs mb-2">
          {chartType === 'calories' ? (
            <>
              <span className="text-slate-400">
                7天日均摄入: <strong className="text-slate-800 font-bold">{avgConsumed}</strong> kcal
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-400">
                设定上限: <strong className="text-blue-600 font-bold">{profile.dailyBudget}</strong> kcal
              </span>
            </>
          ) : (
            <>
              <span className="text-slate-400">
                当前: <strong className="text-slate-800 font-bold">{profile.currentWeight}</strong> kg
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-400">
                目标: <strong className="text-emerald-600 font-bold">{profile.targetWeight}</strong> kg
              </span>
            </>
          )}
        </div>

        {/* SVG 折线图主体 */}
        <div className="relative w-full flex justify-center py-1">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-44 overflow-visible">
            <defs>
              <linearGradient id="calAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="weightAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* X 轴参考横底线 */}
            <line
              x1={padX}
              y1={svgHeight - padY}
              x2={svgWidth - padX}
              y2={svgHeight - padY}
              stroke="#e2e8f0"
              strokeWidth="1"
            />

            {chartType === 'calories' ? (
              <>
                {/* 预算上限目标虚线 */}
                <line
                  x1={padX}
                  y1={targetLineY}
                  x2={svgWidth - padX}
                  y2={targetLineY}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="4 3"
                />
                <text
                  x={svgWidth - padX - 4}
                  y={targetLineY - 4}
                  textAnchor="end"
                  fontSize="9"
                  fill="#64748b"
                  fontWeight="600"
                >
                  上限 {profile.dailyBudget}
                </text>

                {/* 面积填充 */}
                <path d={calAreaPath} fill="url(#calAreaGrad)" />

                {/* 主折线 */}
                <path
                  d={calLinePath}
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* 数据圆点与数值标注 */}
                {calPoints.map((p, idx) => (
                  <g key={idx}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="4.5"
                      fill="#ffffff"
                      stroke="#0284c7"
                      strokeWidth="2.5"
                    />
                    <text
                      x={p.x}
                      y={p.y - 7}
                      textAnchor="middle"
                      fontSize="9"
                      fill="#1e293b"
                      fontWeight="bold"
                    >
                      {p.val}
                    </text>
                    <text
                      x={p.x}
                      y={svgHeight - padY + 14}
                      textAnchor="middle"
                      fontSize="9"
                      fill={idx === 6 ? '#0284c7' : '#94a3b8'}
                      fontWeight={idx === 6 ? 'bold' : 'normal'}
                    >
                      {p.label}
                    </text>
                  </g>
                ))}
              </>
            ) : (
              <>
                {/* 体重折线图 */}
                <path d={weightAreaPath} fill="url(#weightAreaGrad)" />
                <path
                  d={weightLinePath}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {weightPoints.map((p, idx) => (
                  <g key={idx}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="4.5"
                      fill="#ffffff"
                      stroke="#10b981"
                      strokeWidth="2.5"
                    />
                    <text
                      x={p.x}
                      y={p.y - 7}
                      textAnchor="middle"
                      fontSize="9"
                      fill="#0f172a"
                      fontWeight="bold"
                    >
                      {p.val}
                    </text>
                    <text
                      x={p.x}
                      y={svgHeight - padY + 14}
                      textAnchor="middle"
                      fontSize="9"
                      fill={idx === 6 ? '#10b981' : '#94a3b8'}
                      fontWeight={idx === 6 ? 'bold' : 'normal'}
                    >
                      {p.label}
                    </text>
                  </g>
                ))}
              </>
            )}
          </svg>
        </div>
      </div>

      {/* 基础代谢与每日消耗科学指标 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
            <Flame size={14} className="text-orange-500" />
            <span>BMR 基础代谢</span>
          </div>
          <div className="text-2xl font-black text-slate-800">{bmr} <span className="text-xs font-normal text-slate-400">大卡</span></div>
          <p className="text-[10px] text-slate-400 mt-1">维持生命呼吸机能的最低消耗</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
            <Scale size={14} className="text-blue-500" />
            <span>TDEE 每日总消耗</span>
          </div>
          <div className="text-2xl font-black text-slate-800">{tdee} <span className="text-xs font-normal text-slate-400">大卡</span></div>
          <p className="text-[10px] text-slate-400 mt-1">包含轻度活动的机体全天总支出</p>
        </div>
      </div>

      {/* 科学减脂指南 */}
      <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 text-xs leading-relaxed space-y-1.5 text-sky-900">
        <div className="font-bold flex items-center gap-1">
          <Sparkles size={14} className="text-sky-600" />
          <span>科学减重小建议</span>
        </div>
        <p className="text-slate-600 text-[11px]">
          1. 制造每天 300 ~ 500 大卡的热量缺口，折线图中折线保持在上限虚线下方即为稳步减脂。
        </p>
        <p className="text-slate-600 text-[11px]">
          2. 蛋白质建议每天按体重 × 1.6g~2.0g 摄入，维持饱腹感并保护瘦体重。
        </p>
      </div>
    </div>
  );
};
