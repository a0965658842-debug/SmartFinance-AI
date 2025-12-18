
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, BankAccount, Category } from "../types";

export class GeminiService {
  /**
   * 使用 Gemini 3 Pro 進行財務深度分析
   */
  static async getFinancialAdvice(
    transactions: Transaction[],
    accounts: BankAccount[],
    categories: Category[]
  ): Promise<string> {
    // ALWAYS use new GoogleGenAI({apiKey: process.env.API_KEY});
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
      const summary = transactions.map(t => {
        const cat = categories.find(c => c.id === t.categoryId);
        return `${t.date}: ${t.type === 'INCOME' ? '收入' : '支出'} $${t.amount} (${cat?.name || '未知'}) - ${t.note}`;
      }).join('\n');

      const prompt = `你是一位專業理財專家。請針對以下財務數據提供 3-5 個具體、可執行的建議：\n\n帳戶概況：\n${accounts.map(a => `${a.name}: $${a.balance}`).join('\n')}\n\n最近交易：\n${summary}\n\n請用繁體中文回答，語氣要專業且具備洞察力。`;

      // Use ai.models.generateContent with both model name and contents
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
      });

      // text is a property, do not call as a method
      return response.text || "AI 顧問目前在沉思中，請稍後再試。";
    } catch (error) {
      console.error('Gemini Advisor Error:', error);
      return "AI 服務暫時不可用，請檢查您的系統配置。";
    }
  }

  /**
   * 生成結構化的財運詩籤
   */
  static async getDailyFortune(): Promise<{ title: string; poem: string; meaning: string; luck: string }> {
    // ALWAYS use new GoogleGenAI({apiKey: process.env.API_KEY});
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: "為今日財運生成一張繁體中文詩籤。包含標題、四句詩、解析與幸運指數。",
        config: { 
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
      
      // text is a property, do not call as a method
      const jsonStr = response.text?.trim() || "{}";
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Gemini Fortune Error:', error);
      return { 
        title: "第三六籤 中吉", 
        poem: "勤儉持家萬事興，財源廣進自澄清。莫貪偏門求速效，細水長流保安寧。", 
        meaning: "今日宜平穩守成，理財應重視長遠規劃而非短線投機。", 
        luck: "⭐⭐⭐" 
      };
    }
  }
}
