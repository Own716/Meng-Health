import React, { useState } from 'react';
import { X, Save, Database, Sparkles } from 'lucide-react';
import { UserProfile } from '../types/diet';
import { saveUserProfile } from '../services/storageService';

interface ProfileModalProps {
  isOpen: boolean;
  profile: UserProfile;
  onClose: () => void;
  onUpdateProfile: (p: UserProfile) => void;
  onOpenBackup: () => void;
  onOpenAiPlan?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  profile,
  onClose,
  onUpdateProfile,
  onOpenBackup,
  onOpenAiPlan,
}) => {
  if (!isOpen) return null;

  // 使用字符串状态，保证用户在退格删除时可以彻底清空，绝不会自动变成 0
  const [nickname, setNickname] = useState(profile.nickname || '');
  const [height, setHeight] = useState(profile.height ? String(profile.height) : '');
  const [currentWeight, setCurrentWeight] = useState(profile.currentWeight ? String(profile.currentWeight) : '');
  const [targetWeight, setTargetWeight] = useState(profile.targetWeight ? String(profile.targetWeight) : '');
  const [dailyBudget, setDailyBudget] = useState(profile.dailyBudget ? String(profile.dailyBudget) : '');
  const [targetProtein, setTargetProtein] = useState(profile.targetProtein ? String(profile.targetProtein) : '');
  const [targetCarbs, setTargetCarbs] = useState(profile.targetCarbs ? String(profile.targetCarbs) : '');
  const [targetFat, setTargetFat] = useState(profile.targetFat ? String(profile.targetFat) : '');

  const [savedTip, setSavedTip] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedProfile: UserProfile = {
      ...profile,
      nickname: nickname.trim() || '自律小萌',
      height: parseFloat(height) || 165,
      currentWeight: parseFloat(currentWeight) || 60,
      targetWeight: parseFloat(targetWeight) || 55,
      dailyBudget: parseInt(dailyBudget) || 2000,
      targetProtein: parseInt(targetProtein) || 120,
      targetCarbs: parseInt(targetCarbs) || 200,
      targetFat: parseInt(targetFat) || 60,
    };

    saveUserProfile(updatedProfile);
    onUpdateProfile(updatedProfile);
    setSavedTip(true);
    setTimeout(() => {
      setSavedTip(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm select-none animate-fadeIn">
      <div className="w-full sm:max-w-md bg-white rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* 顶部标题与关闭 */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">个人身材与目标设置</h3>
            <p className="text-[11px] text-slate-400">设置您的基本身体指标与每日热量预算</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* AI 智能测算入口横幅 */}
        {onOpenAiPlan && (
          <div className="my-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAiPlan();
              }}
              className="w-full p-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-xs flex items-center justify-between shadow-md shadow-sky-500/20 active:scale-[0.99] transition-all"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles size={16} className="text-amber-300" />
                <span>AI 智能计算每日摄入量与摄出量 (推荐)</span>
              </span>
              <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full">去测算 &gt;</span>
            </button>
          </div>
        )}

        {/* 备份中心入口 */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenBackup();
            }}
            className="w-full py-2.5 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200/60 text-slate-700 font-semibold text-xs flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-2">
              <Database size={14} className="text-emerald-600" />
              <span>数据备份与换机迁移中心</span>
            </span>
            <span className="text-[11px] text-slate-400">导出/恢复 JSON &gt;</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                昵称
              </label>
              <input
                type="text"
                placeholder="请输入昵称"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
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
                placeholder="例如 165"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                当前体重 (kg)
              </label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="例如 58"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:border-blue-500 font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                目标体重 (kg)
              </label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="例如 52"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:border-emerald-500 font-bold text-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              每日总摄入热量预算 (千卡/kcal)
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="例如 2000"
              value={dailyBudget}
              onChange={(e) => setDailyBudget(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-black text-blue-600 focus:bg-white focus:border-blue-500"
            />
          </div>

          {/* 目标三大营养素 */}
          <div className="pt-2 border-t border-slate-100">
            <span className="block text-xs font-semibold text-slate-600 mb-2">
              每日三大营养素目标 (克/g)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">蛋白质(g)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="120"
                  value={targetProtein}
                  onChange={(e) => setTargetProtein(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-center"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">碳水(g)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="200"
                  value={targetCarbs}
                  onChange={(e) => setTargetCarbs(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-center"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">脂肪(g)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="60"
                  value={targetFat}
                  onChange={(e) => setTargetFat(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-center"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5"
          >
            <Save size={16} />
            <span>{savedTip ? '保存成功！' : '保存个人设置'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
