import React, { useState, useRef } from 'react';
import { X, Camera, Sparkles, Check, Loader2, ArrowRight, Settings, ImagePlus, Plus, Trash2 } from 'lucide-react';
import { identifyFood, AiFoodResult } from '../services/aiService';
import { FoodItem, MealType } from '../types/diet';

interface AiLogModalProps {
  isOpen: boolean;
  initialMealType?: MealType;
  onClose: () => void;
  onAddAiFood: (mealType: MealType, foods: Omit<FoodItem, 'id'>[]) => void;
  onOpenAiConfig?: () => void;
}

export const AiLogModal: React.FC<AiLogModalProps> = ({
  isOpen,
  initialMealType = 'lunch',
  onClose,
  onAddAiFood,
  onOpenAiConfig,
}) => {
  if (!isOpen) return null;

  const [textInput, setTextInput] = useState('');
  // 支持多图数组，实现一餐多盘、包装零食、奶茶分次拍摄
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiResults, setAiResults] = useState<AiFoodResult[] | null>(null);
  const [targetMeal, setTargetMeal] = useState<MealType>(initialMealType);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 现场拍照拍摄单张/多张追加
  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setSelectedImages(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
    // 重置 input 以允许再次触发
    e.target.value = '';
  };

  // 从手机相册选取 (支持多选，严格不带 capture 属性，彻底修复直接跳相机 bug)
  const handleAlbumSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      fileArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setSelectedImages(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
    e.target.value = '';
  };

  // 移除单张照片
  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // 触发 AI 分析
  const handleAnalyze = async () => {
    setErrorMessage(null);
    if (!textInput.trim() && selectedImages.length === 0) {
      setErrorMessage('请先拍摄/从相册选取饭菜照片，或者输入文字描述');
      return;
    }

    setLoading(true);
    try {
      const results = await identifyFood({
        imageBase64List: selectedImages,
        textDescription: textInput
      });
      setAiResults(results);
    } catch (err: any) {
      setErrorMessage(err?.message || '识别失败，请确保照片清晰且光线充足');
    } finally {
      setLoading(false);
    }
  };

  // 增减单个食物克重并动态等比换算热量与三大营养素 (确定性缩放)
  const handleUpdateGrams = (index: number, newGrams: number) => {
    if (newGrams <= 0 || !aiResults) return;
    setAiResults(prev => {
      if (!prev) return null;
      return prev.map((item, idx) => {
        if (idx !== index) return item;
        const oldGrams = item.estimatedGrams || 100;
        const ratio = newGrams / oldGrams;
        return {
          ...item,
          estimatedGrams: Math.round(newGrams),
          calories: Math.round(item.calories * ratio),
          protein: Math.round(item.protein * ratio * 10) / 10,
          carbs: Math.round(item.carbs * ratio * 10) / 10,
          fat: Math.round(item.fat * ratio * 10) / 10,
        };
      });
    });
  };

  // 移除单个识别结果项
  const handleDeleteResultItem = (index: number) => {
    setAiResults(prev => {
      if (!prev) return null;
      const next = prev.filter((_, idx) => idx !== index);
      return next.length > 0 ? next : null;
    });
  };

  // 确认加入对应餐次
  const handleConfirmAdd = () => {
    if (!aiResults || aiResults.length === 0) return;

    const foodsToAdd: Omit<FoodItem, 'id'>[] = aiResults.map(item => ({
      name: item.foodName,
      grams: item.estimatedGrams,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      note: item.reasoning,
      brand: item.brand,
      confidence: item.confidence,
      verified: item.verified,
      evidence: item.evidence,
      foodDissection: item.foodDissection
    }));

    onAddAiFood(targetMeal, foodsToAdd);
    // 重置并关闭
    setAiResults(null);
    setSelectedImages([]);
    setTextInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm select-none animate-fadeIn">
      <div className="w-full sm:max-w-md bg-white rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* 弹窗头部 */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">AI 智能拍照与速记</h3>
              <p className="text-[11px] text-slate-400">大模型视觉识别 · 支持多图与带包装零食奶茶</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {onOpenAiConfig && (
              <button
                type="button"
                onClick={onOpenAiConfig}
                className="px-2.5 py-1.5 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold flex items-center gap-1 transition-colors border border-sky-200"
                title="AI 接口配置"
              >
                <Settings size={13} />
                <span>AI配置</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 模式一：拍照或多选相册选图 */}
        <div className="my-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700">
              方式 1：拍照或相册选图 (支持多拍/多选)
            </label>
            {selectedImages.length > 0 && (
              <span className="text-[11px] font-bold text-blue-600">
                已选 {selectedImages.length} 张照片
              </span>
            )}
          </div>

          {/* 独立双按钮：现场拍照 VS 从相册选择 (彻底分流，修复相册跳相机问题) */}
          <div className="grid grid-cols-2 gap-2.5 mb-3">
            {/* 现场拍照 */}
            <label className="py-3 px-3 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] transition-all">
              <Camera size={16} className="text-sky-600" />
              <span>现场拍照拍摄</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCameraCapture}
                className="hidden"
              />
            </label>

            {/* 从相册选取 (多选) */}
            <label className="py-3 px-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] transition-all shadow-sm">
              <ImagePlus size={16} className="text-indigo-600" />
              <span>从相册选择 (可多选)</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleAlbumSelect}
                className="hidden"
              />
            </label>
          </div>

          {/* 多图横向滑动预览与删除区 */}
          {selectedImages.length > 0 && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex gap-2.5 overflow-x-auto pb-1 items-center">
                {selectedImages.map((imgSrc, idx) => (
                  <div key={idx} className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden shadow-sm border border-white">
                    <img
                      src={imgSrc}
                      alt={`预览 ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-rose-600 transition-colors"
                    >
                      <X size={12} />
                    </button>
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-white font-bold">
                      #{idx + 1}
                    </span>
                  </div>
                ))}

                {/* 快捷追加按钮 */}
                <label className="flex-shrink-0 w-20 h-20 rounded-xl border-2 border-dashed border-sky-300 bg-sky-50/50 flex flex-col items-center justify-center cursor-pointer hover:bg-sky-50 transition-colors text-sky-600">
                  <Plus size={18} />
                  <span className="text-[10px] font-bold mt-1">追加照片</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAlbumSelect}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 text-center">
                可一次拍摄整桌饭菜、主食与奶茶包装，AI 将合并综合测算
              </p>
            </div>
          )}
        </div>

        {/* 模式二：语音或文本速记 */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            方式 2：文字/语音描述饮食 (可配合照片一起识别)
          </label>
          <textarea
            rows={2}
            placeholder="例如：中午吃了一碗牛肉面加水煮蛋，外加一杯蜜雪冰城中杯奶茶"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-sky-500 focus:bg-white resize-none"
          />
        </div>

        {/* 错误提示横幅 */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold leading-relaxed animate-shake">
            <p>⚠️ {errorMessage}</p>
            {onOpenAiConfig && (
              <button
                type="button"
                onClick={onOpenAiConfig}
                className="mt-2.5 px-3 py-1.5 rounded-xl bg-white border border-rose-200 hover:bg-rose-100/50 text-rose-800 text-[11px] font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Settings size={13} className="text-rose-600" />
                <span>点此检查/重新填写 AI API Key</span>
              </button>
            )}
          </div>
        )}

        {/* 开始识别按钮 */}
        {!aiResults && (
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-sm shadow-lg shadow-sky-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>AI 正在智能识别分析中 (已自动压缩)...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>开始 AI 智能识别 ({selectedImages.length > 0 ? `${selectedImages.length}张照片` : '饮食'})</span>
              </>
            )}
          </button>
        )}

        {/* 识别结果与入库确认 */}
        {aiResults && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                <Check size={14} className="text-emerald-500" />
                AI 识别解析成功 (共检测到 {aiResults.length} 样食物)
              </span>
              <button
                onClick={() => setAiResults(null)}
                className="text-[11px] text-sky-600 font-medium hover:underline"
              >
                重新识别
              </button>
            </div>

            {aiResults.map((item, idx) => (
              <div key={idx} className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm space-y-2.5">
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-slate-800">{item.foodName}</span>
                      {item.brand && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold border border-purple-200/60">
                          {item.brand}
                        </span>
                      )}
                      {item.verified && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60 flex items-center gap-0.5">
                          <Check size={10} /> 权威核验
                        </span>
                      )}
                      {item.evidence && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 font-semibold border border-sky-200/60">
                          {item.evidence.sourceTitle}
                        </span>
                      )}
                      {item.confidence && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          item.confidence === 'high'
                            ? 'bg-emerald-50 text-emerald-600'
                            : item.confidence === 'low'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          置信度: {item.confidence === 'high' ? '高' : item.confidence === 'low' ? '低' : '中'}
                        </span>
                      )}
                    </div>

                    {/* 菜品/食材拆解溯源展示 (如馒头夹菜：主料馒头 + 配料炒菜，杜绝混淆为汉堡) */}
                    {item.foodDissection && (
                      <div className="text-[11px] text-slate-500 mt-1.5 bg-slate-50 p-2.5 rounded-xl space-y-1 border border-slate-100">
                        <div>
                          <span className="font-semibold text-slate-700">主料主食：</span>
                          {item.foodDissection.mainIngredients.join('、')}
                        </div>
                        {item.foodDissection.seasoningsAndOil && item.foodDissection.seasoningsAndOil.length > 0 && (
                          <div>
                            <span className="font-semibold text-slate-700">夹心/配菜与用油：</span>
                            {item.foodDissection.seasoningsAndOil.join('、')}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400">
                          测算基准：{item.foodDissection.estimationMethod}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-right flex items-center gap-2">
                    <span className="text-xs font-black text-blue-600">{item.calories} 大卡</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteResultItem(idx)}
                      className="p-1 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                      title="移除此项"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* 重量克数调节与三大营养素明细 (四则运算确定性缩放) */}
                <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500 font-medium">分量:</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateGrams(idx, Math.max(10, item.estimatedGrams - 20))}
                      className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors"
                    >
                      -
                    </button>
                    <span className="font-bold text-slate-800 w-10 text-center">{item.estimatedGrams}g</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateGrams(idx, item.estimatedGrams + 20)}
                      className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    蛋 {item.protein}g · 碳 {item.carbs}g · 脂 {item.fat}g
                  </div>
                </div>

                {item.reasoning && (
                  <div className="text-[10px] text-slate-500 bg-sky-50/50 p-2 rounded-xl leading-relaxed">
                    💡 营养师简评: {item.reasoning}
                  </div>
                )}
              </div>
            ))}

            {/* 选择存入餐次 */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                存入哪一餐？
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { key: 'breakfast' as MealType, label: '早餐' },
                  { key: 'lunch' as MealType, label: '午餐' },
                  { key: 'dinner' as MealType, label: '晚餐' },
                  { key: 'snack' as MealType, label: '加餐/零食' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTargetMeal(key)}
                    className={`py-2 text-xs rounded-xl border font-semibold transition-all ${
                      targetMeal === key
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 确认存入按钮 */}
            <button
              onClick={handleConfirmAdd}
              className="w-full mt-2 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5"
            >
              <span>一键加入今日记录</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
