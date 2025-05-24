interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class DeepSeekApi {
  private apiKey: string;
  private baseUrl = "https://api.deepseek.com/v1";

  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY!;
    if (!this.apiKey) {
      throw new Error("DEEPSEEK_API_KEY environment variable is required");
    }
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages,
          temperature: 0.3,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
      }

      const data: DeepSeekResponse = await response.json();
      return data.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("DeepSeek API call failed:", error);
      throw error;
    }
  }
}