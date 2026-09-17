import React, { useState } from 'react';
import { X, Key, Check, Zap, HelpCircle, ExternalLink, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { getAiConfig, saveAiConfig, testAiConnection, DEFAULT_AI_CONFIG } from '../services/aiService';

interface AiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: () => void;
}

interface PresetOption {
  name: string;
  badge: string;
  baseUrl: string;
  model: string;
  docUrl: string;
  tip: string;
}

const PRESETS: PresetOption[] = [
  {
    name: '智谱清言 (推荐·永久免费)',
    badge: '推荐 · 免费调用',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-4v-flash',
    docUrl: 'https://open.bigmodel.cn/usercenter/apikeys',
    tip: '国内直连极速响应，官方永久免费视觉模型，支持拍菜识菜与营养分析。'
  },
  {
    name: '通义千问 (阿里云百炼)',
    badge: '阿里大模型',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: 'qwen-vl-plus',
    docUrl: 'https://bailian.console.aliyun.com/',
    tip: '阿里云通义视觉大模型，识别国内家常菜系精准度极高。'
  },
  {
    name: 'Google Gemini (海外官方)',
    badge: '需科学上网',
    baseUrl: 'https://generativelanguage.googleapis.com',
    model: 'gemini-1.5-flash',
    docUrl: 'https://aistudio.google.com/app/apikey',
    tip: 'Google 官方多模态模型，国内环境需配合代理使用。'
  }
];

export const AiConfigModal: React.FC<AiConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved
}) => {
  if (!isOpen) return null;

  const currentConfig = getAiConfig();
  const [apiKey, setApiKey] = useState(currentConfig.apiKey);
  const [baseUrl, setBaseUrl] = useState(currentConfig.baseUrl);
  const [model, setModel] = useState(currentConfig.model);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [savedTip, setSavedTip] = useState(false);

  // 一键选择预设
  const handleApplyPreset = (p: PresetOption) => {
    setBaseUrl(p.baseUrl);
    setModel(p.model);
    setTestResult(null);
  };

  // 保存配置
  const handleSave = () => {
    saveAiConfig({ apiKey, baseUrl, model });
    setSavedTip(true);
    if (onConfigSaved) onConfigSaved();
    setTimeout(() => {
      setSavedTip(false);
      onClose();
    }, 900);
  };

  // 测试连接
  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testAiConnection({ apiKey, baseUrl, model });
      setTestResult(res);
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || '测试出错' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm select-none animate-fadeIn">
      <div className="w-full sm:max-w-md bg-white rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* 顶部标题与关闭 */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
              <Key size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">AI 大模型接口配置</h3>
              <p className="text-[11px] text-slate-400">适配智谱/通义/OpenAI等视觉模型 · 纯本地私密存储</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* 推荐预设快速切换 */}
        <div className="my-4">
          <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">
            <Zap size={14} className="text-amber-500" />
            <span>一键应用模型预设 (点击即可自动填入地址)</span>
          </div>
          <div className="space-y-2">
            {PRESETS.map((p, idx) => {
              const isSelected = baseUrl.includes(new URL(p.baseUrl).hostname) && model === p.model;
              return (
                <div
                  key={idx}
                  onClick={() => handleApplyPreset(p)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50/60 shadow-sm ring-1 ring-sky-500'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800">{p.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      idx === 0
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {p.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{p.tip}</p>
                  {p.docUrl && (
                    <a
                      href={p.docUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-[11px] text-sky-600 font-semibold mt-1 hover:underline"
                    >
                      <span>前往获取该平台 API Key</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 表单输入区 */}
        <div className="space-y-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-700">
                API Key 密钥 <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400">仅保存在手机本地</span>
            </div>
            <input
              type="text"
              placeholder="在此粘贴您的 API Key (如 7a4b...)"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value.trim());
                setTestResult(null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-mono focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Base URL 接口地址
            </label>
            <input
              type="text"
              placeholder="https://open.bigmodel.cn/api/paas/v4"
              value={baseUrl}
              onChange={(e) => {
                setBaseUrl(e.target.value.trim());
                setTestResult(null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-mono focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              模型名称 (Model)
            </label>
            <input
              type="text"
              placeholder="glm-4v-flash"
              value={model}
              onChange={(e) => {
                setModel(e.target.value.trim());
                setTestResult(null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-mono focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* 测试结果提示 */}
        {testResult && (
          <div
            className={`my-3 p-3 rounded-2xl text-xs flex items-start gap-2 ${
              testResult.success
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {testResult.success ? (
              <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed">{testResult.message}</span>
          </div>
        )}

        {/* 底部操作按钮 */}
        <div className="mt-4 flex gap-2.5">
          <button
            type="button"
            onClick={handleTest}
            disabled={testing || !apiKey}
            className="flex-1 py-3 px-3 rounded-2xl border border-sky-300 bg-sky-50/80 hover:bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {testing ? (
              <>
                <Loader2 size={15} className="animate-spin text-sky-600" />
                <span>测试中...</span>
              </>
            ) : (
              <>
                <Zap size={15} />
                <span>测试连接</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex-[2] py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/20 active:scale-[0.99] transition-all"
          >
            {savedTip ? (
              <>
                <Check size={16} />
                <span>配置已保存！</span>
              </>
            ) : (
              <span>保存配置并生效</span>
            )}
          </button>
        </div>

        {/* 隐私与安全提示 */}
        <div className="mt-3 text-center">
          <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck size={12} className="text-emerald-500" />
            您的 API Key 仅存放在您本人的手机本地，绝不上传第三方服务器
          </span>
        </div>
      </div>
    </div>
  );
};
