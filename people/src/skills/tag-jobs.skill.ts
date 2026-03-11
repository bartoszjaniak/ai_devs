import { Injectable, Logger } from '@nestjs/common';
import { PersonModel } from '../functions';
import { OpenRouterService } from '../openrouter/openrouter.service';
import { ChatMessage } from '../openrouter/openrouter.types';
import { TaggedPersonModel } from './models/tagged-person.model';

const CHUNK_SIZE = 20;

export const AVAILABLE_TAGS = [
  'transport',
  'it',
  'education',
  'healthcare',
  'finance',
  'manufacturing',
  'construction',
  'administration',
  'services',
  'other',
] as const;

interface TagJobsResponse {
  records: TaggedPersonModel[];
}

@Injectable()
export class TagJobsSkill {
  private readonly logger = new Logger(TagJobsSkill.name);

  constructor(private readonly openRouter: OpenRouterService) {}

  private buildSchema(): Record<string, unknown> {
    return {
      type: 'object',
      additionalProperties: false,
      required: ['records'],
      properties: {
        records: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: [
              'name',
              'surname',
              'gender',
              'birthDate',
              'birthPlace',
              'birthCountry',
              'job',
              'tags',
            ],
            properties: {
              name: { type: 'string' },
              surname: { type: 'string' },
              gender: { type: 'string' },
              birthDate: { type: 'string' },
              birthPlace: { type: 'string' },
              birthCountry: { type: 'string' },
              job: { type: 'string' },
              tags: {
                type: 'array',
                minItems: 1,
                items: { type: 'string', enum: [...AVAILABLE_TAGS] },
              },
            },
          },
        },
      },
    };
  }

  private buildMessages(people: PersonModel[]): ChatMessage[] {
    return [
      {
        role: 'system',
        content:
          'You are a strict job-tagging classifier. Return only valid JSON matching the schema.',
      },
      {
        role: 'user',
        content: `Based on each job description, assign a list of tags to every returned object.

Available tags: ${AVAILABLE_TAGS.join(', ')}.

Rules:
- Evaluate each available tag separately and add it only if confidence is at least 80%.
- A record may have multiple tags.
- Keep all original fields unchanged.
- Return only records that include the "transport" tag.
- Return JSON only, valid against the provided schema.

Input records:
${JSON.stringify(people)}`,
      },
    ];
  }

  async execute(people: PersonModel[]): Promise<TaggedPersonModel[]> {
    if (people.length === 0) {
      return [];
    }

    const schema = this.buildSchema();
    const transportOnlyRecords: TaggedPersonModel[] = [];
    const totalChunks = Math.ceil(people.length / CHUNK_SIZE);

    for (
      let index = 0, chunkIndex = 1;
      index < people.length;
      index += CHUNK_SIZE, chunkIndex++
    ) {
      const chunk = people.slice(index, index + CHUNK_SIZE);
      this.logger.log(
        `🤖 Classifying chunk ${chunkIndex}/${totalChunks} (${chunk.length} records)`,
      );

      const messages = this.buildMessages(chunk);

      const result = await this.openRouter.chatStructured<TagJobsResponse>(
        messages,
        'people_job_tags_transport_only',
        schema,
      );

      transportOnlyRecords.push(
        ...result.records.filter((record) => record.tags.includes('transport')),
      );

      this.logger.log(
        `✅ Chunk ${chunkIndex}/${totalChunks} done. Current transport matches: ${transportOnlyRecords.length}`,
      );
    }

    this.logger.log(
      `🏁 Classification finished. Total transport matches: ${transportOnlyRecords.length}`,
    );

    return transportOnlyRecords;
  }
}
