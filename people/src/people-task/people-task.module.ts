import { Module } from '@nestjs/common';
import { OpenRouterModule } from '../openrouter/openrouter.module';
import { TagJobsSkill } from '../skills/tag-jobs.skill';
import { PeopleDataService } from './people-data.service';
import { PeopleTaskService } from './people-task.service';
import { VerifyService } from './verify.service';

@Module({
  imports: [OpenRouterModule],
  providers: [PeopleDataService, TagJobsSkill, VerifyService, PeopleTaskService],
  exports: [PeopleTaskService],
})
export class PeopleTaskModule {}
