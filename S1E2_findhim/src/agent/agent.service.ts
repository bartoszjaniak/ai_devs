import { Injectable } from '@nestjs/common';
import { AGENT_SYSTEM_PROMPT } from '../prompts/agent.prompt';
import { OpenRouterService } from '../openrouter/openrouter.service';
import { AgentAnswer } from './models/agent-answer.model';
import { ResponsesInputItem } from '../openrouter/openrouter.types';
import { handlers, tools } from '../tools';

const MAX_TOOL_STEPS = 5;

type ToolHandler = (...args: unknown[]) => unknown | Promise<unknown>;

type ToolHandlersMap = Record<string, ToolHandler>;

@Injectable()
export class AgentService {
  constructor(private readonly openRouterService: OpenRouterService) {}

  async ask(question: string): Promise<AgentAnswer> {
    let input: ResponsesInputItem[] = [
      { role: 'system', content: AGENT_SYSTEM_PROMPT },
      { role: 'user', content: question },
    ];
    let stepsRemaining = MAX_TOOL_STEPS;

    while (stepsRemaining > 0) {
      stepsRemaining -= 1;

      const response = await this.openRouterService.requestResponse({
        input,
        tools,
        temperature: 0.2,
      });

      const toolCalls = this.openRouterService.extractToolCalls(response);

      if (toolCalls.length === 0) {
        const finalText = this.openRouterService.extractText(response);
        return this.toAgentAnswer(finalText);
      }

      const toolResultMessages = await Promise.all(
        toolCalls.map(async (toolCall) => {
          const output = await this.executeTool(toolCall.name, toolCall.arguments);
          return {
            role: 'user' as const,
            content: `TOOL_RESULT ${toolCall.name}: ${JSON.stringify(output)}`,
          };
        }),
      );

      input = [...input, ...toolResultMessages];
    }

    throw new Error(
      `Tool calling did not finish within ${MAX_TOOL_STEPS} steps.`,
    );
  }

  private async executeTool(
    toolName: string,
    args: Record<string, unknown>,
  ): Promise<unknown> {
    const handler = (handlers as ToolHandlersMap)[toolName];
    if (!handler) {
      throw new Error(`Unknown tool requested by model: ${toolName}`);
    }

    if (Object.keys(args).length === 0) {
      return handler();
    }

    return handler(args);
  }

  private toAgentAnswer(text: string): AgentAnswer {
    if (!text.trim()) {
      throw new Error('Model returned empty final response');
    }

    try {
      const parsed = JSON.parse(text) as Partial<AgentAnswer>;
      if (
        typeof parsed.answer === 'string' &&
        typeof parsed.confidence === 'number'
      ) {
        return {
          answer: parsed.answer,
          confidence: this.normalizeConfidence(parsed.confidence),
        };
      }
    } catch {
      // Fallback for plain text answers.
    }

    return {
      answer: text.trim(),
      confidence: 0.5,
    };
  }

  private normalizeConfidence(value: number): number {
    if (Number.isNaN(value)) {
      return 0.5;
    }

    if (value < 0) {
      return 0;
    }

    if (value > 1) {
      return 1;
    }

    return value;
  }
}
