
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, BankAccount, Category } from "../types";

export class GeminiService {
  private static async getAIInstance() {
    const apiKey = process.env.API_KEY;
    
    // 檢查是否存在 aistudio 平台提供的 Key 選擇機制
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey && (!apiKey || apiKey === "undefined")) {
        throw new Error("AI_KEY_REQUIRED");
      }
    } else if (!apiKey || apiKey === "undefined") {
      throw new Error("API_KEY_MISSING");
    }
    
    // 每次呼叫時才建立實例，確保使用最新的 process.env.API_KEY
    return new GoogleGenAI({ apiKey });
  }

  static async getFinancialAdvice(
    transactions: Transaction[],
    accounts: BankAccount[],
    categories: Category[]
  ): Promise<string> {
    try {
      const ai = await this.getAIInstance();
      const summary = transactions.map(t => {
        const cat = categories.find(c => c.id === t.categoryId);
        return `${t.date}: ${t.type === 'INCOME' ? '收入' : '支出'} $${t.amount} (${cat?.name || '未知'}) - ${t.note}`;
      }).join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `帳戶概況：\n${accounts.map(a => `${a.name}: $${a.balance}`).join('\n')}\n\n最近交易：\n${summary}`,
        config: {
          systemInstruction: "你是一位專業理財專家。請針對使用者提供的財務數據提供 3-5 個具體、可執行的建議。請用繁體中文回答，語氣要專業且具備洞察力。",
        }
      });

      return response.text || "AI 顧問目前在沉思中，請稍後再試。";
    } catch (error: any) {
      console.error('Gemini Advisor Error:', error);
      if (error.message.includes("Requested entity was not found")) {
        throw new Error("AI_KEY_INVALID");
      }
      throw error;
    }
  }

  static async getDailyFortune(): Promise<{ title: string; poem: string; meaning: string; luck: string }> {
    try {
      const ai = await this.getAIInstance();
      const themes = ["偏財", "守成", "勤勉", "驚喜", "轉機", "穩健", "人脈", "靈感", "投資", "開源"];
      const randomTheme = themes[Math.floor(Math.random() * themes.length)];
      const seed = Math.random().toString(36).substring(7);

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `目前的主題關鍵字是：${randomTheme}，隨機標識：${seed}`,
        config: { 
          systemInstruction: `為使用者生成一張繁體中文的財運詩籤。內容必須完全原創，每次都要有不同的意境。包含一個有古風味道的標題。四句詩要押韻且優美。解析要貼近現代生活中的金錢與理財觀念。幸運指數用星星符號 (⭐) 表示，1到5顆星。`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              poem: { type: Type.STRING },
              meaning: { type: Type.STRING },
              luck: { type: Type.STRING },
            },
            required: ['title', 'poem', 'meaning', 'luck'],
          }
        }
      });
      
      const jsonStr = response.text?.trim() || "{}";
      return JSON.parse(jsonStr);
    } catch (error: any) {
      console.error('Gemini Fortune Error:', error);
      if (error.message.includes("Requested entity was not found")) {
        throw new Error("AI_KEY_INVALID");
      }
      throw error;
    }
  }
}
