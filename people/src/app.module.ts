import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'path';
import { PeopleTaskModule } from './people-task/people-task.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        resolve(process.cwd(), '.env'),
        resolve(process.cwd(), '..', '.env'),
      ],
    }),
    PeopleTaskModule,
  ],
})
export class AppModule {}
