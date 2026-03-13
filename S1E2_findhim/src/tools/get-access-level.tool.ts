import axios from "axios";

type ToolDefinition = {
  type: "function";
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, unknown>;
    required: string[];
    additionalProperties: boolean;
  };
  strict: boolean;
};

interface AccessLevelInput {
  name: string;
  surname: string;
  birthYear: number;
}

interface AccessLevelResult {
  name: string;
  surname: string;
  birthYear: number;
  accessLevel: number | null;
}

const ACCESS_LEVEL_API_URL = "https://hub.ag3nts.org/api/accesslevel";

function getCourseApiKey(): string {
  const apiKey = process.env.COURSE_API_KEY;
  if (!apiKey) {
    throw new Error("COURSE_API_KEY is not set");
  }

  return apiKey;
}

function parseInput(args: Record<string, unknown>): {
  queries: AccessLevelInput[];
  context: string;
} {
  const rawQueries = args.queries;
  const context = args.context;

  if (!Array.isArray(rawQueries) || rawQueries.length === 0) {
    throw new Error("Tool argument 'queries' must be a non-empty array");
  }

  if (typeof context !== "string" || !context.trim()) {
    throw new Error("Tool argument 'context' must be a non-empty string");
  }

  const queries = rawQueries.map((item, index) => {
    if (typeof item !== "object" || item === null) {
      throw new Error(`Tool argument 'queries[${index}]' must be an object`);
    }

    const query = item as Record<string, unknown>;
    const name = query.name;
    const surname = query.surname;
    const birthYear = query.birthYear;

    if (typeof name !== "string" || !name.trim()) {
      throw new Error(`Tool argument 'queries[${index}].name' must be a non-empty string`);
    }

    if (typeof surname !== "string" || !surname.trim()) {
      throw new Error(`Tool argument 'queries[${index}].surname' must be a non-empty string`);
    }

    if (typeof birthYear !== "number" || Number.isNaN(birthYear)) {
      throw new Error(`Tool argument 'queries[${index}].birthYear' must be a valid number`);
    }

    return {
      name: name.trim(),
      surname: surname.trim(),
      birthYear,
    };
  });

  return {
    queries,
    context: context.trim(),
  };
}

function extractAccessLevel(data: unknown): number | null {
  if (typeof data === "number" && !Number.isNaN(data)) {
    return data;
  }

  if (typeof data !== "object" || data === null) {
    return null;
  }

  const record = data as Record<string, unknown>;
  const candidates = [record.accessLevel, record.access_level, record.level];
  for (const candidate of candidates) {
    if (typeof candidate === "number" && !Number.isNaN(candidate)) {
      return candidate;
    }
  }

  return null;
}

export const tools: ToolDefinition[] = [
  {
    type: "function",
    name: "get_access_level",
    description:
      "Gets access levels for one or more people. In findhim, call this sequentially for one ranked candidate at a time (starting from the nearest), and move to the next candidate only if accessLevel equals 1.",
    parameters: {
      type: "object",
      properties: {
        queries: {
          type: "array",
          description:
            "List of people whose access level should be fetched. For findhim prefer a single-item list so ranking by distance is preserved.",
          items: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "Person first name.",
              },
              surname: {
                type: "string",
                description: "Person surname.",
              },
              birthYear: {
                type: "number",
                description: "Person birth year as an integer.",
              },
            },
            required: ["name", "surname", "birthYear"],
            additionalProperties: false,
          },
          minItems: 1,
        },
        context: {
          type: "string",
          description:
            "Human-readable context describing why access levels are being checked, e.g. 'ranking kandydatów w zadaniu findhim'.",
        },
        confidence: {
          type: "number",
          description: "Agent's confidence (0.0–1.0) that this tool should be used for the current task.",
        },
      },
      required: ["queries", "context", "confidence"],
      additionalProperties: false,
    },
    strict: true,
  },
];

export const handlers = {
  async get_access_level(args: Record<string, unknown>): Promise<{
    results: AccessLevelResult[];
    context: string;
    summary: string;
  }> {
    const input = parseInput(args);
    const apiKey = getCourseApiKey();

    const results = await Promise.all(
      input.queries.map(async (query) => {
        const response = await axios.post(
          ACCESS_LEVEL_API_URL,
          {
            apikey: apiKey,
            name: query.name,
            surname: query.surname,
            birthYear: query.birthYear,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        return {
          name: query.name,
          surname: query.surname,
          birthYear: query.birthYear,
          accessLevel: extractAccessLevel(response.data),
        };
      }),
    );

    return {
      results,
      context: input.context,
      summary: `Pobrano poziomy dostępu dla ${results.length} osób w jednym wywołaniu.`,
    };
  },
};
