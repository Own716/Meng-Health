import { FoodItem, UserProfile } from '../types/diet';
import { NutritionEvidence, FoodDissection } from '../types/nutrition';
import { searchFoodNutritionEvidence } from './searchService';
import { queryAuthoritativeFood } from './authoritativeFoodDb';
import { scaleNutritionByGrams } from './nutritionCalculator';
import { CaloriePlanResult } from './calorieCalculator';

export interface AiFoodResult {
  foodName: string;
  brand?: string;
  category?: string;
  estimatedGrams: number;
  calories: number; // 大卡
  protein: number;
  carbs: number;
  fat: number;
  reasoning: string;
  per100gCalories?: number;
  evidence?: NutritionEvidence;
  confidence?: 'high' | 'medium' | 'low';
  verified?: boolean;
  foodDissection?: FoodDissection;
}

export interface AiConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

const AI_CONFIG_KEY = 'meng_health_ai_config';

// 默认采用国内智谱 GLM-4V-Flash 视觉大模型（永久免费、速度快）
export const DEFAULT_AI_CONFIG: AiConfig = {
  apiKey: '',
  baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
  model: 'glm-4v-flash'
};

export function getAiConfig(): AiConfig {
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        apiKey: parsed.apiKey || '',
        baseUrl: parsed.baseUrl || DEFAULT_AI_CONFIG.baseUrl,
        model: parsed.model || DEFAULT_AI_CONFIG.model
      };
    }
  } catch {}
  return { ...DEFAULT_AI_CONFIG };
}

export function saveAiConfig(config: AiConfig): void {
  localStorage.setItem(AI_CONFIG_KEY, JSON.stringify({
    apiKey: config.apiKey.trim(),
    baseUrl: config.baseUrl.trim(),
    model: config.model.trim()
  }));
}

/**
 * 前端 Canvas 图片等比例压缩与质量缩减
 * 将动辄 5MB~10MB 的手机原图压缩到最长边 1024px、质量 0.75 (~100KB)
 * 彻底解决手机上传大图导致的长时间卡顿、转圈与网络挂起问题
 */
export async function compressImageBase64(base64: string, maxDimension = 1024, quality = 0.75): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(base64);

        // 填充白色背景（防止透明 PNG 变黑）
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      } catch (e) {
        console.warn('图片压缩失败，使用原图数据:', e);
        resolve(base64);
      }
    };
    img.onerror = () => resolve(base64);
    img.src = base64;
  });
}

/**
 * 检查图片感知亮度与是否全黑/镜头遮挡
 */
export async function checkImageBrightness(base64: string): Promise<number> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 30;
        canvas.height = 30;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(100);
        ctx.drawImage(img, 0, 0, 30, 30);
        const data = ctx.getImageData(0, 0, 30, 30).data;
        let totalBrightness = 0;
        const pixels = data.length / 4;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // 国际标准感知亮度公式
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          totalBrightness += brightness;
        }
        resolve(totalBrightness / pixels);
      } catch {
        resolve(100);
      }
    };
    img.onerror = () => resolve(100);
    img.src = base64;
  });
}

/**
 * 测试 AI API 配置连通性
 */
