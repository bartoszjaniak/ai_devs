import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PeopleTaskService } from './people-task/people-task.service';

async function main() {
  console.log('🚀 Starting people pipeline...');

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error', 'warn'],
  });

  const peopleTaskService = app.get(PeopleTaskService);
  const answer = await peopleTaskService.run();

  const result = answer as { totalSubmitted: number; verifyResponse: unknown };

  console.log('✅ Pipeline finished successfully');
  console.log(`📦 Submitted records: ${result.totalSubmitted}`);
  console.log('📨 Server response:');
  console.log(JSON.stringify(result.verifyResponse, null, 2));

  await app.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
