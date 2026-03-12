import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'path';
import { AgentModule } from './agent/agent.module';
import { ConsoleMessageFormatterService } from './logger/console-message-formatter.service';

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
  ],
  providers: [ConsoleMessageFormatterService],
})
export class AppModule {}
