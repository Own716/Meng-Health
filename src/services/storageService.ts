import { DayLog, FoodItem, MealType, UserProfile, BackupData } from '../types/diet';

const PROFILE_KEY = 'meng_health_user_profile';
const LOGS_KEY = 'meng_health_day_logs';

export const DEFAULT_PROFILE: UserProfile = {
  nickname: '梦梦',
  gender: 'female',
  age: 21,
  height: 166,
  currentWeight: 69.0,
  targetWeight: 50.0,
  dailyBudget: 1462,
  targetProtein: 124,
  targetCarbs: 150,
  targetFat: 41,
  activityLevel: 'sedentary',
  durationDays: 30,
  goalType: 'lose_weight',
};

// 获取今天的日期字符串 YYYY-MM-DD
export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 格式化日期为友好中文展示 (如: 10月26日 周一)
export function formatChineseDate(dateStr: string): { title: string; weekday: string; short: string; dayNum: number } {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekday = weekdays[date.getDay()];
  return {
    title: `${m}月${d}日 ${weekday}`,
    weekday,
    short: `${m}/${d}`,
    dayNum: d
  };
}

// 初始化空日记记录，严格绑定用户当前激活计划的预算（杜绝周六 2200 硬编码）
export function createDemoDayLog(dateStr: string): DayLog {
  const profile = getUserProfile();
  return {
    date: dateStr,
    budgetCalories: profile.dailyBudget,
    consumedCalories: 0,
    targetProtein: profile.targetProtein,
    targetCarbs: profile.targetCarbs,
    targetFat: profile.targetFat,
    meals: {
      breakfast: {
        type: 'breakfast',
        title: '早餐',
        totalCalories: 310,
        items: [
          {
            id: 'b1',
            name: '燕麦粥、浆果与杏仁',
            grams: 220,
            calories: 310,
            protein: 18,
            carbs: 45,
            fat: 8,
            note: '健康无糖燕麦'
          }
        ]
      },
      lunch: {
        type: 'lunch',
        title: '午餐',
        totalCalories: 480,
        items: [
          {
            id: 'l1',
            name: '鸡胸肉轻食沙拉、牛油果',
            grams: 320,
            calories: 480,
            protein: 42,
            carbs: 35,
            fat: 18,
            note: '油醋汁调味'
          }
        ]
      },
      dinner: {
        type: 'dinner',
        title: '晚餐',
        totalCalories: 310,
        items: [
          {
            id: 'd1',
            name: '清蒸海鲈鱼与西兰花',
            grams: 250,
            calories: 310,
            protein: 35,
            carbs: 12,
            fat: 9
          }
        ]
      },
      snack: {
        type: 'snack',
        title: '加餐/零食',
        totalCalories: 0,
        items: []
      }
    }
  };
}

// 获取用户信息
export function getUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(DEFAULT_PROFILE));
      return DEFAULT_PROFILE;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PROFILE;
  }
}

// 保存用户信息
export function saveUserProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

