import { NutritionValues } from '../types/nutrition';

export interface ValidationResult {
  valid: boolean;
  warnings: string[];
  energyDiscrepancy?: number;
}

/**
 * 营养数据物理定律与合理性校验器
 * 检查 4 * 蛋白质 + 4 * 碳水 + 9 * 脂肪 与总热量的大致守恒性
 */
export function validateNutrition(values: NutritionValues): ValidationResult {
  const warnings: string[] = [];

  if (values.calories < 0) warnings.push('热量不能为负数');
  if (values.protein < 0) warnings.push('蛋白质不能为负数');
  if (values.carbs < 0) warnings.push('碳水化合物不能为负数');
  if (values.fat < 0) warnings.push('脂肪不能为负数');

  // 计算理论能量
  const theoreticalEnergy = (values.protein || 0) * 4 + (values.carbs || 0) * 4 + (values.fat || 0) * 9;
  const discrepancy = Math.abs(theoreticalEnergy - values.calories);

  // 如果总能量与三大供能营养素理论值相差超过 30% 或 150 大卡，提示注意
  if (values.calories > 50 && theoreticalEnergy > 0) {
    const errorRatio = discrepancy / values.calories;
    if (errorRatio > 0.35 && discrepancy > 120) {
      warnings.push(`三大营养素理论热量(${theoreticalEnergy}大卡)与标称热量(${values.calories}大卡)存在偏差`);
    }
  }

  return {
    valid: warnings.length === 0,
    warnings,
    energyDiscrepancy: Math.round(discrepancy),
  };
}
