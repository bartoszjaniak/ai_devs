import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ResponseToolDefinition } from '../openrouter/openrouter.types';

type ToolHandler = (...args: unknown[]) => unknown | Promise<unknown>;

interface CheckPackageStatusArgs {
  packageid: string;
}

interface PackagesApiResponse {
  [key: string]: unknown;
}

export const tools: ResponseToolDefinition[] = [
  {
    type: 'function',
    name: 'check_package_status',
    description: 'Sprawdza status i lokalizacje paczki po packageid.',
    strict: true,
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        packageid: {
          type: 'string',
          description: 'Id paczki, np. PKG12345678',
        },
      },
      required: ['packageid'],
    },
  },
];

export const handlers: Record<string, ToolHandler> = {
  check_package_status: async (rawArgs: unknown): Promise<unknown> => {
    const args = parseArgs(rawArgs);
    const configService = new ConfigService();
    const apiKey = configService.get<string>('COURSE_API_KEY');

    if (!apiKey) {
      throw new Error('COURSE_API_KEY is not set');
    }

    const response = await axios.post<PackagesApiResponse>(
      'https://hub.ag3nts.org/api/packages',
      {
        apikey: apiKey,
        action: 'check',
        packageid: args.packageid,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    return {
      ...response.data,
      summary: `Sprawdzono status paczki ${args.packageid}`,
    };
  },
};

function parseArgs(rawArgs: unknown): CheckPackageStatusArgs {
  if (!rawArgs || typeof rawArgs !== 'object') {
    throw new Error('check_package_status: expected object arguments');
  }

  const packageid = (rawArgs as Record<string, unknown>).packageid;

  if (typeof packageid !== 'string' || packageid.trim().length === 0) {
    throw new Error('check_package_status: packageid must be a non-empty string');
  }

  return {
    packageid: packageid.trim(),
  };
}
