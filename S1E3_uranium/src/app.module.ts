import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'node:path';
import { AgentModule } from './agent/agent.module';
import { DistributionContactModule } from './distribution-contact/distribution-contact.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        resolve(process.cwd(), '.env'),
        resolve(process.cwd(), '..', '.env'),
      ],
    }),
    AgentModule,
    DistributionContactModule,
  ],
})
export class AppModule {}
