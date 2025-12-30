
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, BankAccount, Category } from "../types";

export class GeminiService {
  private static getAIInstance() {
    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey === "undefined") {
      throw new Error("API_KEY_MISSING");
    }
    return new GoogleGenAI({ apiKey });
  }

  /**
   * 使用 Gemini 3 Pro 進行財務深度分析
   */
  static async getFinancialAdvice(
    transactions: Transaction[],
    accounts: BankAccount[],
    categories: Category[]
  ): Promise<string> {
    try {
      const ai = this.getAIInstance();
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
      if (error.message === "API_KEY_MISSING") {
        return "⚠️ AI 功能尚未啟用：系統檢測到 API Key 缺失。請確保環境變數中已正確注入 API_KEY。";
      }
      return "AI 服務暫時不可用，請稍後再試。";
    }
  }

  /**
   * 生成結構化的隨機財運詩籤
   */
  static async getDailyFortune(): Promise<{ title: string; poem: string; meaning: string; luck: string }> {
    // 降級備案：提供一組隨機的本地詩籤
    const backups = [
      { title: "第十九籤 龍德入命", poem: "龍德星君照命宮。財源滾滾似長江。不須苦苦勞心力。自有福人助建功。", meaning: "今日貴人運強，理財適合諮詢長輩或專業人士，會有意想不到的收穫。", luck: "⭐⭐⭐⭐⭐" },
      { title: "第五四籤 雲開見日", poem: "雲遮月缺路漫漫。莫怨時光轉運難。一旦烏雲風捲盡。財如泉湧到窗前。", meaning: "過去的低迷即將結束，適合重新檢視長期投資組合，等待回升。", luck: "⭐⭐⭐⭐" },
      { title: "第八籤 萬商雲集", poem: "一帆風順達長江。萬里波平好去向。財源似水連綿至。基業安如泰山昂。", meaning: "目前正處於穩定獲利的時期，適合守成並持續小額投資。", luck: "⭐⭐⭐⭐" }
    ];

    try {
      const ai = this.getAIInstance();
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
              title: { type: Type.STRING, description: '詩籤標題' },
              poem: { type: Type.STRING, description: '四句詩文' },
              meaning: { type: Type.STRING, description: '現代解析' },
              luck: { type: Type.STRING, description: '幸運等級 (⭐)' },
            },
            required: ['title', 'poem', 'meaning', 'luck'],
          }
        }
      });
      
      const jsonStr = response.text?.trim() || "{}";
      return JSON.parse(jsonStr);
    } catch (error) {
      console.warn('Gemini Fortune Error, using backup:', error);
      return backups[Math.floor(Math.random() * backups.length)];
    }
  }
}
