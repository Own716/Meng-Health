import { DayLog, FoodItem, MealType, UserProfile, BackupData } from '../types/diet';

const PROFILE_KEY = 'meng_health_user_profile';
const LOGS_KEY = 'meng_health_day_logs';

export const DEFAULT_PROFILE: UserProfile = {
  nickname: '自律小萌',
  gender: 'female',
  height: 165,
  currentWeight: 58.5,
  targetWeight: 52.0,
  dailyBudget: 2200,
  targetProtein: 130,
  targetCarbs: 240,
  targetFat: 70,
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

// 初始化演示数据，完美匹配效果图展示
export function createDemoDayLog(dateStr: string): DayLog {
  return {
    date: dateStr,
    budgetCalories: 2200,
    consumedCalories: 1100, // 剩余 1100，或阶段目标 1650
    targetProtein: 130,
    targetCarbs: 240,
    targetFat: 70,
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
  if (allLogs[dateStr]) {
    return allLogs[dateStr];
  }
  // 如果没有，自动新建一份干净的记录
  const profile = getUserProfile();
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
    version: '1.0.0',
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
