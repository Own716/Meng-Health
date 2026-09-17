import React, { useState } from 'react';
import { X, Save, Sparkles, Check } from 'lucide-react';
import { UserProfile } from '../types/diet';
import { saveUserProfile } from '../services/storageService';

interface ProfileModalProps {
  isOpen: boolean;
  profile: UserProfile;
  onClose: () => void;
  onUpdateProfile: (p: UserProfile) => void;
  onOpenAiPlan?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  profile,
  onClose,
  onUpdateProfile,
  onOpenAiPlan,
}) => {
  if (!isOpen) return null;

  const [nickname, setNickname] = useState(profile.nickname || '梦梦');
  const [gender, setGender] = useState<'female' | 'male'>(profile.gender || 'female');
  const [age, setAge] = useState(String(profile.age || 25));
  const [height, setHeight] = useState(profile.height ? String(profile.height) : '165');
  const [currentWeight, setCurrentWeight] = useState(profile.currentWeight ? String(profile.currentWeight) : '58');
  const [targetWeight, setTargetWeight] = useState(profile.targetWeight ? String(profile.targetWeight) : '52');

  const [savedTip, setSavedTip] = useState(false);

  // 弹窗打开时同步最新的 profile 数据
  React.useEffect(() => {
    if (isOpen) {
      if (profile.nickname) setNickname(profile.nickname);
      if (profile.gender) setGender(profile.gender);
      if (profile.age) setAge(String(profile.age));
      if (profile.height) setHeight(String(profile.height));
      if (profile.currentWeight) setCurrentWeight(String(profile.currentWeight));
      if (profile.targetWeight) setTargetWeight(String(profile.targetWeight));
    }
  }, [isOpen, profile]);

  // 科学推导推荐摄入量 (Mifflin-St Jeor 基础代谢 + TDEE 轻活动 - 500kcal 减脂缺口)
  const calcHeight = parseFloat(height) || 165;
  const calcWeight = parseFloat(currentWeight) || 58;
  const calcTarget = parseFloat(targetWeight) || 52;
  const calcAge = parseInt(age) || 25;

  const bmr = Math.round(
    10 * calcWeight + 6.25 * calcHeight - 5 * calcAge + (gender === 'male' ? 5 : -161)
  );
  const tdee = Math.round(bmr * 1.375);
  // 减脂期建议每日摄入量
  const autoDailyBudget = Math.max(1200, tdee - 500);
  const autoProtein = Math.round(calcWeight * 1.8);
  const autoFat = Math.round((autoDailyBudget * 0.25) / 9);
  const autoCarbs = Math.round((autoDailyBudget - autoProtein * 4 - autoFat * 9) / 4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedProfile: UserProfile = {
      ...profile,
      nickname: nickname.trim() || '梦梦',
      gender,
      age: calcAge,
      height: calcHeight,
      currentWeight: calcWeight,
      targetWeight: calcTarget,
      // 自动采用科学 AI 计划预算，用户无需手动填选复杂数字
      dailyBudget: autoDailyBudget,
      targetProtein: autoProtein,
      targetCarbs: autoCarbs,
      targetFat: autoFat,
    };

    saveUserProfile(updatedProfile);
    onUpdateProfile(updatedProfile);
    setSavedTip(true);
    setTimeout(() => {
      setSavedTip(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm select-none animate-fadeIn">
      <div className="w-full sm:max-w-md bg-white rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* 顶部标题与关闭 */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">修改个人身材与基础指标</h3>
            <p className="text-[11px] text-slate-400">仅需填写身高体重，AI 将自动科学计算热量预算</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* AI 减脂计划联动入口 */}
        {onOpenAiPlan && (
          <div className="my-3.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAiPlan();
              }}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-xs flex items-center justify-between shadow-md shadow-sky-500/20 active:scale-[0.99] transition-all"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles size={16} className="text-amber-300" />
                <span>进入 AI 智能计算摄入量与摄出量 (生成计划)</span>
              </span>
              <span className="text-[11px] bg-white/20 px-2.5 py-0.5 rounded-full font-semibold">详细测算 &gt;</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* 昵称与性别 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                称呼昵称
              </label>
              <input
                type="text"
                placeholder="梦梦"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                生理性别
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-0.5 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    gender === 'female'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  女生
                </button>
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    gender === 'male'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  男生
                </button>
              </div>
            </div>
          </div>

          {/* 年龄与身高 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                年龄 (岁)
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="25"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                身高 (cm)
              </label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="165"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:border-blue-500"
              />
            </div>
          </div>

          {/* 当前体重与目标体重 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                当前体重 (kg)
              </label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="58"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:border-blue-500 font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                目标体重 (kg)
              </label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="52"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:border-emerald-500 font-bold text-emerald-600"
              />
            </div>
          </div>

          {/* 自动科学计算出的摄入与营养卡片 (无需用户手动选择) */}
          <div className="mt-2 p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200/60 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-950 flex items-center gap-1">
                <Sparkles size={14} className="text-sky-600" />
                <span>AI 智能测算每日摄入量与营养计划</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-200/60 text-sky-800 font-bold">
                智能自适应
              </span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-sky-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">建议今日最多摄入</span>
                <span className="text-xl font-black text-blue-600">{autoDailyBudget} <span className="text-xs font-semibold text-slate-500">大卡</span></span>
              </div>
              <div className="text-right text-[11px] text-slate-500 space-y-0.5">
                <div>蛋白质 <strong>{autoProtein}g</strong></div>
                <div>碳水 <strong>{autoCarbs}g</strong> · 脂肪 <strong>{autoFat}g</strong></div>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              * 依据国际 Mifflin-St Jeor 基础代谢公式与每日健康安全减脂缺口智能测算，点击保存自动生效。
            </p>
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5"
          >
            {savedTip ? (
              <>
                <Check size={16} />
                <span>已保存并应用 AI 减脂计划！</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>保存身体指标并自动应用计划</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
