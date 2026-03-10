import { Injectable } from '@nestjs/common';
import { Skill } from './skill.interface';

/**
 * Skill: Summarise Person
 *
 * Given a person's name, returns a short summary description.
 * In a real scenario this could call an external API or database.
 * Here we return a placeholder so the wiring can be verified locally without
 * any external dependencies beyond OpenRouter.
 */
@Injectable()
export class SummarisePersonSkill implements Skill {
  readonly name = 'summarise_person';
  readonly description =
    'Returns a short summary about a person given their name.';

  async execute(personName: string): Promise<string> {
    // Placeholder – replace with a real data source (e.g. Wikipedia API, DB)
    return `[Skill result] No additional data found for "${personName}". Please rely on the model's knowledge.`;
  }
}
