import { Test, TestingModule } from '@nestjs/testing';
import { AgentService } from './agent.service';
import { FilterPeopleSkill } from '../skills/filter-people.skill';
import { TagJobsSkill } from '../skills/tag-jobs.skill';
import { SelectTransportSkill } from '../skills/select-transport.skill';

describe('AgentService', () => {
  let service: AgentService;
  let filterPeopleSkill: { execute: jest.Mock };
  let tagJobsSkill: { execute: jest.Mock };
  let selectTransportSkill: { execute: jest.Mock };

  const filteredPeople = [
    {
      name: 'Jan',
      surname: 'Kowalski',
      gender: 'M',
      birthDate: '1995-01-01',
      birthPlace: 'Grudziądz',
      birthCountry: 'Polska',
      job: 'Prowadzi ciężarówki i planuje trasy logistyczne.',
    },
  ];

  const taggedPeople = [
    {
      ...filteredPeople[0],
      tags: ['transport'],
    },
  ];

  beforeEach(async () => {
    filterPeopleSkill = { execute: jest.fn().mockResolvedValue(filteredPeople) };
    tagJobsSkill = { execute: jest.fn().mockResolvedValue(taggedPeople) };
    selectTransportSkill = { execute: jest.fn().mockReturnValue(taggedPeople) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentService,
        { provide: FilterPeopleSkill, useValue: filterPeopleSkill },
        { provide: TagJobsSkill, useValue: tagJobsSkill },
        { provide: SelectTransportSkill, useValue: selectTransportSkill },
      ],
    }).compile();

    service = module.get<AgentService>(AgentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should execute skills pipeline and return JSON with transport people', async () => {
    const answer = await service.run('Ada Lovelace', 'Who was she?');
    const parsed = JSON.parse(answer) as {
      totalMatches: number;
      people: Array<{ tags: string[] }>;
    };

    expect(filterPeopleSkill.execute).toHaveBeenCalledTimes(1);
    expect(tagJobsSkill.execute).toHaveBeenCalledWith(filteredPeople);
    expect(selectTransportSkill.execute).toHaveBeenCalledWith(taggedPeople);
    expect(parsed.totalMatches).toBe(1);
    expect(parsed.people[0].tags).toContain('transport');
  });
});
