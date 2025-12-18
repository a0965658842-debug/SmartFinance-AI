
import { GoogleGenAI } from "@google/genai";
import { Transaction, BankAccount, Category } from "../types";

export class GeminiService {
  private static getAI() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
  }

  static async getFinancialAdvice(
    transactions: Transaction[],
    accounts: BankAccount[],
    categories: Category[]
  ): Promise<string> {
    const ai = this.getAI();
    if (!ai) return "API Key 未設定，無法提供 AI 顧問服務。";

    try {
      const summary = transactions.map(t => {
        const cat = categories.find(c => c.id === t.categoryId);
        const acc = accounts.find(a => a.id === t.accountId);
        return `${t.date}: ${t.type === 'INCOME' ? '收入' : '支出'} $${t.amount} (類別: ${cat?.name || '未知'}, 帳戶: ${acc?.name || '未知'}) - ${t.note}`;
      }).join('\n');

      const prompt = `
        你是一位頂尖的理財專家。請針對以下數據提供深度的邏輯分析與 3-5 個具體、可執行的建議。
        
        帳戶概況：
        ${accounts.map(a => `- ${a.name} (${a.bankName}): 餘額 $${a.balance}`).join('\n')}

        最近交易：
        ${summary}

        請以專業且富有洞察力的口吻回答，並使用繁體中文。
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
      });

      return response.text || "分析中斷，請稍後再試。";
    } catch (error) {
      console.error('Gemini Error:', error);
      return "AI 顧問目前無法連線，請確認 API Key 是否有效。";
    }
  }

  static async getDailyFortune(): Promise<{ title: string; poem: string; meaning: string; luck: string }> {
    const ai = this.getAI();
    if (!ai) {
        return {
            title: "系統提示",
            poem: "密鑰未設事難成，雲端功能暫止行。",
            meaning: "請在環境變數中設定 API_KEY 以啟動此功能。",
            luck: "⚠️"
        };
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: "請生成一張繁體中文的今日財運詩籤。JSON 格式：{title, poem, meaning, luck(1-5星)}",
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text);
    } catch (error) {
      return {
        title: "第三六籤 中吉",
        poem: "勤儉持家萬事興，財源廣進自澄清。莫貪偏門求速效，細水長流保安寧。",
        meaning: "今日適合平實理財，不要有過多投機心態，守住現有資產便是福。",
        luck: "⭐⭐⭐"
      };
    }
  }
}
