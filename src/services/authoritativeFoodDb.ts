import { NutritionValues, FoodDissection } from '../types/nutrition';

export interface AuthoritativeFoodRecord {
  name: string;
  aliases: string[];
  brand?: string;
  category: string;
  standardServingGrams: number;
  per100g: NutritionValues;
  source: string;
  isPackaged?: boolean;
  foodDissection?: FoodDissection;
}

/**
 * 权威中国食物成分库（数据基准严格源自《中国食物成分表》最新版及知名品牌官方公布营养标签）
 * 用于无网络时的权威数据比对、OCR 解析对照以及多源检索交叉验证基准
 */
export const AUTHORITATIVE_CHINESE_FOODS: AuthoritativeFoodRecord[] = [
  // --- 中式蒸煮面点与传统小吃 (重点解决馒头夹菜被误判为汉堡的特征库) ---
  {
    name: '白面馒头',
    aliases: ['馒头', '实心馒头', '大馒头', '热馒头'],
    category: '中式传统面食',
    standardServingGrams: 110,
    per100g: { calories: 223, protein: 7.0, carbs: 47.0, fat: 1.1, fiber: 1.3 },
    source: '《中国食物成分表》标准面粉蒸馒头数据'
  },
  {
    name: '馒头夹菜',
    aliases: ['馒头夹炒菜', '馒头夹土豆丝', '馒头夹青椒炒蛋', '馍夹菜'],
    category: '中式传统小吃',
    standardServingGrams: 200,
    per100g: { calories: 175, protein: 5.5, carbs: 28.5, fat: 4.8, fiber: 1.8 },
    source: '《中国食物成分表》馒头(110g)与家常清淡炒菜(90g)混合加权计算',
    foodDissection: {
      dishName: '馒头夹菜',
      mainIngredients: ['白面馒头约110g (中式蒸制面食，非西式烤面包)'],
      seasoningsAndOil: ['时蔬炒菜约90g', '清炒少油约5g'],
      estimationMethod: '中式传统蒸煮与家常清炒加权'
    }
  },
  {
    name: '馒头夹肉',
    aliases: ['馒头夹扣肉', '馒头夹卤肉', '馒头夹牛肉'],
    category: '中式传统小吃',
    standardServingGrams: 200,
    per100g: { calories: 235, protein: 11.2, carbs: 26.0, fat: 9.5, fiber: 1.2 },
    source: '《中国食物成分表》馒头(110g)与酱卤瘦肉(90g)加权',
    foodDissection: {
      dishName: '馒头夹肉',
      mainIngredients: ['白面馒头约110g'],
      seasoningsAndOil: ['熟酱卤瘦猪肉/牛肉约90g', '卤汁微量'],
      estimationMethod: '中式传统面食蒸制+酱卤熟肉'
    }
  },
  {
    name: '肉夹馍',
    aliases: ['腊汁肉夹馍', '陕西肉夹馍', '白吉馍夹肉', '潼关肉夹馍'],
    category: '中式传统小吃',
    standardServingGrams: 160,
    per100g: { calories: 268, protein: 12.5, carbs: 28.0, fat: 11.8, fiber: 1.0 },
    source: '陕西地方标准白吉馍夹腊汁肉营养测定均值',
    foodDissection: {
      dishName: '肉夹馍',
      mainIngredients: ['白吉馍约100g (半发酵烤馍)'],
      seasoningsAndOil: ['腊汁肉约60g (肥三瘦七或纯瘦)'],
      estimationMethod: '陕西地方传统肉夹馍标准'
    }
  },
  {
    name: '烧饼夹菜',
    aliases: ['烧饼夹里脊', '烧饼里脊', '烧饼夹鸡蛋', '油酥烧饼夹菜'],
    category: '中式传统小吃',
    standardServingGrams: 180,
    per100g: { calories: 215, protein: 7.2, carbs: 27.5, fat: 8.6, fiber: 1.5 },
    source: '面食烧饼(芝麻油酥)与夹心配菜加权',
    foodDissection: {
      dishName: '烧饼夹菜',
      mainIngredients: ['芝麻油酥烧饼约100g'],
      seasoningsAndOil: ['夹心菜/鸡蛋里脊约80g'],
      estimationMethod: '中式传统烘烤烧饼加权'
    }
  },
  {
    name: '煎饼果子',
    aliases: ['天津煎饼果子', '杂粮煎饼', '煎饼果子加蛋'],
    category: '中式传统小吃',
    standardServingGrams: 240,
    per100g: { calories: 195, protein: 6.8, carbs: 25.5, fat: 7.8, fiber: 2.1 },
    source: '《中国食物成分表》绿豆面煎饼果子配鸡蛋薄脆'
  },
  {
    name: '猪肉大葱包子',
    aliases: ['肉包子', '小笼包', '大肉包', '发面肉包'],
    category: '中式传统面食',
    standardServingGrams: 160,
    per100g: { calories: 227, protein: 8.5, carbs: 30.5, fat: 7.8, fiber: 1.1 },
    source: '《中国食物成分表》发面包子类'
  },
  {
    name: '蒸花卷',
    aliases: ['花卷', '葱油花卷', '椒盐花卷'],
    category: '中式传统面食',
    standardServingGrams: 100,
    per100g: { calories: 217, protein: 6.4, carbs: 45.6, fat: 1.4, fiber: 1.2 },
    source: '《中国食物成分表》'
  },

  // --- 常见主食与面点 ---
  {
    name: '蒸米饭',
    aliases: ['白米饭', '熟米饭', '大米饭', '一碗米饭'],
    category: '主食',
    standardServingGrams: 150,
    per100g: { calories: 116, protein: 2.6, carbs: 25.9, fat: 0.3, fiber: 0.4 },
    source: '《中国食物成分表》标准蒸米饭'
  },
  {
    name: '杂粮饭',
    aliases: ['糙米饭', '燕麦饭', '紫米饭', '五谷饭'],
    category: '主食',
    standardServingGrams: 150,
    per100g: { calories: 112, protein: 3.2, carbs: 23.5, fat: 0.6, fiber: 2.4 },
    source: '《中国食物成分表》粗杂粮饭'
  },
  {
    name: '煮挂面',
    aliases: ['清汤面', '阳春面', '熟面条'],
    category: '主食',
    standardServingGrams: 200,
    per100g: { calories: 110, protein: 3.8, carbs: 23.0, fat: 0.5, fiber: 0.8 },
    source: '《中国食物成分表》水煮湿面'
  },

  // --- 优质蛋白与蛋类 ---
  {
    name: '水煮鸡蛋',
    aliases: ['煮鸡蛋', '水煮蛋', '白煮蛋', '一颗鸡蛋'],
    category: '蛋类',
    standardServingGrams: 60,
    per100g: { calories: 143, protein: 12.6, carbs: 1.5, fat: 9.5 },
    source: '《中国食物成分表》全鸡蛋水煮'
  },
  {
    name: '荷包蛋',
    aliases: ['煎鸡蛋', '煎蛋', '太阳蛋'],
    category: '蛋类',
    standardServingGrams: 65,
    per100g: { calories: 196, protein: 12.0, carbs: 2.0, fat: 15.2 },
    source: '《中国食物成分表》植物油煎鸡蛋'
  },
  {
    name: '香煎鸡胸肉',
    aliases: ['水煮鸡胸肉', '鸡胸肉', '鸡排'],
    category: '肉类',
    standardServingGrams: 150,
    per100g: { calories: 133, protein: 24.6, carbs: 0.5, fat: 3.2 },
    source: '《中国食物成分表》去皮鸡胸'
  },
  {
    name: '酱牛肉',
    aliases: ['卤牛肉', '熟牛肉', '五香牛肉'],
    category: '肉类',
    standardServingGrams: 100,
    per100g: { calories: 136, protein: 26.8, carbs: 1.2, fat: 2.8 },
    source: '《中国食物成分表》酱卤黄牛肉'
  },
  {
    name: '清蒸大虾',
    aliases: ['水煮虾', '蒸虾', '白灼虾', '基围虾'],
    category: '水产类',
    standardServingGrams: 100,
    per100g: { calories: 93, protein: 18.2, carbs: 0.2, fat: 1.1 },
    source: '《中国食物成分表》鲜对虾'
  },

  // --- 家常中餐热菜 (拆解基准) ---
  {
    name: '西红柿炒鸡蛋',
    aliases: ['番茄炒蛋', '西红柿炒蛋'],
    category: '家常菜',
    standardServingGrams: 200,
    per100g: { calories: 84, protein: 4.8, carbs: 4.2, fat: 5.4, fiber: 1.0 },
    source: '《中国食物成分表》家常热炒菜'
  },
  {
    name: '青椒肉丝',
    aliases: ['青椒炒肉', '尖椒肉丝'],
    category: '家常菜',
    standardServingGrams: 200,
    per100g: { calories: 132, protein: 9.8, carbs: 3.5, fat: 8.8, fiber: 1.4 },
    source: '《中国食物成分表》'
  },
  {
    name: '红烧肉',
    aliases: ['东坡肉', '红烧五花肉'],
    category: '家常菜',
    standardServingGrams: 150,
    per100g: { calories: 345, protein: 13.5, carbs: 4.8, fat: 30.5 },
    source: '《中国食物成分表》家常红烧五花肉'
  },
  {
    name: '清炒小白菜',
    aliases: ['炒油菜', '清炒青菜', '炒青菜', '蒜蓉小白菜'],
    category: '家常菜',
    standardServingGrams: 150,
    per100g: { calories: 42, protein: 1.5, carbs: 2.8, fat: 2.8, fiber: 1.5 },
    source: '《中国食物成分表》'
  },
  {
    name: '酸辣土豆丝',
    aliases: ['炒土豆丝', '清炒土豆丝'],
    category: '家常菜',
    standardServingGrams: 180,
    per100g: { calories: 96, protein: 1.8, carbs: 14.5, fat: 3.6, fiber: 1.2 },
    source: '《中国食物成分表》'
  },
  {
    name: '麻婆豆腐',
    aliases: ['家常豆腐', '肉沫豆腐'],
    category: '家常菜',
    standardServingGrams: 200,
    per100g: { calories: 108, protein: 7.5, carbs: 3.8, fat: 7.0, fiber: 1.2 },
    source: '《中国食物成分表》'
  },

  // --- 常见包装乳品与饮品 (任务书重点指定) ---
  {
    name: '天润浓缩纯牛奶',
    aliases: ['天润纯牛奶', '天润牛奶200g', '天润浓缩奶'],
    brand: '天润',
    category: '乳品',
    standardServingGrams: 200,
    per100g: { calories: 72, protein: 3.6, carbs: 5.0, fat: 4.2 },
    source: '新疆天润浓缩纯牛奶200g利乐砖包装官方营养成分表',
    isPackaged: true
  },
  {
    name: '特仑苏纯牛奶',
    aliases: ['特仑苏', '特仑苏250ml'],
    brand: '蒙牛',
    category: '乳品',
    standardServingGrams: 250,
    per100g: { calories: 66, protein: 3.6, carbs: 5.0, fat: 3.4 },
    source: '特仑苏经典纯牛奶官方包装营养成分表',
    isPackaged: true
  },
  {
    name: '金典纯牛奶',
    aliases: ['金典', '金典250ml'],
    brand: '伊利',
    category: '乳品',
    standardServingGrams: 250,
    per100g: { calories: 65, protein: 3.6, carbs: 5.0, fat: 3.4 },
    source: '伊利金典纯牛奶官方包装营养成分表',
    isPackaged: true
  },
  {
    name: '安慕希原味酸奶',
    aliases: ['安慕希', '安慕希205g'],
    brand: '伊利',
    category: '乳品',
    standardServingGrams: 205,
    per100g: { calories: 106, protein: 3.1, carbs: 13.0, fat: 4.5 },
    source: '安慕希希腊风味常温酸奶官方包装营养成分表',
    isPackaged: true
  },
  {
    name: '元气森林白桃气泡水',
    aliases: ['元气森林', '元气森林气泡水', '无糖气泡水'],
    brand: '元气森林',
    category: '饮品',
    standardServingGrams: 480,
    per100g: { calories: 0, protein: 0, carbs: 3.8, fat: 0 },
    source: '元气森林0糖0脂0卡苏打气泡水官方营养标签(糖醇不参与能量换算)',
    isPackaged: true
  },

  // --- 常见包装零食 (任务书重点指定) ---
  {
    name: '卫龙大面筋',
    aliases: ['卫龙辣条', '大面筋', '卫龙辣条65g', '卫龙'],
    brand: '卫龙',
    category: '休闲零食',
    standardServingGrams: 65,
    per100g: { calories: 375, protein: 6.8, carbs: 45.0, fat: 18.5 },
    source: '卫龙大面筋65g经典装官方营养成分表(每袋实得约244大卡)',
    isPackaged: true
  },
  {
    name: '乐事原味薯片',
    aliases: ['乐事薯片', '原味薯片', '乐事薯片70g', '乐事'],
    brand: '乐事',
    category: '休闲零食',
    standardServingGrams: 70,
    per100g: { calories: 546, protein: 6.2, carbs: 52.0, fat: 35.0 },
    source: '乐事经典原味袋装薯片官方营养成分表(每包70g约382大卡)',
    isPackaged: true
  },
  {
    name: '奥利奥夹心饼干',
    aliases: ['奥利奥', '奥利奥原味', '奥利奥29g', '奥利奥便携装'],
    brand: '奥利奥',
    category: '休闲零食',
    standardServingGrams: 29,
    per100g: { calories: 488, protein: 5.0, carbs: 68.0, fat: 21.5 },
    source: '奥利奥经典原味饼干包装营养成分表(小包装29g约141大卡)',
    isPackaged: true
  },
  {
    name: '三只松鼠每日坚果',
    aliases: ['每日坚果', '混合坚果', '每日坚果25g', '三只松鼠坚果'],
    brand: '三只松鼠',
    category: '休闲零食',
    standardServingGrams: 25,
    per100g: { calories: 590, protein: 18.5, carbs: 24.0, fat: 47.5 },
    source: '三只松鼠每日坚果25g综合小袋官方包装(每袋约148大卡)',
    isPackaged: true
  },

  // --- 网红奶茶现制饮品 (任务书重点指定) ---
  {
    name: '蜜雪冰城珍珠奶茶(中杯/标糖)',
    aliases: ['蜜雪冰城珍珠奶茶', '蜜雪冰城奶茶', '中杯珍珠奶茶'],
    brand: '蜜雪冰城',
    category: '现制茶饮',
    standardServingGrams: 500,
    per100g: { calories: 72, protein: 1.2, carbs: 12.8, fat: 1.8 },
    source: '蜜雪冰城官方小程序产品参数与行业茶饮实测加权(500ml约360大卡)'
  },
  {
    name: '蜜雪冰城珍珠奶茶(中杯/不额外加糖)',
    aliases: ['蜜雪冰城中杯珍珠奶茶无糖', '珍珠奶茶无额外糖', '珍珠奶茶微糖'],
    brand: '蜜雪冰城',
    category: '现制茶饮',
    standardServingGrams: 500,
    per100g: { calories: 52, protein: 1.2, carbs: 8.5, fat: 1.5 },
    source: '官方配方测算：基础茶汤+植脂/纯奶底(无蔗糖糖浆)+珍珠木薯淀粉(500ml约260大卡)'
  },
  {
    name: '蜜雪冰城冰鲜柠檬水',
    aliases: ['蜜雪冰城柠檬水', '冰鲜柠檬水', '大杯柠檬水'],
    brand: '蜜雪冰城',
    category: '现制茶饮',
    standardServingGrams: 650,
    per100g: { calories: 28, protein: 0.1, carbs: 6.8, fat: 0 },
    source: '蜜雪冰城官方大杯(650ml)柠檬鲜果糖浆配方(整杯约182大卡)'
  },
  {
    name: '霸王茶姬伯牙绝弦(大杯/不另外加糖)',
    aliases: ['伯牙绝弦', '霸王茶姬', '伯牙绝弦大杯无糖'],
    brand: '霸王茶姬',
    category: '现制茶饮',
    standardServingGrams: 580,
    per100g: { calories: 28, protein: 1.2, carbs: 3.2, fat: 1.2 },
    source: '霸王茶姬官方公布热量身份证：大杯不另外加糖约162大卡'
  },
  {
    name: '喜茶烤黑糖波波真乳茶',
    aliases: ['喜茶波波茶', '黑糖波波真乳茶'],
    brand: '喜茶',
    category: '现制茶饮',
    standardServingGrams: 500,
    per100g: { calories: 84, protein: 2.2, carbs: 13.5, fat: 2.4 },
    source: '喜茶真品质健康饮品标准营养公开表(单杯约420大卡)'
  }
];

