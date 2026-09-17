import React from 'react';
import { Camera, Sparkles } from 'lucide-react';

interface AiSmartLogCardProps {
  onOpenAiLog: () => void;
}

export const AiSmartLogCard: React.FC<AiSmartLogCardProps> = ({ onOpenAiLog }) => {
  return (
    <div className="px-5 my-3 select-none">
      <div 
        onClick={onOpenAiLog}
        className="relative overflow-hidden rounded-3xl p-4 bg-gradient-to-r from-sky-100 via-sky-200/90 to-blue-200/80 border border-sky-300/60 shadow-lg shadow-sky-200/50 cursor-pointer active:scale-[0.99] transition-all duration-200 group"
      >
        {/* 背景光晕装饰 */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/40 rounded-full blur-xl pointer-events-none" />

        {/* 顶部标题行 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-slate-900 font-bold text-base">
            <span className="text-amber-500">✨</span>
            <span>AI 智能速记</span>
          </div>
          <Sparkles size={16} className="text-sky-600 animate-pulse" />
        </div>

        {/* 内容主体 */}
        <div className="flex items-center gap-3">
          {/* 相机图标盒子 */}
          <div className="w-12 h-12 rounded-2xl bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-700 shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
            <Camera size={22} className="text-sky-700" />
          </div>

          {/* 引导文案 */}
          <div className="flex-1 pr-1">
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              拍照记餐：一拍即可自动智能估算食物重量、大卡与营养素
            </p>
          </div>

          {/* 操作按钮 */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenAiLog();
            }}
            className="px-3.5 py-2 rounded-full bg-white text-slate-900 font-semibold text-xs shadow-md shadow-slate-200/60 hover:bg-slate-50 active:scale-95 transition-all flex-shrink-0"
          >
            开始 AI 识别
          </button>
        </div>
      </div>
    </div>
  );
};
