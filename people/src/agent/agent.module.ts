import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { OpenRouterModule } from '../openrouter/openrouter.module';
import { SummarisePersonSkill } from '../skills/summarise-person.skill';

@Module({
  imports: [OpenRouterModule],
  controllers: [AgentController],
  providers: [AgentService, SummarisePersonSkill],
})
export class AgentModule {}
