import { Injectable } from '@nestjs/common';
import { AGENT_SYSTEM_PROMPT } from '../prompts/agent.prompt';
import { OpenRouterService } from '../openrouter/openrouter.service';
import { ResponsesInputItem } from '../openrouter/openrouter.types';
import { handlers, tools } from '../tools';
import { SessionConversation } from './models/session-conversation.model';
import { ConsoleMessageFormatterService } from '../../../shared/logger/console-message-formatter.service';

const MAX_TOOL_STEPS = 20;

type ToolHandler = (...args: unknown[]) => unknown | Promise<unknown>;
type ToolHandlersMap = Record<string, ToolHandler>;

@Injectable()
export class AgentService {
  private readonly sessions = new Map<string, SessionConversation>();
  private readonly formatter = new ConsoleMessageFormatterService();

  constructor(private readonly openRouterService: OpenRouterService) {}

  async ask(sessionID: string, message: string): Promise<string> {
    this.formatter.log({
      type: 'user',
      details: `session: ${sessionID}`,
      message,
    });

    const conversation = this.getOrCreateConversation(sessionID);
    conversation.input = [...conversation.input, { role: 'user', content: message }];
    conversation.updatedAt = Date.now();

    let stepsRemaining = MAX_TOOL_STEPS;

    while (stepsRemaining > 0) {
      stepsRemaining -= 1;

      const response = await this.openRouterService.requestResponse({
        input: conversation.input,
        tools,
        temperature: 0.2,
      });

      const toolCalls = this.openRouterService.extractToolCalls(response);

      if (toolCalls.length === 0) {
        const finalText = this.openRouterService.extractText(response).trim();
        const fallback = 'nie wiem ziom, a co Ty myslisz?';
        const answer = finalText.length > 0 ? finalText : fallback;

        conversation.input = [
          ...conversation.input,
          { role: 'assistant', content: answer },
        ];
        conversation.updatedAt = Date.now();
        this.sessions.set(sessionID, conversation);

        this.formatter.log({
          type: 'agent',
          details: `session: ${sessionID}`,
          message: answer,
        });

        return answer;
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

      conversation.input = [...conversation.input, ...toolResultMessages];
      conversation.updatedAt = Date.now();
      this.sessions.set(sessionID, conversation);
    }

    throw new Error(
      `Tool calling did not finish within ${MAX_TOOL_STEPS} steps.`,
    );
  }

  private getOrCreateConversation(sessionID: string): SessionConversation {
    const existing = this.sessions.get(sessionID);

    if (existing) {
      return existing;
    }

    const created: SessionConversation = {
      input: [{ role: 'system', content: AGENT_SYSTEM_PROMPT }],
      updatedAt: Date.now(),
    };

    this.sessions.set(sessionID, created);
    return created;
  }

  private async executeTool(
    toolName: string,
    args: Record<string, unknown>,
  ): Promise<unknown> {
    const handler = (handlers as ToolHandlersMap)[toolName];

    if (!handler) {
      throw new Error(`Unknown tool requested by model: ${toolName}`);
    }

    return Object.keys(args).length === 0 ? handler() : handler(args);
  }
}
