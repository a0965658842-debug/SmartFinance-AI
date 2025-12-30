
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, BankAccount, Category } from "../types";

export class GeminiService {
  /**
   * 檢查金鑰是否有效存在
   */
  private static isKeyMissing(key: string | undefined): boolean {
    return !key || key === "undefined" || key === "" || key === "null";
  }

  private static async getAIInstance() {
    const apiKey = process.env.API_KEY;
    
    // 優先檢查 aistudio 授權狀態
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey && this.isKeyMissing(apiKey)) {
        throw new Error("AI_KEY_REQUIRED");
      }
    } else if (this.isKeyMissing(apiKey)) {
      throw new Error("AI_KEY_MISSING");
    }
    
    // 規範：每次呼叫前才建立實例，以抓取最新金鑰
    return new GoogleGenAI({ apiKey: apiKey! });
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
          systemInstruction: "你是一位專業理財專家。請針對數據提供 3-5 個具體建議。請用繁體中文回答。",
        }
      });

      return response.text || "AI 顧問暫時無法提供建議。";
    } catch (error: any) {
      console.error('Gemini Advisor Error:', error);
      // 規範：處理 Requested entity was not found 錯誤
      if (error.message?.includes("Requested entity was not found") || error.message?.includes("404")) {
        throw new Error("AI_KEY_INVALID");
      }
      throw error;
    }
  }

  static async getDailyFortune(): Promise<{ title: string; poem: string; meaning: string; luck: string }> {
    try {
      const ai = await this.getAIInstance();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `生成隨機財運詩籤，時間戳記：${Date.now()}`,
        config: { 
          systemInstruction: `為使用者生成一張繁體中文的財運詩籤。包含標題、四句詩、現代解析、幸運等級(⭐)。`,
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
      if (error.message?.includes("Requested entity was not found") || error.message?.includes("404")) {
        throw new Error("AI_KEY_INVALID");
      }
      throw error;
    }
  }
}
