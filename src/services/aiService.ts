import { FoodItem } from '../types/diet';

export interface AiFoodResult {
  foodName: string;
  estimatedGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  reasoning: string;
}

export interface AiConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

const AI_CONFIG_KEY = 'meng_health_ai_config';

export function getAiConfig(): AiConfig {
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    apiKey: '',
    baseUrl: 'https://generativelanguage.googleapis.com',
    model: 'gemini-1.5-flash'
  };
}

export function saveAiConfig(config: AiConfig): void {
  localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
}

// 检查图片亮度与是否全黑/遮挡
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
          // 感知亮度公式
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
 * 识别食物：优先调用用户配置的真实 API；未配置时使用智能规则/演示算法
 */
export async function identifyFood(input: {
  imageFile?: File;
  imageBase64?: string;
  textDescription?: string;
}): Promise<AiFoodResult[]> {
  const config = getAiConfig();

  // 1. 如果提供了图片，先进行图像有效性与亮度检测
  if (input.imageBase64) {
    const avgBrightness = await checkImageBrightness(input.imageBase64);
    // 亮度低于 25 说明镜头被遮挡、黑屏或在极暗环境下拍摄
    if (avgBrightness < 25) {
      throw new Error('拍摄画面过暗或全黑，未检测到任何食物！请在光线充足的环境下对准饭菜重新拍照。');
    }
  }

  // 2. 如果配置了真实 API Key，准备调用大模型
  if (config.apiKey && config.apiKey.trim().length > 5) {
    try {
      return await callRealAiApi(config, input);
    } catch (error: any) {
      console.warn('调用真实 AI API 出错:', error);
      throw new Error(`AI 服务返回错误: ${error.message || '请检查 API Key 或网络'}`);
    }
  }

  // 3. 模拟 AI 处理网络耗时
  await new Promise(r => setTimeout(r, 1200));

  const desc = (input.textDescription || '').trim();

  // 纯文本精准规则识别
  if (desc.includes('牛肉') || desc.includes('面')) {
    return [
      {
        foodName: '经典牛肉拉面 (含牛肉切片)',
        estimatedGrams: 450,
        calories: 520,
        protein: 28,
        carbs: 72,
        fat: 14,
        reasoning: 'AI 营养师分析：拉面面条约 250g，酱牛肉约 70g，富含碳水化合物与优质蛋白'
      }
    ];
  }

  if (desc.includes('沙拉') || desc.includes('鸡胸')) {
    return [
      {
        foodName: '香煎鸡胸肉牛油果沙拉',
        estimatedGrams: 320,
        calories: 360,
        protein: 38,
        carbs: 18,
        fat: 12,
        reasoning: '高蛋白低脂健康减脂餐，微量油醋汁，极佳的减重供能配比'
      }
    ];
  }

  if (desc.includes('鸡蛋') || desc.includes('蛋')) {
    return [
      {
        foodName: '水煮水光蛋',
        estimatedGrams: 60,
        calories: 86,
        protein: 7.5,
        carbs: 0.8,
        fat: 5.5,
        reasoning: '高生物价优质蛋白质来源，饱腹感强'
      }
    ];
  }

  if (desc.includes('米饭') || desc.includes('饭')) {
    return [
      {
        foodName: '蒸熟白米饭 (约大半碗)',
        estimatedGrams: 150,
        calories: 174,
        protein: 4,
        carbs: 38,
        fat: 0.5,
        reasoning: '优质复合碳水化合物主食，建议减脂期搭配蔬菜与高蛋白肉类'
      }
    ];
  }

  // 如果仅上传了图片但未输入文字，且处于免 Key 体验模式
  if (input.imageBase64 && !desc) {
    return [
      {
        foodName: '健康轻食混合餐 (杂粮+高蛋白肉类+时蔬)',
        estimatedGrams: 350,
        calories: 420,
        protein: 32,
        carbs: 48,
        fat: 10,
        reasoning: '【模拟测试】已检测到食物光彩。后续在设置中填入您的专属 AI API Key 后，即可开启真实大模型逐物识别与精准称重！'
      }
    ];
  }

  if (desc) {
    return [
      {
        foodName: desc,
        estimatedGrams: 200,
        calories: 260,
        protein: 15,
        carbs: 35,
        fat: 6,
        reasoning: `基于您的描述“${desc}”估算出的日常均值营养成分`
      }
    ];
  }

  throw new Error('未输入饮食描述或未检测到清晰餐品照片');
}

async function callRealAiApi(config: AiConfig, input: { imageBase64?: string; textDescription?: string }): Promise<AiFoodResult[]> {
  const prompt = `你是一位专业临床营养师。请分析用户提供的食物图片或文本描述，估算各食物的克数、热量(千卡/kcal)、蛋白质(克)、碳水化合物(克)、脂肪(克)。
如果图片不是食物，或者过于模糊黑屏，请返回空的 JSON 数组 []。
必须以纯 JSON 数组格式返回，不要附带任何 markdown 标记，格式如下：
[
  {
    "foodName": "食物名称",
    "estimatedGrams": 200,
    "calories": 300,
    "protein": 25,
    "carbs": 30,
    "fat": 8,
    "reasoning": "简要营养分析"
  }
]
用户描述: ${input.textDescription || '请识别图片中的饮食'}`;

  const url = `${config.baseUrl}/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`;

  const contents: any[] = [];
  const parts: any[] = [{ text: prompt }];

  if (input.imageBase64) {
    const base64Data = input.imageBase64.replace(/^data:image\/\w+;base64,/, '');
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
    body: JSON.stringify({ contents })
  });

  if (!resp.ok) {
    throw new Error(`AI API HTTP 错误: ${resp.status}`);
  }

  const json = await resp.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('未在照片中识别出有效食物，请对准真实饭菜重新拍摄。');
  }
  return parsed;
}