export async function testAiConnection(config: AiConfig): Promise<{ success: boolean; message: string }> {
  if (!config.apiKey || config.apiKey.trim().length < 5) {
    return { success: false, message: '请先填写有效的 API Key' };
  }

  const isGemini = config.baseUrl.includes('googleapis.com');
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    if (isGemini) {
      const url = `${config.baseUrl.replace(/\/+$/, '')}/v1beta/models/${config.model.trim()}:generateContent?key=${config.apiKey.trim()}`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Ping test' }] }]
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!resp.ok) {
        const errText = await resp.text();
        return { success: false, message: `Google Gemini 接口响应错误 (${resp.status}): ${errText.slice(0, 100)}` };
      }
      return { success: true, message: 'Gemini 接口连接成功！' };
    } else {
      // 智谱/OpenAI 兼容协议
      const endpoint = config.baseUrl.endsWith('/chat/completions')
        ? config.baseUrl
        : `${config.baseUrl.replace(/\/+$/, '')}/chat/completions`;

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey.trim()}`
        },
        body: JSON.stringify({
          model: config.model.trim() || 'glm-4v-flash',
          messages: [{ role: 'user', content: 'hi' }],
          max_tokens: 5
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!resp.ok) {
        let detail = '';
        try {
          const errJson = await resp.json();
          detail = errJson.error?.message || errJson.message || JSON.stringify(errJson);
        } catch {
          detail = await resp.text();
        }

        if (resp.status === 401) {
          return { success: false, message: `认证失败 (401 Unauthorized)：API Key 不正确或已过期。详情: ${detail.slice(0, 80)}` };
        }
        return { success: false, message: `接口返回错误 (${resp.status}): ${detail.slice(0, 100)}` };
      }

      return { success: true, message: '🎉 AI 接口测试通过！API Key 认证成功，随时可以使用拍照识图！' };
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return { success: false, message: '连接超时 (15秒)，请检查网络连接或 Base URL 是否可访问' };
    }
    return { success: false, message: `网络连接异常: ${err.message || '请检查网络'}` };
  }
}

/**
 * 识别食物核心方法：优先使用真实 AI API；未配置 Key 时使用智能演示/规则识别
 * 支持传入单张图片或多张图片数组 (多图多拍同时识别)
 */
export async function identifyFood(input: {
  imageFile?: File;
  imageBase64?: string;
  imageBase64List?: string[];
  textDescription?: string;
}): Promise<AiFoodResult[]> {
  const config = getAiConfig();

  // 整理多图列表
  const rawImages: string[] = [];
  if (input.imageBase64List && input.imageBase64List.length > 0) {
    rawImages.push(...input.imageBase64List);
  } else if (input.imageBase64) {
    rawImages.push(input.imageBase64);
  }

  // 1. 如果有图片，逐张进行前端压缩与暗光黑屏检查
  const processedImages: string[] = [];
  if (rawImages.length > 0) {
    let allTooDark = true;
    for (const img of rawImages) {
      const avgBrightness = await checkImageBrightness(img);
      if (avgBrightness >= 25) {
        allTooDark = false;
      }
      const compressed = await compressImageBase64(img, 1024, 0.75);
      processedImages.push(compressed);
    }

    if (allTooDark) {
      throw new Error('拍摄画面过暗或全黑，未检测到任何食物！请在光线充足的环境下对准饭菜重新拍照。');
    }
  }

  // 2. 如果配置了有效 API Key，发起真实大模型请求
  if (config.apiKey && config.apiKey.trim().length > 5) {
    try {
      return await callRealAiApi(config, {
        imageBase64List: processedImages,
        textDescription: input.textDescription
      });
    } catch (error: any) {
      console.warn('调用真实 AI API 出错:', error);
      throw error;
    }
  }

  // 3. 未配置 API Key 时的处理：
  // 严格杜绝在未配置 Key 时使用固定假数据冒充真实 AI
  const desc = (input.textDescription || '').trim();
  if (desc) {
    // 允许通过权威中国食物成分库纯文字查询已知食物
    const authMatch = queryAuthoritativeFood(desc);
    if (authMatch) {
      const factor = authMatch.standardServingGrams / 100;
      return [
        {
          foodName: authMatch.name,
          brand: authMatch.brand,
          category: authMatch.category,
          estimatedGrams: authMatch.standardServingGrams,
          calories: Math.round(authMatch.per100g.calories * factor),
          protein: Math.round(authMatch.per100g.protein * factor * 10) / 10,
          carbs: Math.round(authMatch.per100g.carbs * factor * 10) / 10,
          fat: Math.round(authMatch.per100g.fat * factor * 10) / 10,
          reasoning: `《中国食物成分表》权威基准数据核验 (${authMatch.source})`,
          confidence: 'high',
          evidence: {
            sourceType: authMatch.isPackaged ? 'package_ocr' : 'authoritative_db',
            sourceTitle: `${authMatch.name} 标准成分`,
            sourceDate: new Date().toISOString().split('T')[0],
            sourceSnippet: `基准每100g含：${authMatch.per100g.calories}大卡，蛋白质${authMatch.per100g.protein}g，碳水${authMatch.per100g.carbs}g，脂肪${authMatch.per100g.fat}g`,
            confidence: 'high',
            verified: true
          }
        }
      ];
    }
  }

  throw new Error('未配置 AI 视觉大模型 API Key。请在「设置」中填入智谱 GLM-4V（永久免费）或其他大模型密钥后重试，或通过首页手动添加食物。');
}

/**
 * 真实调用大模型（通用分发：智谱 / OpenAI 标准视觉协议 / Google Gemini）
 */
async function callRealAiApi(
  config: AiConfig,
  input: { imageBase64List?: string[]; imageBase64?: string; textDescription?: string }
): Promise<AiFoodResult[]> {
  const images = input.imageBase64List || (input.imageBase64 ? [input.imageBase64] : []);

  const prompt = `你是一位精通中国饮食文化、各类中西家常菜、外卖快餐、带包装零食及现制茶饮的资深临床营养师与减脂教练。
