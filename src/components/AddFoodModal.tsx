import React, { useState } from 'react';
import { X, Plus, Sparkles, Search } from 'lucide-react';
import { FoodItem, MealType } from '../types/diet';

interface AddFoodModalProps {
  isOpen: boolean;
  mealType: MealType;
  onClose: () => void;
  onAdd: (food: Omit<FoodItem, 'id'>) => void;
}

// 丰富常见中餐与健康减脂食物库（支持搜索与快速点击）
const COMPREHENSIVE_FOODS = [
  { name: '蒸米饭', grams: 150, calories: 174, protein: 4, carbs: 38, fat: 0.5, tag: '主食' },
  { name: '水煮全蛋', grams: 60, calories: 86, protein: 7.5, carbs: 0.8, fat: 5.5, tag: '蛋白质' },
  { name: '香煎鸡胸肉', grams: 150, calories: 195, protein: 36, carbs: 0, fat: 4.5, tag: '蛋白质' },
  { name: '低脂纯牛奶', grams: 250, calories: 135, protein: 8, carbs: 12, fat: 7.5, tag: '饮品' },
  { name: '快熟燕麦片', grams: 50, calories: 185, protein: 6, carbs: 32, fat: 3.5, tag: '主食' },
  { name: '红富士苹果', grams: 200, calories: 104, protein: 0.5, carbs: 25, fat: 0.4, tag: '水果' },
  { name: '蒜蓉西兰花', grams: 150, calories: 65, protein: 4, carbs: 7, fat: 2.5, tag: '蔬菜' },
  { name: '卤酱牛肉', grams: 100, calories: 130, protein: 26, carbs: 1.5, fat: 2.5, tag: '蛋白质' },
  { name: '蒸紫薯/红薯', grams: 150, calories: 129, protein: 2.1, carbs: 30, fat: 0.3, tag: '主食' },
  { name: '无糖美式咖啡', grams: 350, calories: 5, protein: 0.3, carbs: 0.8, fat: 0.1, tag: '饮品' },
  { name: '全麦吐司面包', grams: 70, calories: 170, protein: 6.5, carbs: 32, fat: 2.2, tag: '主食' },
  { name: '清蒸大虾', grams: 100, calories: 93, protein: 18, carbs: 0, fat: 1.2, tag: '水产' },
  { name: '水煮西红柿牛腩', grams: 200, calories: 240, protein: 22, carbs: 6, fat: 14, tag: '肉类' },
  { name: '黄瓜凉拌木耳', grams: 150, calories: 45, protein: 2, carbs: 6, fat: 1.5, tag: '蔬菜' },
  { name: '香蕉', grams: 120, calories: 105, protein: 1.3, carbs: 27, fat: 0.4, tag: '水果' },
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

  const [searchKey, setSearchKey] = useState('');
  const [name, setName] = useState('');
  // 使用字符串状态，避免数字退格为 0
  const [grams, setGrams] = useState('100');
  const [calories, setCalories] = useState('150');
  const [protein, setProtein] = useState('10');
  const [carbs, setCarbs] = useState('20');
  const [fat, setFat] = useState('3');

  const filteredPresets = COMPREHENSIVE_FOODS.filter(f => 
    f.name.includes(searchKey.trim()) || f.tag.includes(searchKey.trim())
  );

  const handleSelectPreset = (preset: typeof COMPREHENSIVE_FOODS[0]) => {
    setName(preset.name);
    setGrams(String(preset.grams));
    setCalories(String(preset.calories));
    setProtein(String(preset.protein));
    setCarbs(String(preset.carbs));
    setFat(String(preset.fat));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      name: name.trim(),
      grams: parseFloat(grams) || 100,
      calories: parseFloat(calories) || 0,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
    });

    // 重置
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm select-none animate-fadeIn">
      <div className="w-full sm:max-w-md bg-white rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* 标题与关闭按钮 */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              记录{mealNameMap[mealType]}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">搜索常用减脂食物或自定义录入</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* 食物搜索框 */}
        <div className="my-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="搜索食物库 (如：米饭、牛肉、虾、苹果)"
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 border-none text-xs focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 常用预设快捷药丸 */}
        <div className="mb-4">
          <span className="text-xs font-semibold text-slate-500 mb-2 block">
            点击快速选择:
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto no-scrollbar">
            {filteredPresets.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                  name === p.name
                    ? 'bg-blue-600 text-white border-blue-600 font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {p.name} ({p.calories}kcal)
              </button>
            ))}
          </div>
        </div>

        {/* 详细表单录入 */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              食物名称 *
            </label>
            <input
              type="text"
              required
              placeholder="例如：全麦吐司、水煮蛋"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:bg-white font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                分量重量 (克/g)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={grams}
                onChange={(e) => setGrams(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                总热量 (千卡/kcal) *
              </label>
              <input
                type="text"
                inputMode="decimal"
                required
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-blue-600 focus:bg-white"
              />
            </div>
          </div>

          {/* 三大营养素 */}
          <div className="pt-2 border-t border-slate-100">
            <span className="block text-xs font-semibold text-slate-500 mb-1.5">
              三大营养素分量 (克/g)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5 text-center">蛋白质(g)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-center"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5 text-center">碳水(g)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-center"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5 text-center">脂肪(g)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-center"
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
