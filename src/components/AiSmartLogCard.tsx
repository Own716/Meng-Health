import React from 'react';
import { Camera, Sparkles, Calculator } from 'lucide-react';

interface AiSmartLogCardProps {
  onOpenAiLog: () => void;
  onOpenAiPlan: () => void;
}

export const AiSmartLogCard: React.FC<AiSmartLogCardProps> = ({
  onOpenAiLog,
  onOpenAiPlan,
}) => {
  return (
    <div className="px-4 my-2 select-none space-y-2">
      {/* 核心 AI 拍照与速记卡片 */}
      <div 
        onClick={onOpenAiLog}
        className="relative overflow-hidden rounded-3xl p-4 bg-gradient-to-r from-sky-100 via-sky-200/90 to-blue-200/80 border border-sky-300/60 shadow-lg shadow-sky-200/50 cursor-pointer active:scale-[0.99] transition-all duration-200 group"
      >
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/40 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm">
            <span className="text-amber-500">✨</span>
            <span>AI 智能速记</span>
          </div>
          <Sparkles size={16} className="text-sky-600 animate-pulse" />
        </div>

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-700 shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
            <Camera size={20} className="text-sky-700" />
          </div>

          <div className="flex-1 pr-1">
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              拍照记餐：一拍即可自动智能估算食物重量、大卡与营养素
            </p>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenAiLog();
            }}
            className="px-3 py-2 rounded-full bg-white text-slate-900 font-bold text-xs shadow-md shadow-slate-200/60 hover:bg-slate-50 active:scale-95 transition-all flex-shrink-0"
          >
            开始 AI 识别
          </button>
        </div>
      </div>

      {/* AI 智能摄入/摄出量测算 快捷条 */}
      <div
        onClick={onOpenAiPlan}
        className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white border border-slate-200/70 shadow-sm cursor-pointer hover:bg-slate-50 active:scale-[0.99] transition-all"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Calculator size={14} />
          </div>
          <span className="text-xs font-bold text-slate-800">AI 智能计算每日摄入与摄出量计划</span>
        </div>
        <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-0.5">
          <span>测算</span>
          <span>&gt;</span>
        </span>
      </div>
    </div>
  );
};
