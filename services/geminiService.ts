
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, BankAccount, Category } from "../types";

export class GeminiService {
  private static isKeyMissing(key: string | undefined): boolean {
    return !key || key === "undefined" || key === "" || key === "null";
  }

  private static async getAIInstance() {
    const apiKey = process.env.API_KEY;
    
    // 優先檢查 aistudio 授權狀態（適用於開發/特定部署環境）
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey && this.isKeyMissing(apiKey)) {
        throw new Error("AI_KEY_REQUIRED");
      }
    } else if (this.isKeyMissing(apiKey)) {
      throw new Error("AI_KEY_MISSING");
    }
    
    return new GoogleGenAI({ apiKey: apiKey! });
  }

  static async getFinancialAdvice(
    transactions: Transaction[],
    accounts: BankAccount[],
    categories: Category[]
  ): Promise<string> {
    try {
      const ai = await this.getAIInstance();
      
      // --- 預處理財務數據以提供更好的 Prompt ---
      const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const monthlyTrans = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });

      const income = monthlyTrans.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
      const expense = monthlyTrans.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
      const savingsRate = income > 0 ? ((income - expense) / income * 100).toFixed(1) : "0";

      // 支出分類統計
      const categorySummary = categories.map(cat => {
        const amount = monthlyTrans.filter(t => t.type === 'EXPENSE' && t.categoryId === cat.id)
          .reduce((sum, t) => sum + t.amount, 0);
        return amount > 0 ? `${cat.name}: $${amount}` : null;
      }).filter(Boolean).join(", ");

      const prompt = `
        請擔任我的私人理財顧問，根據以下我的真實財務數據提供專業建議：
        
        【資產概況】
        - 總資產：$${totalBalance.toLocaleString()}
        - 帳戶清單：${accounts.map(a => `${a.name}($${a.balance})`).join(", ")}
        
        【本月 (${currentYear}/${currentMonth + 1}) 表現】
        - 總收入：$${income.toLocaleString()}
        - 總支出：$${expense.toLocaleString()}
        - 儲蓄率：${savingsRate}%
        - 支出分佈：${categorySummary || "尚無支出資料"}
        
        【最近交易紀錄】
        ${monthlyTrans.slice(0, 5).map(t => `- ${t.date}: ${t.note || '未命名'} $${t.amount} (${t.type === 'INCOME' ? '收入' : '支出'})`).join("\n")}
        
        請針對我的情況：
        1. 給出 3 個關於如何優化支出或增加儲蓄的「具體且帶有數字」的建議。
        2. 根據我的資產狀況給出一個「理財警示」或「鼓勵」。
        3. 回答語氣要親切且具備專業洞察力。
        4. 請使用繁體中文。
      `;

      // 使用 gemini-3-flash-preview 提供更快速且具備免費額度的服務
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          temperature: 0.7,
          topP: 0.95,
        }
      });

      return response.text || "AI 顧問正在思考中，請稍後再試。";
    } catch (error: any) {
      console.error('Gemini Advisor Error:', error);
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
        contents: `生成隨機財運詩籤，時間：${new Date().toISOString()}`,
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
