import { NutritionEvidence } from './nutrition';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodItem {
  id: string;
  name: string;
  grams: number;
  calories: number; // 大卡 (kcal)
  protein: number;  // g
  carbs: number;    // g
  fat: number;      // g
  note?: string;
  brand?: string;
  category?: string;
  evidence?: NutritionEvidence;
  confidence?: 'high' | 'medium' | 'low';
  verified?: boolean;
  sourceCheckedAt?: string;
}

export interface MealLog {
  type: MealType;
  title: string;
  items: FoodItem[];
  totalCalories: number;
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  budgetCalories: number;
  consumedCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  meals: {
    breakfast: MealLog;
    lunch: MealLog;
    dinner: MealLog;
    snack: MealLog;
  };
}

export interface UserProfile {
  nickname: string;
  gender: 'male' | 'female';
  age?: number;
  height: number; // cm
  currentWeight: number; // kg
  targetWeight: number;  // kg
  dailyBudget: number;   // 大卡
  targetProtein: number; // g
  targetCarbs: number;   // g
  targetFat: number;     // g
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'heavy';
  durationDays?: number; // 期望减脂周期天数
  goalType?: 'lose_weight' | 'maintain' | 'gain_muscle';
  dietPreference?: string;
}

export interface BackupData {
  version: string;
  exportTime: string;
  userProfile: UserProfile;
  history: Record<string, DayLog>; // key: YYYY-MM-DD
  customFoods?: FoodItem[];
}
