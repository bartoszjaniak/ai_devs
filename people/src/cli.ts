import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AgentService } from './agent/agent.service';

async function main() {
  const args = process.argv.slice(2);

  const personIndex = args.indexOf('--person');
  const questionIndex = args.indexOf('--question');

  const person =
    personIndex !== -1 && args[personIndex + 1]
      ? args[personIndex + 1]
      : 'Unknown';
  const question =
    questionIndex !== -1 && args[questionIndex + 1]
      ? args[questionIndex + 1]
      : 'Tell me about this person.';

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  const agentService = app.get(AgentService);
  const answer = await agentService.run(person, question);

  console.log(answer);

  await app.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
