export type EvidenceSourceType =
  | 'package_ocr'          // 包装标签 / 营养成分表 OCR
  | 'official_menu'        // 官方点单菜单 / 官方点单小程序
  | 'official_product'     // 官方产品详情页面
  | 'authoritative_db'     // 权威食品数据库 (如中国食物成分表)
  | 'web_search'           // 实时互联网多源检索
  | 'user_confirmed'       // 用户手动调整或确认
  | 'ai_inferred';         // AI 基于烹饪与食材经验推断

export type EvidenceConfidence = 'high' | 'medium' | 'low';

export interface NutritionEvidence {
  sourceType: EvidenceSourceType;
  sourceTitle: string;
  sourceUrl?: string;
  sourceDate: string;
  sourceSnippet?: string;
  confidence: EvidenceConfidence;
  verified: boolean;
  assumptions?: string;
  rawOptionCode?: string; // 自定义规格或店面代码 (如 2N200)
}

export interface NutritionValues {
  calories: number; // 大卡 (kcal)
  protein: number;  // 克 (g)
  carbs: number;    // 克 (g)
  fat: number;      // 克 (g)
  fiber?: number;   // 膳食纤维 (g)
  sugar?: number;   // 糖 (g)
  sodium?: number;  // 钠 (mg)
}

export interface FoodDissection {
  dishName: string;
  ingredients?: {
    name: string;
    estimatedGrams: number;
    calories: number;
    note?: string;
  }[];
  mainIngredients: string[];
  seasoningsAndOil?: string[];
  estimationMethod?: string;
}
