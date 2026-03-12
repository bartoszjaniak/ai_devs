import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AgentService } from './agent/agent.service';
import { ConsoleMessageFormatterService } from './logger/console-message-formatter.service';

function readQuestionFromArgs(): string {
  return process.argv.slice(2).join(' ').trim();
}

export async function main(): Promise<void> {
  const question = readQuestionFromArgs();

  if (!question) {
    console.error('Usage: npm run ask -- "Twoje pytanie"');
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const agentService = app.get(AgentService);
    const formatter = app.get(ConsoleMessageFormatterService);

    formatter.log({ type: 'user', message: question });
    const result = await agentService.ask(question);

    formatter.log({
      type: 'agent',
      message: JSON.stringify(result, null, 2),
    });
  } finally {
    await app.close();
  }
}

if (require.main === module) {
  void main().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
}
