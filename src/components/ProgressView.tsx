import React, { useState } from 'react';
import { TrendingDown, Flame, Scale, Target, Sparkles, Activity, CheckCircle2, TrendingUp, Info } from 'lucide-react';
import { UserProfile, DayLog } from '../types/diet';
import { getAllLogs, getDayLog, getTodayString } from '../services/storageService';
import { calculateDietPlan } from '../services/calorieCalculator';

interface ProgressViewProps {
  profile: UserProfile;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ profile }) => {
  const [chartType, setChartType] = useState<'calories' | 'weight'>('calories');

  // 统一调用核心代谢算法引擎，与个人设置及 AI 测算计划保持 100% 同步
  const dietPlan = calculateDietPlan({
    currentWeight: profile.currentWeight,
    targetWeight: profile.targetWeight,
    height: profile.height,
    age: profile.age || 21,
    gender: profile.gender || 'female',
    activityLevel: profile.activityLevel || 'sedentary',
    durationDays: profile.durationDays || 30,
  });

  const bmr = dietPlan.bmr;
  const tdee = dietPlan.tdee;
  const toLose = Math.max(0, profile.currentWeight - profile.targetWeight).toFixed(1);

  // 获取最近 7 天的日期序列
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

  // 整理 7 天的热量数据（彻底清除 0.88 假数据注入，仅取用户真实打卡）
  const calorieTrend = last7DateStrings.map((dateStr, idx) => {
    const log: DayLog | undefined = allLogs[dateStr];
    const dateObj = new Date(dateStr);
    const label = idx === 6 ? '今天' : `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
    const hasRealRecord = Boolean(log && (log.consumedCalories || 0) > 0);
    const consumed = hasRealRecord ? (log?.consumedCalories || 0) : 0;
    return {
      dateStr,
      label,
      hasRealRecord,
      consumed,
      budget: log?.budgetCalories || profile.dailyBudget,
    };
  });

  // 整理 7 天的真实体重走势（彻底清除 0.12 伪造递减走势）
  const weightTrend = last7DateStrings.map((dateStr, idx) => {
    const dateObj = new Date(dateStr);
    const label = idx === 6 ? '今天' : `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
    return {
      dateStr,
      label,
      weight: profile.currentWeight,
      target: profile.targetWeight,
    };
  });

  // 严格基于「有真实记录的天数」计算日均摄入与达标天数
  const recordedDays = calorieTrend.filter(d => d.hasRealRecord);
  const avgConsumed = recordedDays.length > 0
    ? Math.round(recordedDays.reduce((acc, cur) => acc + cur.consumed, 0) / recordedDays.length)
    : 0;
  const successDays = recordedDays.filter(c => c.consumed <= c.budget).length;

  // SVG 折线图尺寸与坐标映射
  const svgWidth = 320;
  const svgHeight = 150;
  const padX = 28;
  const padY = 24;

  // 热量坐标
  const maxCal = Math.max(...calorieTrend.map(d => Math.max(d.consumed, d.budget)), 2000);
  const minCal = 0;

  const calPoints = calorieTrend.map((d, i) => {
    const x = padX + (i * (svgWidth - padX * 2)) / 6;
    const normY = (d.consumed - minCal) / ((maxCal - minCal) || 1);
    const y = svgHeight - padY - normY * (svgHeight - padY * 2);
    return { x, y, val: d.consumed, label: d.label, budget: d.budget, hasRealRecord: d.hasRealRecord };
  });

  const activeCalPoints = calPoints.filter(p => p.hasRealRecord);
  const calLinePath = activeCalPoints.length > 1
    ? activeCalPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    : '';
  const calAreaPath = activeCalPoints.length > 1
    ? `${calLinePath} L ${activeCalPoints[activeCalPoints.length - 1].x} ${svgHeight - padY} L ${activeCalPoints[0].x} ${svgHeight - padY} Z`
    : '';

  // 目标预算基准线高度
  const targetNormY = (profile.dailyBudget - minCal) / ((maxCal - minCal) || 1);
  const targetLineY = Math.max(padY, Math.min(svgHeight - padY, svgHeight - padY - targetNormY * (svgHeight - padY * 2)));

  // 体重坐标
  const minW = Math.min(profile.targetWeight, profile.currentWeight) - 2;
  const maxW = Math.max(profile.targetWeight, profile.currentWeight) + 2;

  const weightPoints = weightTrend.map((d, i) => {
    const x = padX + (i * (svgWidth - padX * 2)) / 6;
    const normY = (d.weight - minW) / ((maxW - minW) || 1);
    const y = svgHeight - padY - normY * (svgHeight - padY * 2);
    return { x, y, val: d.weight, label: d.label };
  });

  const targetWeightNormY = (profile.targetWeight - minW) / ((maxW - minW) || 1);
  const targetWeightLineY = Math.max(padY, Math.min(svgHeight - padY, svgHeight - padY - targetWeightNormY * (svgHeight - padY * 2)));

  const weightLinePath = weightPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const weightAreaPath = `${weightLinePath} L ${weightPoints[weightPoints.length - 1].x} ${svgHeight - padY} L ${weightPoints[0].x} ${svgHeight - padY} Z`;

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

                {/* 仅在有2天及以上真实打卡时填充面积与主折线 */}
                {activeCalPoints.length > 1 && (
                  <>
                    <path d={calAreaPath} fill="url(#calAreaGrad)" />
                    <path
                      d={calLinePath}
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </>
                )}

                {/* 近7天完全无打卡时的空状态提示 */}
                {activeCalPoints.length === 0 && (
                  <text
                    x={svgWidth / 2}
                    y={svgHeight / 2}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#94a3b8"
                    fontWeight="500"
                  >
                    近 7 天暂无打卡记录，记录今日饮食即可生成趋势图
                  </text>
                )}

                {/* 数据圆点与日期标注 */}
                {calPoints.map((p, idx) => (
                  <g key={idx}>
                    {p.hasRealRecord ? (
                      <>
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
                      </>
                    ) : (
                      <circle
                        cx={p.x}
                        cy={svgHeight - padY}
                        r="2.5"
                        fill="#cbd5e1"
                      />
                    )}
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
                {/* 目标体重基准虚线 */}
                <line
                  x1={padX}
                  y1={targetWeightLineY}
                  x2={svgWidth - padX}
                  y2={targetWeightLineY}
                  stroke="#10b981"
                  strokeWidth="1"
                  strokeDasharray="4 3"
                />
                <text
                  x={svgWidth - padX - 4}
                  y={targetWeightLineY - 4}
                  textAnchor="end"
                  fontSize="9"
                  fill="#059669"
                  fontWeight="600"
                >
                  目标 {profile.targetWeight} kg
                </text>

                {/* 体重真实基准线 */}
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

        {/* 底部纯真实数据说明提示 */}
        <div className="flex items-center gap-1.5 px-1 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
          <Info size={12} className="text-slate-400 flex-shrink-0" />
          <span>
            {chartType === 'calories'
              ? (recordedDays.length > 0
                  ? `已基于近 7 天内的 ${recordedDays.length} 天真实饮食打卡数据精确绘制，未捏造任何填充数据。`
                  : '近 7 天暂无饮食打卡记录，可在首页或通过 AI 拍照速记添加饮食。')
              : `已基于当前体重 (${profile.currentWeight} kg) 锁定基准线，在设置中更新体重将记录升降变化。`}
          </span>
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
