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

  // 3. 未配置 API Key 时的备用规则引擎（体验模式）
  await new Promise(r => setTimeout(r, 800));

  const desc = (input.textDescription || '').trim();

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
        foodName: '水煮鸡蛋 (1颗)',
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

  if (desc.includes('奶茶')) {
    return [
      {
        foodName: '现调奶茶 (中杯标准甜)',
        estimatedGrams: 500,
        calories: 360,
        protein: 4,
        carbs: 58,
        fat: 12,
        reasoning: '含糖饮品与奶基底，碳水及糖分较高，减脂期建议选择不另外加糖或鲜奶茶'
      }
    ];
  }

  // 如果仅上传了图片未配置 Key
  if (processedImages.length > 0 && !desc) {
    return [
      {
        foodName: '美味轻食组合餐',
        estimatedGrams: 350,
        calories: 420,
        protein: 30,
        carbs: 45,
        fat: 12,
        reasoning: '【体验模式】未配置 API Key 时自动启用估算。在设置中填入智谱 GLM-4V API Key 即可享受真实大模型视觉识别！'
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

/**
 * 真实调用大模型（通用分发：智谱 / OpenAI 标准视觉协议 / Google Gemini）
 */
async function callRealAiApi(
  config: AiConfig,
  input: { imageBase64List?: string[]; imageBase64?: string; textDescription?: string }
): Promise<AiFoodResult[]> {
  const images = input.imageBase64List || (input.imageBase64 ? [input.imageBase64] : []);

  const prompt = `你是一位精通中国饮食文化、各类中西家常菜、外卖快餐、带包装零食及现制茶饮的资深临床营养师与减脂教练。
请仔细识别分析用户上传的一张或多张食物照片及文字描述，识别出所有的菜品、食材、零食、水果与饮品，精确估算克数(g)、热量(千卡/kcal)、蛋白质(克)、碳水化合物(克)、脂肪(克)。

【常见中式外卖与餐盒规格参考】：
- 标准长方形/圆形外卖塑料餐盒：装满米饭约 250-300g (约 300-350kcal)；单份炒菜净重通常在 250-350g；
- 食堂标准不锈钢餐盘：单个菜格约 100-150g；普通家用中碗米饭约 150g (174kcal)。

【现制奶茶与饮品规格参考 (蜜雪冰城/喜茶/茶百道/霸王茶姬等)】：
- 中杯(约 500ml)：全糖普通奶茶约 360-450kcal，半糖约 260-320kcal，微糖/不另外加糖鲜奶茶约 180-220kcal；
- 大杯(约 650-700ml)：全糖奶茶约 500-620kcal；
- 常见加料热量：黑糖波霸珍珠一份(+110-130kcal)，芝士奶盖一份(+150-180kcal)，椰果/仙草一份(+40-50kcal)；
- 经典果茶饮品：蜜雪冰城冰鲜柠檬水(大杯)约 150-180kcal。

【常见带包装零食净含量与热量参考】：
- 包装薯片/膨化食品：标准中袋 70g (约 380-390kcal)，小袋 30g (约 160kcal)；
- 辣条类（如卫龙）：标准包约 65g (约 260-280kcal)，小包约 30g；
- 坚果/每日坚果：独立小袋装标准净含量通常为 25g (约 145-155kcal)；
- 饼干类：奥利奥单小包(3片)约 29g (140kcal)；
- 吐司面包：单片全麦吐司约 35-40g (80-95kcal)。

要求：
1. 如果图片中完全没有食物、画面全黑或无法分辨，请严格返回空数组 []。
2. 必须以纯 JSON 数组格式输出，绝对不要添加任何 markdown 代码块标记（不要写 \`\`\`json 也不要写 \`\`\`），不要附带任何前置或后置说明文字。
3. 返回格式示例：
[
  {
    "foodName": "食物名称",
    "estimatedGrams": 200,
    "calories": 300,
    "protein": 25,
    "carbs": 30,
    "fat": 8,
    "reasoning": "简要营养与热量分析"
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

    // 解析 JSON 结果（鲁棒提取）
    return extractFoodResultsFromJson(resultText);

  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('AI 分析请求超时 (35秒)。建议检查手机网络，或在设置中确认 API Key 正常有效。');
    }
    throw err;
  }
}

/**
 * 鲁棒提取与格式化 AI 返回的 JSON 数组
 */
function extractFoodResultsFromJson(rawText: string): AiFoodResult[] {
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

  return parsed.map((item: any) => ({
    foodName: String(item.foodName || '未知食物'),
    estimatedGrams: Math.round(Number(item.estimatedGrams) || 100),
    calories: Math.round(Number(item.calories) || 150),
    protein: Math.round(Number(item.protein) || 5),
    carbs: Math.round(Number(item.carbs) || 20),
    fat: Math.round(Number(item.fat) || 5),
    reasoning: String(item.reasoning || '')
  }));
}
