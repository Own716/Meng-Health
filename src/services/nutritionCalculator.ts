import { NutritionValues } from '../types/nutrition';
import { FoodItem } from '../types/diet';

/**
 * 确定性四则运算与营养单位换算器 (严禁使用大模型进行算数)
 */

// 1 大卡 (kcal) = 4.184 千焦 (kJ)
export function kJToKcal(kj: number): number {
  if (!kj || kj <= 0) return 0;
  return Math.round(kj / 4.184);
}

// 1 大卡 = 4.184 kJ
export function kcalToKJ(kcal: number): number {
  if (!kcal || kcal <= 0) return 0;
  return Math.round(kcal * 4.184);
}

// 基于三大供能营养素计算理论能量：4 * 蛋白质 + 4 * 碳水 + 9 * 脂肪
export function calculateMacroEnergy(protein: number, carbs: number, fat: number): number {
  return Math.round((protein || 0) * 4 + (carbs || 0) * 4 + (fat || 0) * 9);
}

// 基于每 100g 营养成分表计算目标克重下的营养素
export function scaleNutritionByGrams(
  per100g: NutritionValues,
  targetGrams: number
): NutritionValues {
  const factor = Math.max(0, targetGrams) / 100;
  return {
    calories: Math.round(per100g.calories * factor),
    protein: Math.round(per100g.protein * factor * 10) / 10,
    carbs: Math.round(per100g.carbs * factor * 10) / 10,
    fat: Math.round(per100g.fat * factor * 10) / 10,
    fiber: per100g.fiber !== undefined ? Math.round(per100g.fiber * factor * 10) / 10 : undefined,
    sugar: per100g.sugar !== undefined ? Math.round(per100g.sugar * factor * 10) / 10 : undefined,
    sodium: per100g.sodium !== undefined ? Math.round(per100g.sodium * factor) : undefined,
  };
}

// 汇总多个食品条目的营养总量
export function sumFoodNutritions(items: FoodItem[]): NutritionValues {
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;

  for (const item of items) {
    calories += item.calories || 0;
    protein += item.protein || 0;
    carbs += item.carbs || 0;
    fat += item.fat || 0;
  }

  return {
    calories: Math.round(calories),
    protein: Math.round(protein * 10) / 10,
    carbs: Math.round(carbs * 10) / 10,
    fat: Math.round(fat * 10) / 10,
  };
}

// 计算本餐食物的热量贡献排名
export function rankFoodCalorieContributions(items: FoodItem[]): {
  id: string;
  name: string;
  calories: number;
  percentage: number;
}[] {
  const total = items.reduce((acc, cur) => acc + (cur.calories || 0), 0);
  return items
    .map(item => ({
      id: item.id,
      name: item.name,
      calories: item.calories,
      percentage: total > 0 ? Math.round((item.calories / total) * 100) : 0
    }))
    .sort((a, b) => b.calories - a.calories);
}
