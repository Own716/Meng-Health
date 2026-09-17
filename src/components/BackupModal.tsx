import React, { useState, useRef } from 'react';
import { X, Download, Upload, ShieldCheck, Database, Key, Check, AlertCircle } from 'lucide-react';
import { exportBackupData, importBackupData, getAllLogs } from '../services/storageService';
import { getAiConfig, saveAiConfig } from '../services/aiService';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
}) => {
  if (!isOpen) return null;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error'>('success');

  // AI 配置面板状态
  const [showAiConfig, setShowAiConfig] = useState(false);
  const [apiKey, setApiKey] = useState(getAiConfig().apiKey);
  const [baseUrl, setBaseUrl] = useState(getAiConfig().baseUrl);
  const [model, setModel] = useState(getAiConfig().model);
  const [aiSaved, setAiSaved] = useState(false);

  const logsCount = Object.keys(getAllLogs()).length;

  const handleExport = () => {
    exportBackupData();
    setStatusType('success');
    setImportStatus('备份文件已成功导出并下载！请妥善保存该 JSON 文件。');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = importBackupData(content);
      if (ok) {
        setStatusType('success');
        setImportStatus('数据恢复成功！所有历史饮食与减脂记录已恢复。');
        onDataRestored();
      } else {
        setStatusType('error');
        setImportStatus('恢复失败：备份文件损坏或格式不正确。');
      }
    };
    reader.readAsText(file);
  };

  const handleSaveAi = () => {
    saveAiConfig({ apiKey, baseUrl, model });
    setAiSaved(true);
    setTimeout(() => setAiSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm select-none animate-fadeIn">
      <div className="w-full sm:max-w-md bg-white rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* 标题 */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Database size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">数据备份与迁移</h3>
              <p className="text-[11px] text-slate-400">本地纯离线存储 · 换手机零丢失</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* 提示信息 */}
        {importStatus && (
          <div
            className={`my-3 p-3 rounded-2xl text-xs flex items-center gap-2 ${
              statusType === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {statusType === 'success' ? (
              <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-rose-600 flex-shrink-0" />
            )}
            <span>{importStatus}</span>
          </div>
        )}

        {/* 当前状态卡片 */}
        <div className="my-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">已记录天数</span>
            <span className="text-xl font-black text-slate-900">{logsCount} 天</span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-500 block">数据存放</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <ShieldCheck size={14} /> 本地加密安全
            </span>
          </div>
        </div>

        {/* 备份与恢复双按钮 */}
        <div className="space-y-3">
          <button
            onClick={handleExport}
            className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <Download size={16} />
            <span>导出备份数据 (下载 JSON 格式文件)</span>
          </button>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3.5 px-4 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <Upload size={16} />
              <span>导入备份文件 (换手机恢复数据)</span>
            </button>
          </div>
        </div>

        {/* 换机说明 */}
        <div className="mt-4 p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900 leading-relaxed">
          📌 <strong>换机指南</strong>：换新手机前，点击“导出备份数据”把下载到的 JSON 文件发送到微信收藏或电脑；在换新手机安装好 Meng Health 后，点击“导入备份文件”选择该文件，即可一键完美恢复所有历史打卡与减脂档案！
        </div>

        {/* AI 模型 API 接口管理 (折叠) */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <button
            onClick={() => setShowAiConfig(!showAiConfig)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-slate-900 py-1"
          >
            <span className="flex items-center gap-1.5">
              <Key size={14} className="text-sky-600" />
              <span>AI 接口与 API Key 配置</span>
            </span>
            <span className="text-[11px] text-sky-600 font-medium">
              {showAiConfig ? '收起' : '展开配置'}
            </span>
          </button>

          {showAiConfig && (
            <div className="mt-3 space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
              <p className="text-[11px] text-slate-500">
                后续您可以将您的 AI API Key 或第三方代理地址填在这里，实时激活真实大模型识别：
              </p>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  API Key 密钥
                </label>
                <input
                  type="password"
                  placeholder="填入您的 API Key (如 AIzaSy...)"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Base URL 地址 (默认 Google 官方)
                </label>
                <input
                  type="text"
                  placeholder="https://generativelanguage.googleapis.com"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  模型名称
                </label>
                <input
                  type="text"
                  placeholder="gemini-1.5-flash"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                />
              </div>
              <button
                onClick={handleSaveAi}
                className="w-full py-2.5 rounded-xl bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm"
              >
                {aiSaved ? (
                  <>
                    <Check size={14} />
                    <span>已保存生效</span>
                  </>
                ) : (
                  <span>保存 AI 配置</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
