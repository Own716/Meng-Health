import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, ArrowRight, Flame, Scale, TrendingDown, Calendar, ShieldCheck, MessageSquare } from 'lucide-react';
import { UserProfile } from '../types/diet';
import { calculateDietPlan, ACTIVITY_MULTIPLIERS } from '../services/calorieCalculator';
import { generateAiPlanCoaching } from '../services/aiService';

interface AiPlanModalProps {
  isOpen: boolean;
  profile: UserProfile;
  onClose: () => void;
  onApplyPlan: (updatedProfile: UserProfile) => void;
}

export const AiPlanModal: React.FC<AiPlanModalProps> = ({
  isOpen,
  profile,
  onClose,
  onApplyPlan,
}) => {
  if (!isOpen) return null;

  // 用户可随时调整的测算参数（严格从已有 profile 初始化，确保二次打开时完整保留）
  const [curWeight, setCurWeight] = useState(profile.currentWeight ? String(profile.currentWeight) : '58.5');
  const [tgtWeight, setTgtWeight] = useState(profile.targetWeight ? String(profile.targetWeight) : '52.0');
  const [height, setHeight] = useState(profile.height ? String(profile.height) : '165');
  const [age, setAge] = useState(profile.age ? String(profile.age) : '25');
  const [gender, setGender] = useState<'female' | 'male'>(profile.gender || 'female');
  const [activity, setActivity] = useState<'sedentary' | 'light' | 'moderate' | 'heavy'>(profile.activityLevel || 'light');
  const [durationDays, setDurationDays] = useState(profile.durationDays || 60);
  const [applied, setApplied] = useState(false);
  const [aiCoaching, setAiCoaching] = useState<string>('');
  const [loadingCoaching, setLoadingCoaching] = useState(false);

  // 每次弹窗打开时，根据最新的 profile 初始化各项参数，保证保存的设置始终记忆生效
  useEffect(() => {
    if (isOpen) {
      if (profile.currentWeight) setCurWeight(String(profile.currentWeight));
      if (profile.targetWeight) setTgtWeight(String(profile.targetWeight));
      if (profile.height) setHeight(String(profile.height));
      if (profile.age) setAge(String(profile.age));
      if (profile.gender) setGender(profile.gender);
      if (profile.activityLevel) setActivity(profile.activityLevel);
      if (profile.durationDays) setDurationDays(profile.durationDays);
    }
  }, [isOpen, profile]);

  // 科学确定性算法推导
  const plan = calculateDietPlan({
    currentWeight: parseFloat(curWeight) || 58.5,
    targetWeight: parseFloat(tgtWeight) || 52.0,
    height: parseFloat(height) || 165,
    age: parseInt(age) || 25,
    gender,
    activityLevel: activity,
    durationDays: durationDays || 60,
  });

  // 获取 AI 智能教练专属建议
  const handleFetchAiCoaching = async () => {
    setLoadingCoaching(true);
    try {
      const coaching = await generateAiPlanCoaching(
        {
          ...profile,
          currentWeight: parseFloat(curWeight) || profile.currentWeight,
          targetWeight: parseFloat(tgtWeight) || profile.targetWeight,
          height: parseFloat(height) || profile.height,
          age: parseInt(age) || profile.age || 25,
          gender,
          durationDays,
        },
        plan
      );
      setAiCoaching(coaching);
    } catch {
      setAiCoaching('建议减脂期保证充足水份，主食粗细搭配，多选择鱼虾鸡胸等优质高蛋白。');
    } finally {
      setLoadingCoaching(false);
    }
  };

  const handleApply = () => {
    // 关键升级：将用户修改的体重、身高、年龄、性别、活动水平、减脂周期、预算和三大营养素完整保存
    const updatedProfile: UserProfile = {
      ...profile,
      currentWeight: parseFloat(curWeight) || profile.currentWeight,
      targetWeight: parseFloat(tgtWeight) || profile.targetWeight,
      height: parseFloat(height) || profile.height,
      age: parseInt(age) || profile.age || 25,
      gender,
      activityLevel: activity,
      durationDays: durationDays || 60,
      dailyBudget: plan.safeIntake,
      targetProtein: plan.proteinGrams,
      targetCarbs: plan.carbsGrams,
      targetFat: plan.fatGrams,
    };

    onApplyPlan(updatedProfile);
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
              <p className="text-[11px] text-slate-400">基于身体代谢与真实目标，定制科学减脂计划</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* 身体参数输入表单 */}
        <div className="py-4 space-y-3.5 text-xs">
          {/* 性别选择 */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">生理性别 (基础代谢系数不同)</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`py-2 rounded-xl font-bold border transition-all ${
                  gender === 'female'
                    ? 'bg-rose-50 border-rose-400 text-rose-600 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                👩 女性
              </button>
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`py-2 rounded-xl font-bold border transition-all ${
                  gender === 'male'
                    ? 'bg-blue-50 border-blue-400 text-blue-600 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                👨 男性
              </button>
            </div>
          </div>

          {/* 身高、当前体重、目标体重、年龄 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">身高 (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="165"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">年龄 (周岁)</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="25"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none font-bold text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">当前体重 (kg)</label>
              <input
                type="number"
                step="0.1"
                value={curWeight}
                onChange={(e) => setCurWeight(e.target.value)}
                placeholder="58.5"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">目标体重 (kg)</label>
              <input
                type="number"
                step="0.1"
                value={tgtWeight}
                onChange={(e) => setTgtWeight(e.target.value)}
                placeholder="52.0"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none font-bold text-emerald-600"
              />
            </div>
          </div>

          {/* 期望减脂周期 */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-slate-700">期望减脂周期</label>
              <span className="font-black text-blue-600">{durationDays} 天</span>
            </div>
            <input
              type="range"
              min="20"
              max="180"
              step="5"
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>快速 30天</span>
              <span>稳健 60天 (推荐)</span>
              <span>平缓 90天+</span>
            </div>
          </div>

          {/* 活动水平 */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">日常日常活动强度</label>
            <div className="space-y-1.5">
              {(Object.keys(ACTIVITY_MULTIPLIERS) as Array<keyof typeof ACTIVITY_MULTIPLIERS>).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setActivity(k)}
                  className={`w-full py-2 px-3 rounded-xl border text-left font-medium transition-all ${
                    activity === k
                      ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  {ACTIVITY_MULTIPLIERS[k].label}
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
            <span className="text-slate-300">需减重: <strong className="text-emerald-400">{plan.weightToLose} kg</strong></span>
          </div>

          {/* 摄入量 VS 摄出量 核心指标 */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-white/10 p-3 rounded-xl">
              <div className="flex items-center gap-1 text-xs text-slate-300 font-medium">
                <Scale size={14} className="text-sky-400" />
                <span>每日摄出消耗 (TDEE)</span>
              </div>
              <div className="text-2xl font-black text-sky-300 mt-1">
                {plan.tdee} <span className="text-xs text-slate-300">大卡</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">基础代谢 {plan.bmr} 大卡</div>
            </div>

            <div className="bg-white/10 p-3 rounded-xl border border-emerald-500/30">
              <div className="flex items-center gap-1 text-xs text-emerald-300 font-medium">
                <Flame size={14} className="text-emerald-400" />
                <span>建议每日摄入量</span>
              </div>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {plan.safeIntake} <span className="text-xs text-slate-300">大卡</span>
              </div>
              <div className="text-[10px] text-emerald-300/80 mt-0.5">每日缺口约 {plan.dailyDeficit} 大卡</div>
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
            <span>预计每周减纯脂: <strong className="text-white">{plan.weeklyPaceKg} kg</strong></span>
            <span>周期: <strong className="text-sky-300">{durationDays} 天</strong> 达标</span>
          </div>

          {/* AI 营养教练建议 */}
          <div className="pt-1">
            {aiCoaching ? (
              <div className="p-3 bg-sky-950/60 border border-sky-500/30 rounded-xl text-xs text-sky-200 leading-relaxed animate-fadeIn">
                <div className="font-bold flex items-center gap-1.5 text-sky-400 mb-1">
                  <MessageSquare size={13} /> AI 营养师专属指导：
                </div>
                {aiCoaching}
              </div>
            ) : (
              <button
                type="button"
                onClick={handleFetchAiCoaching}
                disabled={loadingCoaching}
                className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-sky-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Sparkles size={13} />
                <span>{loadingCoaching ? 'AI 正在生成定制营养建议...' : '获取 AI 营养师专属减脂建议'}</span>
              </button>
            )}
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
              <span>已保存配置并应用为每日目标！</span>
            </>
          ) : (
            <>
              <span>一键保存并应用为每日目标</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