// 获取全部历史数据
export function getAllLogs(): Record<string, DayLog> {
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    if (!raw) {
      const today = getTodayString();
      const initial: Record<string, DayLog> = {
        [today]: createDemoDayLog(today)
      };
      localStorage.setItem(LOGS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// 获取指定日期的记录
export function getDayLog(dateStr: string): DayLog {
  const allLogs = getAllLogs();
  const profile = getUserProfile();

  if (allLogs[dateStr]) {
    const existing = allLogs[dateStr];
    // 若当天尚未记录任何餐食且摄入为 0，确保预算指标与当前激活计划完全同步 (解决 1510 / 2200 冲突与远期日期回退缺陷)
    const hasMeals = existing.meals && Object.values(existing.meals).some(m => m.items && m.items.length > 0);
    if (!hasMeals && (!existing.consumedCalories || existing.consumedCalories === 0)) {
      existing.budgetCalories = profile.dailyBudget;
      existing.targetProtein = profile.targetProtein;
      existing.targetCarbs = profile.targetCarbs;
      existing.targetFat = profile.targetFat;
    }
    return existing;
  }

  // 如果没有，自动新建一份干净的记录，严格使用当前激活计划的数值
  const newLog: DayLog = {
    date: dateStr,
    budgetCalories: profile.dailyBudget,
    consumedCalories: 0,
    targetProtein: profile.targetProtein,
    targetCarbs: profile.targetCarbs,
    targetFat: profile.targetFat,
    meals: {
      breakfast: { type: 'breakfast', title: '早餐', totalCalories: 0, items: [] },
      lunch: { type: 'lunch', title: '午餐', totalCalories: 0, items: [] },
      dinner: { type: 'dinner', title: '晚餐', totalCalories: 0, items: [] },
      snack: { type: 'snack', title: '加餐/零食', totalCalories: 0, items: [] },
    }
  };
  saveDayLog(newLog);
  return newLog;
}

// 检查某日是否包含真实的饮食或打卡记录 (用于日历状态打标与折线图空状态判定)
export function hasLogRecords(log?: DayLog): boolean {
  if (!log) return false;
  if ((log.consumedCalories || 0) > 0) return true;
  if (log.meals) {
    for (const meal of Object.values(log.meals)) {
      if (meal.items && meal.items.length > 0) return true;
    }
  }
  return false;
}

// 批量删除指定日期的所有饮食日记与数据记录 (模块一：级联清空)
export function batchDeleteDayLogs(dateStrings: string[]): void {
  const allLogs = getAllLogs();
  for (const dateStr of dateStrings) {
    delete allLogs[dateStr];
  }
  localStorage.setItem(LOGS_KEY, JSON.stringify(allLogs));
}

// 保存某日记录
export function saveDayLog(dayLog: DayLog): void {
  const allLogs = getAllLogs();
  // 重新计算总摄入
  const total =
    dayLog.meals.breakfast.totalCalories +
    dayLog.meals.lunch.totalCalories +
    dayLog.meals.dinner.totalCalories +
    dayLog.meals.snack.totalCalories;
  dayLog.consumedCalories = total;

  allLogs[dayLog.date] = dayLog;
  localStorage.setItem(LOGS_KEY, JSON.stringify(allLogs));
}

// 给某一餐添加食物
export function addFoodToMeal(dateStr: string, mealType: MealType, food: Omit<FoodItem, 'id'>): DayLog {
  const dayLog = getDayLog(dateStr);
  const newFood: FoodItem = {
    ...food,
    id: 'food_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)
  };
  dayLog.meals[mealType].items.push(newFood);
  // 更新该餐总热量
  dayLog.meals[mealType].totalCalories = dayLog.meals[mealType].items.reduce((sum, item) => sum + item.calories, 0);
  saveDayLog(dayLog);
  return dayLog;
}

// 删除某餐中的食物
export function removeFoodFromMeal(dateStr: string, mealType: MealType, foodId: string): DayLog {
  const dayLog = getDayLog(dateStr);
  dayLog.meals[mealType].items = dayLog.meals[mealType].items.filter(item => item.id !== foodId);
  dayLog.meals[mealType].totalCalories = dayLog.meals[mealType].items.reduce((sum, item) => sum + item.calories, 0);
  saveDayLog(dayLog);
  return dayLog;
}

// 导出完整备份数据 (JSON 文件下载)
export function exportBackupData(): void {
  const profile = getUserProfile();
  const history = getAllLogs();
  const backup: BackupData = {
    version: '1.6.0',
    exportTime: new Date().toISOString(),
    userProfile: profile,
    history
  };

  const jsonString = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateTag = getTodayString().replace(/-/g, '');
  a.href = url;
  a.download = `MengHealth_健康饮食备份_${dateTag}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 导入备份恢复数据
export function importBackupData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString) as BackupData;
    if (!data.history || !data.userProfile) {
      throw new Error('备份文件格式不符合 Meng Health 规范');
    }
    localStorage.setItem(PROFILE_KEY, JSON.stringify(data.userProfile));
    localStorage.setItem(LOGS_KEY, JSON.stringify(data.history));
    return true;
  } catch (err) {
    console.error('导入失败:', err);
    return false;
  }
}
