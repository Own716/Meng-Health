export interface CaloriePlanInput {
  currentWeight: number; // kg
  targetWeight: number;  // kg
  height: number;        // cm
  age: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'heavy';
  durationDays: number;
}

export interface CaloriePlanResult {
  bmr: number;
  tdee: number;
  safeIntake: number;
  dailyDeficit: number;
  weightToLose: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  weeklyPaceKg: number;
}

export const ACTIVITY_MULTIPLIERS = {
  sedentary: { label: '久坐伏案 (缺乏运动)', factor: 1.2 },
  light: { label: '轻度活动 (每周运动1-3次)', factor: 1.375 },
  moderate: { label: '中度运动 (每周运动3-5次)', factor: 1.55 },
  heavy: { label: '高强度运动 (体力劳动/重训)', factor: 1.725 },
};

/**
 * 确定性人体能量与代谢规划算法
 * Mifflin-St Jeor 基础代谢公式与 TDEE 每日能量消耗模型
 */
export function calculateDietPlan(input: CaloriePlanInput): CaloriePlanResult {
  const w = Math.max(30, Math.min(250, input.currentWeight || 60));
  const targetW = Math.max(30, Math.min(250, input.targetWeight || 55));
  const h = Math.max(100, Math.min(250, input.height || 165));
  const a = Math.max(12, Math.min(100, input.age || 25));
  const days = Math.max(14, Math.min(365, input.durationDays || 60));

  // 1. Mifflin-St Jeor 基础代谢 (BMR)
  const bmr = Math.round(
    10 * w + 6.25 * h - 5 * a + (input.gender === 'male' ? 5 : -161)
  );

  // 2. 每日总消耗 (TDEE)
  const factor = ACTIVITY_MULTIPLIERS[input.activityLevel]?.factor || 1.375;
  const tdee = Math.round(bmr * factor);

  // 3. 目标缺口测算
  const weightToLose = Math.max(0, w - targetW);
  // 1kg 人体体脂约合 7700 大卡能量
  const totalDeficitNeeded = weightToLose * 7700;
  // 每日健康安全缺口推荐 300 ~ 600 大卡
  let dailyDeficit = Math.round(totalDeficitNeeded / days);
  dailyDeficit = Math.min(650, Math.max(250, dailyDeficit));

  // 4. 建议每日安全热量摄入 (Intake)
  // 严格执行基础代谢保护底线 (BMR Floor)：摄入量绝对不能低于 BMR，防止肌肉流失与代谢受损
  const safeIntake = Math.max(bmr, tdee - dailyDeficit);

  // 实际生效缺口：严格由 TDEE - safeIntake 动态推导 (消除触碰 BMR Floor 时的文案与数值矛盾)
  const actualDeficit = Math.max(0, tdee - safeIntake);

  // 5. 三大宏量营养素科学分配 (推荐中国居民减脂期高蛋白适度碳水比例)
  // 蛋白质：体重 × 1.6~1.8g (每克产生4大卡)
  const proteinGrams = Math.round(w * 1.8);
  const proteinCal = proteinGrams * 4;

  // 脂肪：占总摄入能量 25% (每克产生9大卡)
  const fatCal = Math.round(safeIntake * 0.25);
  const fatGrams = Math.round(fatCal / 9);

  // 碳水化合物：剩余热量提供 (每克产生4大卡)
  const carbsCal = Math.max(0, safeIntake - proteinCal - fatCal);
  const carbsGrams = Math.round(carbsCal / 4);

  const weeklyPaceKg = Math.round(((actualDeficit * 7) / 7700) * 100) / 100;

  return {
    bmr,
    tdee,
    safeIntake,
    dailyDeficit: actualDeficit,
    weightToLose: Math.round(weightToLose * 10) / 10,
    proteinGrams,
    carbsGrams,
    fatGrams,
    weeklyPaceKg,
  };
}
