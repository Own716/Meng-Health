import React, { useState } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import { FoodItem, MealType } from '../types/diet';

interface AddFoodModalProps {
  isOpen: boolean;
  mealType: MealType;
  onClose: () => void;
  onAdd: (food: Omit<FoodItem, 'id'>) => void;
}

// 常见中餐减脂食物快捷预设库
const PRESET_FOODS = [
  { name: '蒸米饭', grams: 150, calories: 174, protein: 4, carbs: 38, fat: 0.5 },
  { name: '水煮蛋', grams: 60, calories: 86, protein: 7.5, carbs: 0.8, fat: 5.5 },
  { name: '香煎鸡胸肉', grams: 150, calories: 195, protein: 36, carbs: 0, fat: 4.5 },
  { name: '纯牛奶', grams: 250, calories: 135, protein: 8, carbs: 12, fat: 7.5 },
  { name: '快熟无糖燕麦', grams: 50, calories: 185, protein: 6, carbs: 32, fat: 3.5 },
  { name: '红富士苹果', grams: 200, calories: 104, protein: 0.5, carbs: 25, fat: 0.4 },
  { name: '清炒西兰花', grams: 150, calories: 55, protein: 4, carbs: 7, fat: 2 },
  { name: '酱牛肉片', grams: 100, calories: 130, protein: 26, carbs: 1.5, fat: 2.5 },
];

export const AddFoodModal: React.FC<AddFoodModalProps> = ({
  isOpen,
  mealType,
  onClose,
  onAdd,
}) => {
  if (!isOpen) return null;

  const mealNameMap: Record<MealType, string> = {
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐',
    snack: '加餐/零食',
  };

  const [name, setName] = useState('');
  const [grams, setGrams] = useState(100);
  const [calories, setCalories] = useState(150);
  const [protein, setProtein] = useState(10);
  const [carbs, setCarbs] = useState(20);
  const [fat, setFat] = useState(3);

  const handleSelectPreset = (preset: typeof PRESET_FOODS[0]) => {
    setName(preset.name);
    setGrams(preset.grams);
    setCalories(preset.calories);
    setProtein(preset.protein);
    setCarbs(preset.carbs);
    setFat(preset.fat);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      name: name.trim(),
      grams: Number(grams) || 100,
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
    });

    // 重置
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm select-none animate-fadeIn">
      <div className="w-full sm:max-w-md bg-white rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* 标题与关闭按钮 */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              记录{mealNameMap[mealType]}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">选择常用食物或手动录入</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* 常用预设快捷药丸 */}
        <div className="my-4">
          <span className="text-xs font-semibold text-slate-500 mb-2 block">
            常用食物快捷选择
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_FOODS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  name === p.name
                    ? 'bg-blue-600 text-white border-blue-600 font-medium'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                }`}
              >
                {p.name} ({p.calories}kcal)
              </button>
            ))}
          </div>
        </div>

        {/* 详细表单录入 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              食物名称 *
            </label>
            <input
              type="text"
              required
              placeholder="例如：玉米半根、煎蛋"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                分量重量 (克/g)
              </label>
              <input
                type="number"
                value={grams}
                onChange={(e) => setGrams(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                总热量 (千卡/kcal) *
              </label>
              <input
                type="number"
                required
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:bg-white font-bold text-blue-600"
              />
            </div>
          </div>

          {/* 三大营养素 */}
          <div className="pt-2 border-t border-slate-100">
            <span className="block text-xs font-semibold text-slate-500 mb-2">
              三大营养素分量 (可选)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  蛋白质 (g)
                </label>
                <input
                  type="number"
                  value={protein}
                  onChange={(e) => setProtein(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-center"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  碳水化合物 (g)
                </label>
                <input
                  type="number"
                  value={carbs}
                  onChange={(e) => setCarbs(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-center"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  脂肪 (g)
                </label>
                <input
                  type="number"
                  value={fat}
                  onChange={(e) => setFat(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-center"
                />
              </div>
            </div>
          </div>

          {/* 确认添加 */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            <span>保存并加入{mealNameMap[mealType]}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
