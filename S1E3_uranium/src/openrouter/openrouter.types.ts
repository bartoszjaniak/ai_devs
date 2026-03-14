export interface ResponseToolDefinition {
  type: 'function';
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, unknown>;
    required: string[];
    additionalProperties: boolean;
  };
  strict: boolean;
}

export type ResponsesInputItem = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export interface ResponsesRequest {
  model: string;
  input: ResponsesInputItem[];
  tools?: ResponseToolDefinition[];
  temperature?: number;
}

export interface ResponsesResponse {
  id: string;
  model: string;
  output_text?: string;
  output?: ResponseOutputItem[];
}

export type ResponseOutputItem =
  | {
      type: 'message';
      content?: Array<{ type: string; text?: string }>;
    }
  | {
      type: 'function_call';
      call_id?: string;
      id?: string;
      name?: string;
      arguments?: string;
    }
  | { type: string; [key: string]: unknown };

export interface ExtractedToolCall {
  callId: string;
  name: string;
  arguments: Record<string, unknown>;
}
