import { Injectable, Logger } from '@nestjs/common';
import { FilterPeopleSkill } from '../skills/filter-people.skill';
import { TagJobsSkill } from '../skills/tag-jobs.skill';
import { SelectTransportSkill } from '../skills/select-transport.skill';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(
    private readonly filterPeopleSkill: FilterPeopleSkill,
    private readonly tagJobsSkill: TagJobsSkill,
    private readonly selectTransportSkill: SelectTransportSkill,
  ) {}

  /**
   * Run the people-task pipeline:
   * 1. Fetch and filter people by fixed criteria.
   * 2. Tag jobs via LLM with structured output JSON schema.
   * 3. Select people tagged with "transport".
   * 4. Return JSON payload with matching records.
   */
  async run(_personName: string, _userQuestion: string): Promise<string> {
    this.logger.log('People task pipeline started');

    const filteredPeople = await this.filterPeopleSkill.execute();
    this.logger.log(`Filtered people count: ${filteredPeople.length}`);

    const taggedPeople = await this.tagJobsSkill.execute(filteredPeople);
    this.logger.log(`Tagged people count: ${taggedPeople.length}`);

    const transportPeople = this.selectTransportSkill.execute(taggedPeople);
    this.logger.log(`Transport people count: ${transportPeople.length}`);

    return JSON.stringify(
      {
        criteria: {
          gender: 'male',
          birthPlace: 'Grudziądz',
          ageRange: [20, 40],
          referenceYear: 2026,
          requiredTag: 'transport',
        },
        totalMatches: transportPeople.length,
        people: transportPeople,
      },
      null,
      2,
    );
  }
}