请仔细识别分析用户上传的一张或多张食物照片及文字描述，识别出所有的菜品、食材、零食、水果与饮品，精确估算克数(g)、热量(大卡/kcal)、蛋白质(克)、碳水化合物(克)、脂肪(克)。

【极重要：中式传统蒸制发面面食 vs 西式烘烤面点辨析准则】：
- 严禁将「馒头夹菜 / 馒头夹肉 / 烧饼夹菜 / 烧饼夹肉 / 白吉馍 / 肉夹馍 / 煎饼果子」误判为西式汉堡 (Hamburger) 或三明治！
- 判别标准：
  1. 馒头夹菜：外层为蒸熟的白面馒头（表面白嫩、光滑细腻、无芝麻与烘烤焦黄碎屑），中间夹家常热炒菜（如青椒土豆丝、青椒炒蛋、咸菜、肉沫等）。必须精准识别命名为「馒头夹菜」！基准热量：1个标准白馒头约110g(245大卡) + 夹菜约90g(100大卡) = 约345大卡。
  2. 肉夹馍：白吉馍或千层饼烤制夹卤猪肉碎，命名为「肉夹馍」。
  3. 西式汉堡：必须是由烘烤面包坯配牛肉饼/炸鸡排与沙拉酱。如果外层是蒸熟白馍，绝不能判断为汉堡！
- 凡是发面馒头夹炒菜，一律识别为「馒头夹菜」，绝不输出为汉堡！

【包装食品净含量优先级与复合规格防呆原则（极其重要）】：
- 包装食品（特别是方便面、酸辣粉、代餐奶昔、自热火锅等复合包装）：若包装同时标有“面饼/粉饼净含量”与“配料净含量/整套总净含量”（例如：面饼120克，配料35克，全套总净含量155克），必须以全套整份总净含量（155g）作为 estimatedGrams 计算整份全部热量与营养，严禁仅按面饼120g截断！
- 包装食品与 OCR 识别模式：
  1. 识别包装上的品牌名称与产品名称。
  2. 优先提取包装营养成分表中的基准“每100g/ml”数值（能量/大卡、蛋白质、碳水化合物、脂肪），并在 JSON 中提供 per100g 字段；
  3. 提取整套包装总净含量规格（或预估总摄入克数）作为 estimatedGrams。
  4. 必须统一使用“大卡”(kcal)为热量单位（1大卡 ≈ 4.184 kJ）。

【餐桌一桌多菜拆分】：
- 若照片中包含多道菜品或主食（例如米饭、炒鸡蛋、红烧肉、青菜、汤），必须逐个拆分为独立的数组元素，每个菜独立给出克重、大卡、蛋白质、碳水和脂肪，严禁合并成一个笼统的“中式套餐”。

【常见中式外卖与餐盒规格参考】：
- 标准长方形/圆形外卖塑料餐盒：装满米饭约 250-300g (约 290-350大卡)；单份炒菜净重通常在 250-350g；
- 食堂标准不锈钢餐盘：单个菜格约 100-150g；普通家用中碗米饭约 150g (174大卡)。

