import React, { useState } from 'react';
import { X, Save, Database, RotateCcw } from 'lucide-react';
import { UserProfile } from '../types/diet';
import { saveUserProfile } from '../services/storageService';

interface ProfileModalProps {
  isOpen: boolean;
  profile: UserProfile;
  onClose: () => void;
  onUpdateProfile: (p: UserProfile) => void;
  onOpenBackup: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  profile,
  onClose,
  onUpdateProfile,
  onOpenBackup,
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [savedTip, setSavedTip] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveUserProfile(formData);
    onUpdateProfile(formData);
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
            <h3 className="text-base font-bold text-slate-900">个人减脂与热量目标设置</h3>
            <p className="text-[11px] text-slate-400">调整身材指标，系统将自动重算热量缺口</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* 备份中心入口 */}
        <div className="my-4">
          <button
            onClick={() => {
              onClose();
              onOpenBackup();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-between transition-colors shadow-sm"
          >
            <span className="flex items-center gap-2">
              <Database size={16} className="text-emerald-600" />
              <span>数据备份与换机导出中心</span>
            </span>
            <span className="text-[11px] text-emerald-600">点击进入 &gt;</span>
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
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                身高 (cm)
              </label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                当前体重 (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.currentWeight}
                onChange={(e) => setFormData({ ...formData, currentWeight: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                目标体重 (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.targetWeight}
                onChange={(e) => setFormData({ ...formData, targetWeight: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white font-bold text-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              每日总热量预算 (千卡/kcal)
            </label>
            <input
              type="number"
              value={formData.dailyBudget}
              onChange={(e) => setFormData({ ...formData, dailyBudget: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-black text-blue-600 focus:bg-white"
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
                  type="number"
                  value={formData.targetProtein}
                  onChange={(e) => setFormData({ ...formData, targetProtein: Number(e.target.value) })}
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-center"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">碳水(g)</label>
                <input
                  type="number"
                  value={formData.targetCarbs}
                  onChange={(e) => setFormData({ ...formData, targetCarbs: Number(e.target.value) })}
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-center"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">脂肪(g)</label>
                <input
                  type="number"
                  value={formData.targetFat}
                  onChange={(e) => setFormData({ ...formData, targetFat: Number(e.target.value) })}
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
