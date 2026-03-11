import { Injectable } from '@nestjs/common';
import {
  filterMenAge20To40BornInGrudziadz,
  fetchPeopleData,
  PersonModel,
} from '../functions';
import { Skill } from './skill.interface';

export interface PeopleFilterCriteria {
  gender: 'male';
  birthPlace: string;
  minAge: number;
  maxAge: number;
  referenceYear: number;
}

@Injectable()
export class FilterPeopleSkill
  implements Skill<PeopleFilterCriteria | undefined, PersonModel[]>
{
  readonly name = 'filter_people';
  readonly description = `# Filter People Skill

## Purpose
Fetches people data from the hub and keeps only records matching required criteria.

## Criteria
- gender: male
- birthPlace: Grudziądz
- age: 20-40 (computed in a selected reference year)

## Output
Returns an array of filtered records in the original PersonModel shape.`;

  async execute(
    criteria: PeopleFilterCriteria = {
      gender: 'male',
      birthPlace: 'Grudziądz',
      minAge: 20,
      maxAge: 40,
      referenceYear: 2026,
    },
  ): Promise<PersonModel[]> {
    if (
      criteria.gender !== 'male' ||
      criteria.birthPlace !== 'Grudziądz' ||
      criteria.minAge !== 20 ||
      criteria.maxAge !== 40
    ) {
      throw new Error(
        'This skill currently supports only: male, Grudziądz, age 20-40.',
      );
    }

    const people = await fetchPeopleData();
    return filterMenAge20To40BornInGrudziadz(people, criteria.referenceYear);
  }
}
