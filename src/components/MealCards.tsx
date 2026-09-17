import React from 'react';
import { Plus, Trash2, Camera } from 'lucide-react';
import { DayLog, MealType } from '../types/diet';

interface MealCardsProps {
  dayLog: DayLog;
  onAddFood: (mealType: MealType) => void;
  onDeleteFood: (mealType: MealType, foodId: string) => void;
  onCameraFood?: (mealType: MealType) => void;
}

export const MealCards: React.FC<MealCardsProps> = ({
  dayLog,
  onAddFood,
  onDeleteFood,
  onCameraFood,
}) => {
  const mealSections: { type: MealType; title: string }[] = [
    { type: 'breakfast', title: '早餐' },
    { type: 'lunch', title: '午餐' },
    { type: 'dinner', title: '晚餐' },
    { type: 'snack', title: '加餐 / 零食' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 px-5 mb-28 select-none">
      {mealSections.map(({ type, title }) => {
        const meal = dayLog.meals[type];
        const hasItems = meal.items.length > 0;

        return (
          <div
            key={type}
            className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow"
          >
            <div>
              {/* 顶部餐次标题与热量 */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900">{title}</span>
                {hasItems && (
                  <span className="text-xs text-slate-400 font-medium">
                    {meal.totalCalories} 千卡
                  </span>
                )}
              </div>

              {/* 食物明细列表 */}
              {hasItems ? (
                <div className="space-y-1.5 mb-2">
                  {meal.items.map((item) => (
                    <div
                      key={item.id}
                      className="group flex items-center justify-between text-xs py-0.5"
                    >
                      <div className="truncate pr-1">
                        <div className="text-slate-800 font-medium truncate">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {item.grams}g · {item.calories}千卡
                        </div>
                      </div>
                      <button
                        onClick={() => onDeleteFood(type, item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-opacity"
                        title="删除记录"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  onClick={() => onAddFood(type)}
                  className="text-xs text-slate-300 font-medium py-3 cursor-pointer hover:text-slate-400"
                >
                  + 记录{title}
                </div>
              )}
            </div>

            {/* 底部热量统计与快捷添加/拍照按钮 */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-auto">
              <span className="text-xs font-semibold text-slate-700">
                {hasItems ? `${meal.totalCalories} 千卡` : '0 千卡'}
              </span>
              <div className="flex items-center gap-1.5">
                {onCameraFood && (
                  <button
                    type="button"
                    onClick={() => onCameraFood(type)}
                    className="w-7 h-7 rounded-full bg-sky-50 hover:bg-sky-100 flex items-center justify-center text-sky-600 transition-colors active:scale-95"
                    title={`拍照识别${title}`}
                  >
                    <Camera size={14} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onAddFood(type)}
                  className="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors active:scale-95"
                  title={`手动添加${title}`}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
