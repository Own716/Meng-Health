import React, { useState } from 'react';
import { X, Sparkles, Check, ArrowRight, Flame, Scale, TrendingDown, Calendar, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types/diet';

interface AiPlanModalProps {
  isOpen: boolean;
  profile: UserProfile;
  onClose: () => void;
  onApplyPlan: (newBudget: number, protein: number, carbs: number, fat: number) => void;
}

export const AiPlanModal: React.FC<AiPlanModalProps> = ({
  isOpen,
  profile,
  onClose,
  onApplyPlan,
}) => {
  if (!isOpen) return null;

  // 用户可随时调整的测算参数
  const [curWeight, setCurWeight] = useState(String(profile.currentWeight || ''));
  const [tgtWeight, setTgtWeight] = useState(String(profile.targetWeight || ''));
  const [height, setHeight] = useState(String(profile.height || ''));
  const [age, setAge] = useState('25');
  const [gender, setGender] = useState<'female' | 'male'>(profile.gender || 'female');
  const [activity, setActivity] = useState<'sedentary' | 'light' | 'moderate' | 'heavy'>('light');
  const [durationDays, setDurationDays] = useState(60); // 期望减脂周期：60天
  const [isCalculated, setIsCalculated] = useState(false);
  const [applied, setApplied] = useState(false);

  // 活动系数映射
  const activityFactors = {
    sedentary: { label: '久坐伏案 (缺乏运动)', factor: 1.2 },
    light: { label: '轻度活动 (每周运动1-3次)', factor: 1.375 },
    moderate: { label: '中度运动 (每周运动3-5次)', factor: 1.55 },
    heavy: { label: '高强度运动 (体力劳动/重训)', factor: 1.725 },
  };

  // 科学推导算法
  const calculatePlan = () => {
    const w = parseFloat(curWeight) || 60;
    const targetW = parseFloat(tgtWeight) || 55;
    const h = parseFloat(height) || 165;
    const a = parseInt(age) || 25;

    // 1. Mifflin-St Jeor 基础代谢 BMR
    const bmr = Math.round(
      10 * w + 6.25 * h - 5 * a + (gender === 'male' ? 5 : -161)
    );

    // 2. 每日总消耗 (摄出量 / TDEE)
    const factor = activityFactors[activity].factor;
    const tdee = Math.round(bmr * factor);

    // 3. 需减重量与热量缺口
    const weightToLose = Math.max(0, w - targetW);
    // 每减 1kg 纯脂肪需制造 7700 kcal 缺口
    const totalDeficitNeeded = weightToLose * 7700;
    const dailyDeficitSuggested = Math.min(600, Math.max(300, Math.round(totalDeficitNeeded / (durationDays || 60))));

    // 4. 建议每日摄入量 (Intake)
    // 摄入量不能低于基础代谢 BMR 太远以防伤身体
    const safeIntake = Math.max(bmr, tdee - dailyDeficitSuggested);

    // 5. 三大营养素智能分配 (推荐减脂期高蛋白策略)
    // 蛋白质：体重 × 1.8g (每克4千卡)
    const proteinGrams = Math.round(w * 1.8);
    const proteinCal = proteinGrams * 4;

    // 脂肪：占总摄入热量 25% (每克9千卡)
    const fatCal = Math.round(safeIntake * 0.25);
    const fatGrams = Math.round(fatCal / 9);

    // 碳水化合物：剩余热量 (每克4千卡)
    const carbsCal = Math.max(0, safeIntake - proteinCal - fatCal);
    const carbsGrams = Math.round(carbsCal / 4);

    return {
      bmr,
      tdee, // 每日摄出量
      safeIntake, // 建议每日摄入量
      dailyDeficitSuggested, // 每日热量缺口
      weightToLose,
      proteinGrams,
      carbsGrams,
      fatGrams,
      weeklyLoss: ((dailyDeficitSuggested * 7) / 7700).toFixed(2),
    };
  };

  const plan = calculatePlan();

  const handleApply = () => {
    onApplyPlan(plan.safeIntake, plan.proteinGrams, plan.carbsGrams, plan.fatGrams);
    setApplied(true);
    setTimeout(() => {
      setApplied(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm select-none animate-fadeIn">
      <div className="w-full sm:max-w-md bg-white rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* 标题 */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-400 to-blue-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">AI 智能摄入与摄出量测算</h3>
              <p className="text-[11px] text-slate-400">基于身材目标与代谢，定制科学减脂计划</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* 输入参数卡片 */}
        <div className="my-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                当前体重 (kg)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={curWeight}
                onChange={(e) => setCurWeight(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                目标体重 (kg)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={tgtWeight}
                onChange={(e) => setTgtWeight(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-emerald-600 focus:bg-white focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">身高 (cm)</label>
              <input
                type="text"
                inputMode="numeric"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-center"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">年龄 (岁)</label>
              <input
                type="text"
                inputMode="numeric"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-center"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">期望周期</label>
              <select
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full px-1 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-center font-medium"
              >
                <option value={30}>30 天</option>
                <option value={60}>60 天</option>
                <option value={90}>90 天</option>
                <option value={120}>120 天</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">日常活动强度</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(activityFactors) as Array<keyof typeof activityFactors>).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setActivity(k)}
                  className={`text-left p-2 rounded-xl border text-[11px] transition-all ${
                    activity === k
                      ? 'bg-blue-50 border-blue-500 text-blue-800 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  {activityFactors[k].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 测算结果报告卡片 */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs border-b border-slate-700 pb-2">
            <span className="font-bold flex items-center gap-1 text-sky-400">
              <Sparkles size={14} /> AI 科学减脂推导报告
            </span>
            <span className="text-slate-300">需减重: <strong className="text-emerald-400">{plan.weightToLose}kg</strong></span>
          </div>

          {/* 摄入量 VS 摄出量 核心指标 */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-white/10 p-3 rounded-xl">
              <div className="flex items-center gap-1 text-xs text-slate-300 font-medium">
                <Scale size={14} className="text-sky-400" />
                <span>每日摄出消耗 (TDEE)</span>
              </div>
              <div className="text-2xl font-black text-sky-300 mt-1">
                {plan.tdee} <span className="text-xs text-slate-300">千卡</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">基础代谢 {plan.bmr} kcal</div>
            </div>

            <div className="bg-white/10 p-3 rounded-xl border border-emerald-500/30">
              <div className="flex items-center gap-1 text-xs text-emerald-300 font-medium">
                <Flame size={14} className="text-emerald-400" />
                <span>建议每日摄入量</span>
              </div>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {plan.safeIntake} <span className="text-xs text-slate-300">千卡</span>
              </div>
              <div className="text-[10px] text-emerald-300/80 mt-0.5">每日缺口约 {plan.dailyDeficitSuggested} kcal</div>
            </div>
          </div>

          {/* 建议三大营养素分配 */}
          <div className="bg-white/5 p-3 rounded-xl text-xs space-y-1.5">
            <div className="text-slate-300 font-semibold text-[11px] mb-1">
              🥗 建议每日三大营养素配比 (高蛋白减脂):
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-blue-500/20 p-1.5 rounded-lg border border-blue-400/30">
                <span className="text-[10px] text-blue-300 block">蛋白质</span>
                <strong className="text-sm text-blue-200">{plan.proteinGrams}g</strong>
              </div>
              <div className="bg-emerald-500/20 p-1.5 rounded-lg border border-emerald-400/30">
                <span className="text-[10px] text-emerald-300 block">碳水化合物</span>
                <strong className="text-sm text-emerald-200">{plan.carbsGrams}g</strong>
              </div>
              <div className="bg-orange-500/20 p-1.5 rounded-lg border border-orange-400/30">
                <span className="text-[10px] text-orange-300 block">健康脂肪</span>
                <strong className="text-sm text-orange-200">{plan.fatGrams}g</strong>
              </div>
            </div>
          </div>

          {/* 预期进度 */}
          <div className="text-[11px] text-slate-300 flex items-center justify-between pt-1">
            <span>预计每周减纯脂: <strong className="text-white">{plan.weeklyLoss} kg</strong></span>
            <span>周期: <strong className="text-sky-300">{durationDays} 天</strong> 达标</span>
          </div>
        </div>

        {/* 一键应用按钮 */}
        <button
          onClick={handleApply}
          disabled={applied}
          className="w-full mt-4 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          {applied ? (
            <>
              <Check size={18} className="text-emerald-300" />
              <span>已成功应用为我的每日目标！</span>
            </>
          ) : (
            <>
              <span>一键应用为此减脂计划 (自动设定目标)</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
