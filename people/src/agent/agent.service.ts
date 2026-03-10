import { Injectable, Logger } from '@nestjs/common';
import { OpenRouterService } from '../openrouter/openrouter.service';
import { SummarisePersonSkill } from '../skills/summarise-person.skill';
import { peopleAgentSystemPrompt } from '../prompts/people-agent.prompt';
import { ChatMessage } from '../openrouter/openrouter.types';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(
    private readonly openRouter: OpenRouterService,
    private readonly summarisePersonSkill: SummarisePersonSkill,
  ) {}

  /**
   * Run a single-turn agent:
   * 1. Execute the summarise_person skill to gather context.
   * 2. Send the system prompt + skill result + user question to the LLM.
   * 3. Return the model's response.
   */
  async run(personName: string, userQuestion: string): Promise<string> {
    this.logger.log(`Agent started for person: "${personName}"`);

    // Step 1 – use skill to gather additional context
    const skillResult = await this.summarisePersonSkill.execute(personName);
    this.logger.debug(`Skill result: ${skillResult}`);

    // Step 2 – build messages and call the LLM
    const messages: ChatMessage[] = [
      { role: 'system', content: peopleAgentSystemPrompt },
      {
        role: 'user',
        content: `Additional context from tool:\n${skillResult}\n\nQuestion: ${userQuestion}`,
      },
    ];

    const answer = await this.openRouter.chat(messages);
    this.logger.log(`Agent finished. Answer length: ${answer.length}`);
    return answer;
  }
}
