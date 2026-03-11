export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ResponseFormatJsonSchema {
  type: 'json_schema';
  json_schema: {
    name: string;
    strict: boolean;
    schema: Record<string, unknown>;
  };
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  response_format?: ResponseFormatJsonSchema;
}

export interface ChatCompletionResponse {
  choices: Array<{
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
