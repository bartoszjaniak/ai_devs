import { Module } from '@nestjs/common';
import { OpenRouterModule } from '../openrouter/openrouter.module';
import { AgentService } from './agent.service';

@Module({
  imports: [OpenRouterModule],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
