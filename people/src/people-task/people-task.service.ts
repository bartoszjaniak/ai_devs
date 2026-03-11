import { Injectable, Logger } from '@nestjs/common';
import { TaggedPersonModel } from '../skills/models/tagged-person.model';
import { TagJobsSkill } from '../skills/tag-jobs.skill';
import { VerifyAnswerModel } from './models/verify-answer.model';
import { PeopleDataService } from './people-data.service';
import { VerifyService } from './verify.service';

@Injectable()
export class PeopleTaskService {
  private readonly logger = new Logger(PeopleTaskService.name);

  constructor(
    private readonly peopleDataService: PeopleDataService,
    private readonly tagJobsSkill: TagJobsSkill,
    private readonly verifyService: VerifyService,
  ) {}

  private extractBirthYear(birthDate: string): number {
    const normalized = birthDate?.trim() ?? '';

    const isoYear = normalized.match(/^(\d{4})[-/.]/);
    if (isoYear) {
      return Number(isoYear[1]);
    }

    const trailingYear = normalized.match(/(\d{4})$/);
    if (trailingYear) {
      return Number(trailingYear[1]);
    }

    return 0;
  }

  private mapToVerifyAnswer(people: TaggedPersonModel[]): VerifyAnswerModel[] {
    return people.map((person) => ({
      name: person.name,
      surname: person.surname,
      gender: person.gender,
      born: this.extractBirthYear(person.birthDate),
      city: person.birthPlace,
      tags: person.tags,
    }));
  }

  async run(): Promise<unknown> {
    this.logger.log('🛠️ Running people task pipeline');

    const prefilteredPeople = this.peopleDataService.getPrefilteredPeople();
    this.logger.log(`🔎 Prefiltered people count: ${prefilteredPeople.length}`);

    const taggedTransportPeople = await this.tagJobsSkill.execute(prefilteredPeople);
    this.logger.log(
      `🚚 Classified transport people count: ${taggedTransportPeople.length}`,
    );

    const answer = this.mapToVerifyAnswer(taggedTransportPeople);
    const verifyResponse = await this.verifyService.submitPeopleAnswer(answer);

    this.logger.log('🎉 People task completed');

    return {
      totalSubmitted: answer.length,
      verifyResponse,
    };
  }
}
