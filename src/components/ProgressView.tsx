import React from 'react';
import { TrendingDown, Flame, Scale, Target, Sparkles } from 'lucide-react';
import { UserProfile } from '../types/diet';

interface ProgressViewProps {
  profile: UserProfile;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ profile }) => {
  // Mifflin-St Jeor 基础代谢计算
  // 男性：10*体重 + 6.25*身高 - 5*年龄 + 5
  // 女性：10*体重 + 6.25*身高 - 5*年龄 - 161
  const age = 25;
  const bmr = Math.round(
    10 * profile.currentWeight + 6.25 * profile.height - 5 * age + (profile.gender === 'male' ? 5 : -161)
  );
  // 轻度活动每日消耗 TDEE
  const tdee = Math.round(bmr * 1.375);
  const toLose = (profile.currentWeight - profile.targetWeight).toFixed(1);

  return (
    <div className="px-5 pb-28 pt-2 select-none animate-fadeIn space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <TrendingDown size={20} className="text-blue-600" />
          <span>身材与减脂进度</span>
        </h2>
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

      {/* 基础代谢与每日消耗科学指标 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
            <Flame size={14} className="text-orange-500" />
            <span>BMR 基础代谢</span>
          </div>
          <div className="text-2xl font-black text-slate-800">{bmr} <span className="text-xs font-normal text-slate-400">千卡</span></div>
          <p className="text-[10px] text-slate-400 mt-1">完全静止呼吸所需的最低热量</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
            <Scale size={14} className="text-blue-500" />
            <span>TDEE 每日总消耗</span>
          </div>
          <div className="text-2xl font-black text-slate-800">{tdee} <span className="text-xs font-normal text-slate-400">千卡</span></div>
          <p className="text-[10px] text-slate-400 mt-1">包含日常轻度活动的总消耗量</p>
        </div>
      </div>

      {/* 科学减脂指南 */}
      <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 text-xs leading-relaxed space-y-1.5 text-sky-900">
        <div className="font-bold flex items-center gap-1">
          <Sparkles size={14} className="text-sky-600" />
          <span>科学减重小建议</span>
        </div>
        <p className="text-slate-600 text-[11px]">
          1. 制造每天 300 ~ 500 千卡的热量缺口，每周能稳步减少 0.4 ~ 0.5kg 纯脂肪，不掉肌肉不伤代谢。
        </p>
        <p className="text-slate-600 text-[11px]">
          2. 蛋白质建议每天按体重 × 1.6g~2.0g 摄入，维持饱腹感并保护瘦体重。
        </p>
      </div>
    </div>
  );
};
