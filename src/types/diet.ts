export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodItem {
  id: string;
  name: string;
  grams: number;
  calories: number; // kcal
  protein: number;  // g
  carbs: number;    // g
  fat: number;      // g
  note?: string;
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
  dailyBudget: number;   // kcal
  targetProtein: number; // g
  targetCarbs: number;   // g
  targetFat: number;     // g
}

export interface BackupData {
  version: string;
  exportTime: string;
  userProfile: UserProfile;
  history: Record<string, DayLog>; // key: YYYY-MM-DD
}
