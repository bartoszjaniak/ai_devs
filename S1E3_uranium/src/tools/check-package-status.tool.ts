import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ResponseToolDefinition } from '../openrouter/openrouter.types';
import { ConsoleMessageFormatterService } from '../../../shared/logger/console-message-formatter.service';

type ToolHandler = (...args: unknown[]) => unknown | Promise<unknown>;

interface CheckPackageStatusArgs {
  packageid: string;
}

interface PackagesApiResponse {
  [key: string]: unknown;
}

const formatter = new ConsoleMessageFormatterService();

export const tools: ResponseToolDefinition[] = [
  {
    type: 'function',
    name: 'check_package_status',
    description: 'Sprawdza status i lokalizacje paczki lub przesyłki po packageid.',
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
    try {
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

      const summary = `Sprawdzono status paczki ${args.packageid}`;

      formatter.log({
        type: 'tool',
        details: 'check_package_status',
        message: summary,
      });

      return {
        ...response.data,
        summary,
        hint: 'Udało się znaleźć informacje o paczce. Możesz przekazać te dane rozmówcy lub zapytać o więcej szczegółów.',
      };
    } catch (error) {
      const message = extractErrorMessage(error);
      const hint = buildHint(message);

      formatter.log({
        type: 'tool',
        details: 'check_package_status',
        message: `Blad check: ${message} | hint: ${hint}`,
      });

      return {
        error: true,
        message,
        hint,
        summary: `Sprawdzenie statusu nieudane: ${message}`,
      };
    }
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

function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (
      error.response?.data &&
      typeof error.response.data === 'object' &&
      'message' in (error.response.data as object)
    ) {
      return String((error.response.data as Record<string, unknown>).message);
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'unknown error';
}

function buildHint(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes('package')) {
    return 'Sprawdz czy packageid istnieje i ma poprawny format.';
  }

  if (normalized.includes('apikey') || normalized.includes('api key')) {
    return 'Sprawdz konfiguracje COURSE_API_KEY.';
  }

  if (normalized.includes('timeout') || normalized.includes('network')) {
    return 'Sprobuj ponownie za chwile, mogl wystapic problem sieciowy.';
  }

  return 'Dopytaj operatora o packageid, a potem sprobuj ponownie.';
}