【现制奶茶与饮品规格参考 (蜜雪冰城/喜茶/茶百道/霸王茶姬等)】：
- 中杯(约 500ml)：全糖普通奶茶约 360-450大卡，半糖约 260-320大卡，微糖/不另外加糖鲜奶茶约 180-220大卡；
- 大杯(约 650-700ml)：全糖奶茶约 500-620大卡；
- 常见加料热量：黑糖波霸珍珠一份(+110-130大卡)，芝士奶盖一份(+150-180大卡)，椰果/仙草一份(+40-50大卡)；
- 经典果茶饮品：蜜雪冰城冰鲜柠檬水(大杯)约 150-180大卡。

【常见带包装零食净含量与热量参考】：
- 包装方便面/速食面：整份全套净含量通常为 130g-155g（面饼约100-120g + 配料包约30-35g，整份约 550-650大卡），必须按全套总净重计算！
- 包装薯片/膨化食品：标准中袋 70g (约 380-390大卡)，小袋 30g (约 160大卡)；
- 辣条类（如卫龙）：标准包约 65g (约 240-280大卡)，小包约 30g；
- 坚果/每日坚果：独立小袋装标准净含量通常为 25g (约 145-155大卡)；
- 饼干类：奥利奥单小包(3片)约 29g (140大卡)；
- 吐司面包：单片全麦吐司约 35-40g (80-95大卡)。

要求：
1. 如果图片中完全没有食物、画面全黑或无法分辨，请严格返回空数组 []。
2. 必须以纯 JSON 数组格式输出，绝对不要添加任何 markdown 代码块标记（不要写 \`\`\`json 也不要写 \`\`\`），不要附带任何前置或后置说明文字。
3. 返回格式示例：
[
  {
    "foodName": "食物名称 (如: 白象老坛酸菜牛肉面)",
    "brand": "品牌 (如: 白象)",
    "category": "分类",
    "estimatedGrams": 155,
    "per100g": {
      "calories": 420,
      "protein": 8.5,
      "carbs": 56.5,
      "fat": 17.5
    },
    "calories": 651,
    "protein": 13.2,
    "carbs": 87.6,
    "fat": 27.1,
    "reasoning": "全套总净含量155g(面饼120g+配料35g)，经每100g基准严密换算"
  }
]
用户附加描述: ${input.textDescription || '请识别并估算图片中的食物营养'}`;

  const isGemini = config.baseUrl.includes('googleapis.com');
  const controller = new AbortController();
  // 35 秒请求超时保护，防止无限期卡住转圈
  const timeoutId = setTimeout(() => controller.abort(), 35000);

  try {
    let resultText = '';

    if (isGemini) {
      // 1. Google Gemini 协议
      const url = `${config.baseUrl.replace(/\/+$/, '')}/v1beta/models/${config.model.trim()}:generateContent?key=${config.apiKey.trim()}`;
      const contents: any[] = [];
      const parts: any[] = [{ text: prompt }];

      for (const img of images) {
        const base64Data = img.replace(/^data:image\/\w+;base64,/, '');
        parts.push({
          inline_data: {
            mime_type: 'image/jpeg',
            data: base64Data
          }
        });
      }

      contents.push({ parts });

      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
        signal: controller.signal
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`Gemini API 错误 (${resp.status}): ${errText.slice(0, 120)}`);
      }

      const json = await resp.json();
      resultText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else {
      // 2. 智谱清言 (BigModel) / OpenAI 标准视觉兼容协议 (如 glm-4v-flash, qwen-vl-plus 等)
      const endpoint = config.baseUrl.endsWith('/chat/completions')
        ? config.baseUrl
        : `${config.baseUrl.replace(/\/+$/, '')}/chat/completions`;

      const messageContent: any[] = [];

      for (const img of images) {
        const fullBase64 = img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`;
        messageContent.push({
          type: 'image_url',
          image_url: {
            url: fullBase64
          }
        });
      }

      messageContent.push({
        type: 'text',
        text: prompt
      });

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey.trim()}`
        },
        body: JSON.stringify({
          model: config.model.trim() || 'glm-4v-flash',
          messages: [
            {
              role: 'user',
              content: messageContent
            }
          ],
          temperature: 0.1
        }),
        signal: controller.signal
      });

      if (!resp.ok) {
        let errMsg = '';
        try {
          const errData = await resp.json();
          errMsg = errData.error?.message || errData.message || JSON.stringify(errData);
        } catch {
          errMsg = await resp.text();
        }

        if (resp.status === 401) {
          throw new Error('AI 认证失败 (401 Unauthorized)：API Key 无效。请在设置中检查填写的智谱 Key 是否正确无误，并注意不要复制多余空格。');
        } else if (resp.status === 429) {
          throw new Error('AI 调用受限 (429 Too Many Requests)：请求频率超限或账户配额不足。');
        } else {
          throw new Error(`AI 服务返回错误 (HTTP ${resp.status}): ${errMsg.slice(0, 150)}`);
        }
      }

      const json = await resp.json();
      resultText = json.choices?.[0]?.message?.content || '';
    }

    clearTimeout(timeoutId);

    // 解析 JSON 结果并结合权威食品库与搜索进行证据挂载与程序计算
    return await enrichFoodResults(resultText);

  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('AI 分析请求超时 (35秒)。建议检查手机网络，或在设置中确认 API Key 正常有效。');
    }
    throw err;
  }
}

