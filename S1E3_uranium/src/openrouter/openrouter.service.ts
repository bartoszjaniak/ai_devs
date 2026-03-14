import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  ExtractedToolCall,
  ResponseToolDefinition,
  ResponsesInputItem,
  ResponsesRequest,
  ResponsesResponse,
} from './openrouter.types';

@Injectable()
export class OpenRouterService {
  private readonly logger = new Logger(OpenRouterService.name);
  private readonly endpoint = 'https://openrouter.ai/api/v1/responses';

  constructor(private readonly configService: ConfigService) {}

  get defaultModel(): string {
    return (
      this.configService.get<string>('OPENROUTER_MODEL') ?? 'openai/gpt-4o-mini'
    );
  }

  async requestResponse(params: {
    input: ResponsesInputItem[];
    tools?: ResponseToolDefinition[];
    model?: string;
    temperature?: number;
  }): Promise<ResponsesResponse> {
    const request: ResponsesRequest = {
      model: params.model ?? this.defaultModel,
      input: params.input,
      tools: params.tools,
      temperature: params.temperature ?? 0.2,
    };

    this.logger.debug(
      `Sending responses request (model: ${request.model}, tools: ${request.tools?.length ?? 0})`,
    );

    return this.sendRequest(request);
  }

  extractToolCalls(response: ResponsesResponse): ExtractedToolCall[] {
    const outputItems = response.output ?? [];

    return outputItems
      .filter((item) => item.type === 'function_call')
      .map((item) => {
        const callId =
          'call_id' in item && typeof item.call_id === 'string'
            ? item.call_id
            : 'id' in item && typeof item.id === 'string'
              ? item.id
              : '';

        const name =
          'name' in item && typeof item.name === 'string' ? item.name : '';

        const argumentText =
          'arguments' in item && typeof item.arguments === 'string'
            ? item.arguments
            : '{}';

        if (!callId || !name) {
          throw new Error('Tool call is missing call_id or name');
        }

        let parsedArguments: Record<string, unknown>;

        try {
          parsedArguments = JSON.parse(argumentText) as Record<string, unknown>;
        } catch {
          throw new Error(`Invalid JSON arguments for tool call: ${name}`);
        }

        return {
          callId,
          name,
          arguments: parsedArguments,
        };
      });
  }

  extractText(response: ResponsesResponse): string {
    if (response.output_text) {
      return response.output_text;
    }

    const message = response.output?.find(
      (
        item,
      ): item is {
        type: 'message';
        content?: Array<{ type: string; text?: string }>;
      } => item.type === 'message',
    );

    const textChunk = message?.content?.find((item) => Boolean(item.text));
    return textChunk?.text ?? '';
  }

  private async sendRequest(request: ResponsesRequest): Promise<ResponsesResponse> {
    const apiKey = this.configService.get<string>('OPENROUTER_API_KEY');

    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY is not set');
    }

    const response = await axios.post<ResponsesResponse>(this.endpoint, request, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/bartoszjaniak/ai_devs',
        'X-Title': 'AI Devs - S1E3 uranium',
      },
    });

    return response.data;
  }
}
