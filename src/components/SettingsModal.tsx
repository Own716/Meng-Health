import React, { useState } from 'react';
import {
  X,
  Settings,
  Key,
  Database,
  Calendar,
  Bell,
  AlertTriangle,
  Trash2,
  Info,
  ShieldCheck,
  ChevronRight,
  CheckCircle2,
  Smartphone
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAiConfig: () => void;
  onOpenBackup: () => void;
  onOpenCalendarDelete?: () => void;
  onClearCache?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenAiConfig,
  onOpenBackup,
  onOpenCalendarDelete,
  onClearCache,
}) => {
  if (!isOpen) return null;

  // 提醒与提示开关状态
  const [mealReminder, setMealReminder] = useState(true);
  const [waterReminder, setWaterReminder] = useState(true);
  const [calorieWarning, setCalorieWarning] = useState(true);
  const [cacheCleared, setCacheCleared] = useState(false);

  const handleClearCache = () => {
    if (onClearCache) onClearCache();
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm select-none animate-fadeIn">
      <div className="w-full sm:max-w-md bg-white rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* 顶部标题与关闭 */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Settings size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">系统综合设置</h3>
              <p className="text-[11px] text-slate-400">AI模型接口 · 数据备份 · 偏好与系统信息</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* 设置分组 1：核心扩展能力 */}
        <div className="my-4 space-y-2.5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            核心接口与数据管理
          </div>

          {/* AI 接口配置入口 */}
          <div
            onClick={() => {
              onClose();
              onOpenAiConfig();
            }}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-sky-50/70 border border-slate-200/70 transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                <Key size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-sky-700">
                  AI 视觉大模型与联网检索配置
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  智谱 GLM-4V / 实时联网搜索 / 权威成分库 / 连通测试
                </div>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-300 group-hover:text-sky-600 transition-colors" />
          </div>

          {/* 数据备份中心入口 */}
          <div
            onClick={() => {
              onClose();
              onOpenBackup();
            }}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/70 transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Database size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                  数据备份与换机迁移中心
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  一键导出 JSON 备份，换新手机零丢失恢复所有历史
                </div>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
          </div>

          {/* 饮食与打卡记录管理入口 */}
          <div
            onClick={() => {
              onClose();
              if (onOpenCalendarDelete) onOpenCalendarDelete();
            }}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-rose-50/70 border border-slate-200/70 transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <Calendar size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-rose-700">
                  饮食与体重记录管理
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  按日历按天批量删除饮食日记与体重打卡数据
                </div>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-300 group-hover:text-rose-600 transition-colors" />
          </div>
        </div>

        {/* 设置分组 2：日常饮食偏好与提醒 */}
        <div className="mb-4 space-y-2.5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            日常提醒与偏好
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 space-y-3">
            {/* 三餐提醒开关 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Bell size={16} className="text-blue-500" />
                <div>
                  <div className="text-xs font-bold text-slate-800">三餐准时打卡提醒</div>
                  <div className="text-[10px] text-slate-400">早8点、午12点、晚18点准时提醒</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMealReminder(!mealReminder)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  mealReminder ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 left-0.5 transform transition-transform duration-200 ${
                    mealReminder ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="border-t border-slate-200/60" />

            {/* 喝水打卡提醒 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Smartphone size={16} className="text-cyan-500" />
                <div>
                  <div className="text-xs font-bold text-slate-800">每日 2L 喝水打卡提醒</div>
                  <div className="text-[10px] text-slate-400">加速新陈代谢与脂肪分解</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWaterReminder(!waterReminder)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  waterReminder ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 left-0.5 transform transition-transform duration-200 ${
                    waterReminder ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="border-t border-slate-200/60" />

            {/* 热量超标预警 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertTriangle size={16} className="text-amber-500" />
                <div>
                  <div className="text-xs font-bold text-slate-800">热量超标警戒线变色提醒</div>
                  <div className="text-[10px] text-slate-400">摄入超过预算 90% 时视觉预警</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCalorieWarning(!calorieWarning)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  calorieWarning ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 left-0.5 transform transition-transform duration-200 ${
                    calorieWarning ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 设置分组 3：本地存储与清理 */}
        <div className="mb-4 space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            存储与缓存
          </div>
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-800">本地临时缓存占用</div>
              <div className="text-[10px] text-slate-400">包含本地离线食材索引与拍照缓存 (约 1.2 MB)</div>
            </div>
            <button
              type="button"
              onClick={handleClearCache}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 text-xs font-bold text-rose-600 flex items-center gap-1 active:scale-95 transition-all"
            >
              {cacheCleared ? (
                <>
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  <span className="text-emerald-600">已清理</span>
                </>
              ) : (
                <>
                  <Trash2 size={13} />
                  <span>清除缓存</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 设置分组 4：关于软件与永久签名声明 */}
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-blue-900 flex items-center gap-1.5">
              <Info size={14} className="text-blue-600" />
              <span>关于 Meng Health · 梦健康</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-200/70 text-blue-800 font-bold">
              v1.6.0 正式版
            </span>
          </div>

          <div className="text-[11px] text-blue-800/80 leading-relaxed space-y-1">
            <p className="flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-600 flex-shrink-0" />
              <span><strong>永久签名已固化</strong>：已启用官方 menghealth 永久证书，今后所有新版本直接覆盖更新。</span>
            </p>
            <p className="flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-600 flex-shrink-0" />
              <span><strong>中式地道菜品与纯本地隐私</strong>：专项辨析中式主食菜肴(如馒头夹菜/肉夹馍)，所有日记与数据完整存放于手机本地。</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
