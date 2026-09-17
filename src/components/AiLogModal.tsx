import React, { useState } from 'react';
import { X, Camera, Sparkles, Check, Loader2, ArrowRight } from 'lucide-react';
import { identifyFood, AiFoodResult } from '../services/aiService';
import { FoodItem, MealType } from '../types/diet';

interface AiLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAiFood: (mealType: MealType, foods: Omit<FoodItem, 'id'>[]) => void;
}

export const AiLogModal: React.FC<AiLogModalProps> = ({
  isOpen,
  onClose,
  onAddAiFood,
}) => {
  if (!isOpen) return null;

  const [textInput, setTextInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiResults, setAiResults] = useState<AiFoodResult[] | null>(null);
  const [targetMeal, setTargetMeal] = useState<MealType>('lunch');

  // 处理图片选择
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 触发 AI 分析
  const handleAnalyze = async () => {
    if (!textInput.trim() && !selectedImage) {
      alert('请先输入吃了什么，或者上传/拍摄一张饭菜照片');
      return;
    }

    setLoading(true);
    try {
      const results = await identifyFood({
        imageBase64: selectedImage || undefined,
        textDescription: textInput
      });
      setAiResults(results);
    } catch (err) {
      alert('AI 识别遇到一点小问题，请稍后重试');
    } finally {
      setLoading(false);
    }
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
      note: item.reasoning
    }));

    onAddAiFood(targetMeal, foodsToAdd);
    // 重置并关闭
    setAiResults(null);
    setSelectedImage(null);
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
              <p className="text-[11px] text-slate-400">大模型视觉识别 + 智能营养成分测算</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* 模式一：拍照或选图 */}
        <div className="my-4">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            方式 1：拍照或相册选图
          </label>
          <div className="relative border-2 border-dashed border-sky-200 rounded-2xl p-4 bg-sky-50/50 hover:bg-sky-50 transition-colors text-center cursor-pointer">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            {selectedImage ? (
              <div className="relative inline-block">
                <img
                  src={selectedImage}
                  alt="预览照片"
                  className="max-h-40 rounded-xl object-cover shadow-sm mx-auto"
                />
                <span className="inline-block mt-2 text-xs font-medium text-sky-600">
                  点击可更换照片
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-2 text-slate-500">
                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-sky-600 mb-2">
                  <Camera size={22} />
                </div>
                <span className="text-xs font-semibold text-slate-700">
                  点击打开相机拍照 / 从相册选择
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  支持识别中西各类家常菜、外卖、水果及包装食品
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 模式二：语音或文本速记 */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            方式 2：文字/语音描述饮食
          </label>
          <textarea
            rows={2}
            placeholder="例如：中午在食堂吃了一碗牛肉面，加了个水煮蛋和凉拌黄瓜"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-sky-500 focus:bg-white resize-none"
          />
        </div>

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
                <span>AI 正在分析营养成分中...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>开始 AI 智能识别</span>
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
                AI 识别解析成功
              </span>
              <button
                onClick={() => setAiResults(null)}
                className="text-[11px] text-sky-600 font-medium hover:underline"
              >
                重新识别
              </button>
            </div>

            {aiResults.map((item, idx) => (
              <div key={idx} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm font-bold text-slate-800">{item.foodName}</span>
                  <span className="text-xs font-black text-blue-600">{item.calories} 千卡</span>
                </div>
                <div className="text-[11px] text-slate-400 mb-2">
                  预估重量: {item.estimatedGrams}g · 蛋白质 {item.protein}g · 碳水 {item.carbs}g · 脂肪 {item.fat}g
                </div>
                {item.reasoning && (
                  <div className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg leading-relaxed">
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
                  { key: 'snack' as MealType, label: '加餐' },
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