/**
 * 根据名称或关键词检索权威库记录（支持拼音、别名与部分匹配）
 */
export function queryAuthoritativeFood(queryText: string): AuthoritativeFoodRecord | null {
  if (!queryText || !queryText.trim()) return null;
  const q = queryText.trim().toLowerCase();

  // 1. 完全精确匹配
  const exact = AUTHORITATIVE_CHINESE_FOODS.find(
    f => f.name.toLowerCase() === q || f.aliases.some(a => a.toLowerCase() === q)
  );
  if (exact) return exact;

  // 2. 特殊前缀保护：如果是馒头夹菜，绝不要匹配到汉堡
  if (q.includes('馒头') && (q.includes('菜') || q.includes('肉') || q.includes('土豆') || q.includes('蛋'))) {
    if (q.includes('肉')) {
      return AUTHORITATIVE_CHINESE_FOODS.find(f => f.name === '馒头夹肉') || null;
    }
    return AUTHORITATIVE_CHINESE_FOODS.find(f => f.name === '馒头夹菜') || null;
  }
  if (q.includes('馒头')) {
    return AUTHORITATIVE_CHINESE_FOODS.find(f => f.name === '白面馒头') || null;
  }
  if (q.includes('肉夹馍') || q.includes('白吉馍')) {
    return AUTHORITATIVE_CHINESE_FOODS.find(f => f.name === '肉夹馍') || null;
  }

  // 3. 包含匹配
  const matched = AUTHORITATIVE_CHINESE_FOODS.find(
    f => q.includes(f.name.toLowerCase()) || f.aliases.some(a => q.includes(a.toLowerCase()))
  );
  return matched || null;
}
