import { Controller, Get, Query } from '@nestjs/common';
import { AgentService } from './agent.service';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  /**
   * GET /agent?person=<name>&question=<question>
   *
   * Example:
   *   curl "http://localhost:3000/agent?person=Alan+Turing&question=What+did+he+invent?"
   */
  @Get()
  async ask(
    @Query('person') person = 'Unknown',
    @Query('question') question = 'Tell me about this person.',
  ): Promise<{ person: string; question: string; answer: string }> {
    const answer = await this.agentService.run(person, question);
    return { person, question, answer };
  }
}
