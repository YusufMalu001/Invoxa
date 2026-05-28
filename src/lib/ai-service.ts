import Anthropic from '@anthropic-ai/sdk';

export interface AIServiceOptions {
  model?: string;
  maxTokens?: number;
}

export class AIService {
  private anthropic: Anthropic | null = null;
  private isMock: boolean = false;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.warn('ANTHROPIC_API_KEY is not set. AIService will use mock fallback.');
      this.isMock = true;
    } else {
      this.anthropic = new Anthropic({
        apiKey,
      });
    }
  }

  async generateText(prompt: string, options: AIServiceOptions = {}): Promise<string> {
    if (this.isMock || !this.anthropic) {
      return this.mockGenerateText(prompt);
    }

    try {
      const response = await this.anthropic.messages.create({
        model: options.model || 'claude-3-haiku-20240307',
        max_tokens: options.maxTokens || 1024,
        messages: [{ role: 'user', content: prompt }],
      });

      // Handle the text response from Claude
      if (response.content.length > 0 && response.content[0].type === 'text') {
        return response.content[0].text;
      }
      return '';
    } catch (error) {
      console.error('Error calling Anthropic API:', error);
      return this.mockGenerateText(prompt); // Fallback on error
    }
  }

  async extractJSON<T>(prompt: string, options: AIServiceOptions = {}): Promise<T | null> {
    const systemPrompt = `You are a specialized data extraction AI. You MUST output ONLY valid JSON. Do not wrap it in markdown code blocks or provide any conversational text. Just the raw JSON object.`;
    
    if (this.isMock || !this.anthropic) {
      return this.mockExtractJSON<T>(prompt);
    }

    try {
      const response = await this.anthropic.messages.create({
        model: options.model || 'claude-3-haiku-20240307',
        max_tokens: options.maxTokens || 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      });

      if (response.content.length > 0 && response.content[0].type === 'text') {
        const text = response.content[0].text.trim();
        // Try to parse the text, stripping markdown if the AI mistakenly included it
        const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]) as T;
        }
        return JSON.parse(text) as T;
      }
      return null;
    } catch (error) {
      console.error('Error in extractJSON:', error);
      return this.mockExtractJSON<T>(prompt);
    }
  }

  private mockGenerateText(prompt: string): string {
    return `[Mock AI Response] Simulated response for prompt: "${prompt.substring(0, 50)}..."`;
  }

  private mockExtractJSON<T>(prompt: string): T {
    // Mock response assuming standard formats for this app
    if (prompt.toLowerCase().includes('invoice') || prompt.toLowerCase().includes('receipt')) {
      return {
        vendor: "Mock Vendor Inc.",
        date: new Date().toISOString().split('T')[0],
        amount: 150.00,
        category: "Office Supplies",
        confidence: 0.95
      } as unknown as T;
    }
    
    return {} as T;
  }
}

export const aiService = new AIService();
