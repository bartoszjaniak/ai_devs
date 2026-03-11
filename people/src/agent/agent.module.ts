import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { OpenRouterModule } from '../openrouter/openrouter.module';
import { SummarisePersonSkill } from '../skills/summarise-person.skill';
import { FilterPeopleSkill } from '../skills/filter-people.skill';
import { TagJobsSkill } from '../skills/tag-jobs.skill';
import { SelectTransportSkill } from '../skills/select-transport.skill';

@Module({
  imports: [OpenRouterModule],
  providers: [
    AgentService,
    SummarisePersonSkill,
    FilterPeopleSkill,
    TagJobsSkill,
    SelectTransportSkill,
  ],
})
export class AgentModule {}