/**
 * 鲁棒提取与格式化 AI 返回的 JSON 数组，并挂载权威证据链与程序精确计算
 */
async function enrichFoodResults(rawText: string): Promise<AiFoodResult[]> {
  if (!rawText || !rawText.trim()) {
    throw new Error('AI 未返回任何数据，请重试');
  }

  const cleaned = rawText
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  let parsed: any = null;

  // 1. 优先直接解析
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // 2. 正则提取 JSON 数组
    const match = cleaned.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (match) {
      try {
        parsed = JSON.parse(match[0]);
      } catch {}
    }
  }

  // 3. 正则提取单对象并封装成数组
  if (!parsed) {
    const singleMatch = cleaned.match(/\{\s*\"foodName\"[\s\S]*\}/);
    if (singleMatch) {
      try {
        parsed = [JSON.parse(singleMatch[0])];
      } catch {}
    }
  }

  if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('未在照片或描述中检测到有效食物，请重新拍摄清晰的食物照片。');
  }

  const enrichedResults: AiFoodResult[] = [];

  for (const item of parsed) {
    const rawName = String(item.foodName || '未知食物');
    const rawBrand = item.brand ? String(item.brand) : undefined;
    let estimatedGrams = Math.max(1, Math.round(Number(item.estimatedGrams) || 100));

    // 权威库交叉验证与基准对齐
    const authMatch = queryAuthoritativeFood(rawName);

    // 复合规格防呆纠偏：若为白象老坛酸菜等方便面，若识别到的克重只有面饼重 (如 100~120g)，自动纠偏为全套总净重 155g
    if (authMatch && authMatch.standardServingGrams > 0) {
      if ((rawName.includes('方便面') || rawName.includes('酸菜牛肉面') || rawName.includes('白象')) && estimatedGrams < 140) {
        estimatedGrams = authMatch.standardServingGrams; // 155g
      }
    }

    // 提取基准 per100g 营养素（优先权威库，次选大模型 OCR 提取的标称 per100g）
    const basePer100g = authMatch ? authMatch.per100g : (item.per100g && Number(item.per100g.calories) >= 0 ? item.per100g : null);

    let calories = Math.round(Number(item.calories) || 150);
    let protein = Math.round((Number(item.protein) || 5) * 10) / 10;
    let carbs = Math.round((Number(item.carbs) || 20) * 10) / 10;
    let fat = Math.round((Number(item.fat) || 5) * 10) / 10;
    let confidence: 'high' | 'medium' | 'low' = 'medium';

    if (basePer100g) {
      // 确定性数学乘算换算（彻底解耦大模型计算幻觉，如牛奶 200g 严密推导 6.6g 蛋白与 124 kcal）
      const scaled = scaleNutritionByGrams(basePer100g, estimatedGrams);
      calories = scaled.calories;
      protein = scaled.protein;
      carbs = scaled.carbs;
      fat = scaled.fat;
      confidence = 'high';
    }

    // 检索或生成来源证据
    const evidence = await searchFoodNutritionEvidence(rawName, rawBrand);
    const verified = authMatch ? true : (Boolean(item.verified));
    const foodDissection = authMatch?.foodDissection || item.foodDissection;

    let reasoning = String(item.reasoning || '');
    if (basePer100g) {
      reasoning = reasoning
        ? `${reasoning} (依据标称每100g基准确定性乘算严密推导)`
        : `依据每100g标称营养成分与${estimatedGrams}g净重由确定性数学公式严密乘算推导`;
    }

    enrichedResults.push({
      foodName: authMatch ? authMatch.name : rawName,
      brand: rawBrand || authMatch?.brand,
      category: item.category || authMatch?.category || '普通餐品',
      estimatedGrams,
      calories,
      protein,
      carbs,
      fat,
      reasoning,
      evidence,
      confidence,
      verified,
      foodDissection,
    });
  }

  return enrichedResults;
}

