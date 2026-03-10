import { Test, TestingModule } from '@nestjs/testing';
import { AgentService } from './agent.service';
import { OpenRouterService } from '../openrouter/openrouter.service';
import { SummarisePersonSkill } from '../skills/summarise-person.skill';

describe('AgentService', () => {
  let service: AgentService;
  let openRouterService: { chat: jest.Mock };
  let summarisePersonSkill: { execute: jest.Mock };

  beforeEach(async () => {
    openRouterService = { chat: jest.fn().mockResolvedValue('Mocked answer') };
    summarisePersonSkill = {
      execute: jest
        .fn()
        .mockResolvedValue('[Skill result] No additional data found for "Ada Lovelace"'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentService,
        { provide: OpenRouterService, useValue: openRouterService },
        { provide: SummarisePersonSkill, useValue: summarisePersonSkill },
      ],
    }).compile();

    service = module.get<AgentService>(AgentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call the skill and openrouter, then return the answer', async () => {
    const answer = await service.run('Ada Lovelace', 'Who was she?');

    expect(summarisePersonSkill.execute).toHaveBeenCalledWith('Ada Lovelace');
    expect(openRouterService.chat).toHaveBeenCalledTimes(1);
    // The messages passed to chat should contain a system message and a user message
    const [messages] = openRouterService.chat.mock.calls[0] as [
      Array<{ role: string; content: string }>,
    ];
    expect(messages[0].role).toBe('system');
    expect(messages[1].role).toBe('user');
    expect(messages[1].content).toContain('Who was she?');
    expect(answer).toBe('Mocked answer');
  });
});
