import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatMessage,
} from './openrouter.types';

@Injectable()
export class OpenRouterService {
  private readonly logger = new Logger(OpenRouterService.name);
  private readonly baseUrl = 'https://openrouter.ai/api/v1';

  constructor(private readonly configService: ConfigService) {}

  get defaultModel(): string {
    return (
      this.configService.get<string>('OPENROUTER_MODEL') ??
      'openai/gpt-4o-mini'
    );
  }

  async chat(
    messages: ChatMessage[],
    model?: string,
    temperature = 0.7,
  ): Promise<string> {
    const apiKey = this.configService.get<string>('OPENROUTER_API_KEY');
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY is not set');
    }

    const request: ChatCompletionRequest = {
      model: model ?? this.defaultModel,
      messages,
      temperature,
    };

    this.logger.debug(
      `Sending chat request to OpenRouter (model: ${request.model})`,
    );

    const response = await axios.post<ChatCompletionResponse>(
      `${this.baseUrl}/chat/completions`,
      request,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/bartoszjaniak/ai_devs',
          'X-Title': 'AI Devs – people task',
        },
      },
    );

    const content = response.data.choices[0]?.message?.content ?? '';
    this.logger.debug(`Received response: ${content.substring(0, 100)}...`);
    return content;
  }
}
