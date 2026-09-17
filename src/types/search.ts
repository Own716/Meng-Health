export type SearchProviderType =
  | 'zhipu_builtin'    // 智谱内置 web_search 工具能力
  | 'gemini_grounding' // Google Gemini GoogleSearch Grounding
  | 'tavily'           // Tavily 实时 AI 搜索
  | 'bing'             // Bing Web Search API
  | 'custom_endpoint'  // 自定义搜索 API
  | 'authoritative_db';// 本地中国食物成分权威数据库 (备用与交叉验证)

export interface SearchConfig {
  enabled: boolean;
  provider: SearchProviderType;
  apiKey: string;
  endpoint?: string;
}

export interface SearchResultItem {
  title: string;
  url?: string;
  snippet: string;
  sourceName: string;
  date?: string;
  score?: number;
}

export interface SearchResponse {
  query: string;
  provider: SearchProviderType;
  results: SearchResultItem[];
  checkedAt: string;
  success: boolean;
  error?: string;
}
