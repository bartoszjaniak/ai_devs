export interface ResponseTextFormatJsonSchema {
  type: 'json_schema';
  name: string;
  strict: boolean;
  schema: Record<string, unknown>;
}

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

export type ResponsesInputItem =
  | {
      role: 'system' | 'user' | 'assistant';
      content: string;
    }
  | {
      type: 'function_call_output';
      call_id: string;
      output: string;
    };

export interface ResponsesRequest {
  model: string;
  input: ResponsesInputItem[];
  previous_response_id?: string;
  tools?: ResponseToolDefinition[];
  text?: {
    format: ResponseTextFormatJsonSchema;
  };
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
      content?: Array<{
        type: string;
        text?: string;
      }>;
    }
  | {
      type: 'function_call';
      call_id?: string;
      id?: string;
      name?: string;
      arguments?: string;
    }
  | {
      type: string;
      [key: string]: unknown;
    };

export interface ExtractedToolCall {
  callId: string;
  name: string;
  arguments: Record<string, unknown>;
}
