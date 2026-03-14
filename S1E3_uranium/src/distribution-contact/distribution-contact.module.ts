import { Module } from '@nestjs/common';
import { AgentModule } from '../agent/agent.module';
import { DistributionContactController } from './distribution-contact.controller';

@Module({
  imports: [AgentModule],
  controllers: [DistributionContactController],
})
export class DistributionContactModule {}