/**
 * 基于用户身体数据与计划结果，由真实 AI 生成专业的中文饮食教练指导
 */
export async function generateAiPlanCoaching(
  profile: UserProfile,
  plan: CaloriePlanResult
): Promise<string> {
  const config = getAiConfig();
  if (!config.apiKey || config.apiKey.trim().length < 5) {
    return `根据您的身材数据与 ${profile.durationDays || 60} 天减脂目标，每日建议最多摄入 ${plan.safeIntake} 大卡，维持约 ${plan.dailyDeficit} 大卡健康缺口。建议多吃优质蛋白（如蛋类、瘦肉、豆制品），控制精制主食与含糖饮料。`;
  }

  try {
    const isGemini = config.baseUrl.includes('googleapis.com');
    const prompt = `你是一位专业注册营养师与减脂健康教练。用户资料：
- 昵称：${profile.nickname || '梦梦'}
- 性别：${profile.gender === 'male' ? '男' : '女'}，年龄：${profile.age || 25}岁，身高：${profile.height || 165}cm
- 当前体重：${profile.currentWeight || 58}kg，目标体重：${profile.targetWeight || 52}kg (需减重 ${plan.weightToLose}kg)
- 规划周期：${profile.durationDays || 60}天，每周安全减重速度：约 ${plan.weeklyPaceKg}kg
- 每日基础代谢(BMR)：${plan.bmr} 大卡，总消耗(TDEE)：${plan.tdee} 大卡
- 规划每日摄入预算：${plan.safeIntake} 大卡 (缺口约 ${plan.dailyDeficit} 大卡)
- 营养素建议：蛋白质 ${plan.proteinGrams}g，碳水 ${plan.carbsGrams}g，脂肪 ${plan.fatGrams}g

请为该用户给出一段精炼、亲切、科学的中文减脂执行要点与饮食建议（150字以内，重点结合中餐饮食习惯，如米饭杂粮搭配、蛋白质来源与蔬菜摄入建议）。直接输出建议纯文本，不要带多余问候或免责声明。`;

    if (isGemini) {
      const url = `${config.baseUrl.replace(/\/+$/, '')}/v1beta/models/${config.model.trim()}:generateContent?key=${config.apiKey.trim()}`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      if (resp.ok) {
        const json = await resp.json();
        return json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      }
    } else {
      const endpoint = config.baseUrl.endsWith('/chat/completions')
        ? config.baseUrl
        : `${config.baseUrl.replace(/\/+$/, '')}/chat/completions`;
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey.trim()}`
        },
        body: JSON.stringify({
          model: 'glm-4-flash',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 300
        })
      });
      if (resp.ok) {
        const json = await resp.json();
        return json.choices?.[0]?.message?.content?.trim() || '';
      }
    }
  } catch {}

  return `根据您的身材数据与 ${profile.durationDays || 60} 天减脂目标，每日建议最多摄入 ${plan.safeIntake} 大卡，维持约 ${plan.dailyDeficit} 大卡健康缺口。建议多吃优质蛋白（如蛋类、瘦肉、豆制品），控制精制主食与含糖饮料。`;
}
