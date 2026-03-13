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

interface PersonIdentity {
  name: string;
  surname: string;
}

interface PersonLocationsResult {
  name: string;
  surname: string;
  locations: Array<{ lat: number; lon: number }>;
  locationCount: number;
}

const LOCATION_API_URL = "https://hub.ag3nts.org/api/location";

function getCourseApiKey(): string {
  const apiKey = process.env.COURSE_API_KEY;
  if (!apiKey) {
    throw new Error("COURSE_API_KEY is not set");
  }

  return apiKey;
}

function validateQueries(args: Record<string, unknown>): {
  queries: PersonIdentity[];
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

    if (typeof name !== "string" || !name.trim()) {
      throw new Error(`Tool argument 'queries[${index}].name' must be a non-empty string`);
    }

    if (typeof surname !== "string" || !surname.trim()) {
      throw new Error(`Tool argument 'queries[${index}].surname' must be a non-empty string`);
    }

    return {
      name: name.trim(),
      surname: surname.trim(),
    };
  });

  return {
    queries,
    context: context.trim(),
  };
}

function normalizeLocations(data: unknown): Array<{ lat: number; lon: number }> {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.flatMap((item) => {
    if (typeof item !== "object" || item === null) {
      return [];
    }

    const point = item as Record<string, unknown>;
    const latitude = point.latitude;
    const longitude = point.longitude;
    const lat = point.lat;
    const lon = point.lon;

    if (typeof latitude === "number" && typeof longitude === "number") {
      return [{ lat: latitude, lon: longitude }];
    }

    if (typeof lat === "number" && typeof lon === "number") {
      return [{ lat, lon }];
    }

    return [];
  });
}

export const tools: ToolDefinition[] = [
  {
    type: "function",
    name: "get_person_locations",
    description:
      "Gets observed locations for one or more people in a single call. Prefer passing the full suspect list in queries so the model can compare all candidates without repeated requests.",
    parameters: {
      type: "object",
      properties: {
        queries: {
          type: "array",
          description:
            "List of people whose locations should be fetched. Prefer batching all suspects into one request.",
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
            },
            required: ["name", "surname"],
            additionalProperties: false,
          },
          minItems: 1,
        },
        context: {
          type: "string",
          description:
            "Human-readable context describing why locations are being fetched, e.g. 'wszyscy podejrzani w zadaniu findhim'.",
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
  async get_person_locations(args: Record<string, unknown>): Promise<{
    results: PersonLocationsResult[];
    context: string;
    summary: string;
  }> {
    const { queries, context } = validateQueries(args);
    const apiKey = getCourseApiKey();

    const results = await Promise.all(
      queries.map(async (identity) => {
        const response = await axios.post(
          LOCATION_API_URL,
          {
            apikey: apiKey,
            name: identity.name,
            surname: identity.surname,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        const locations = normalizeLocations(response.data);

        return {
          name: identity.name,
          surname: identity.surname,
          locations,
          locationCount: locations.length,
        };
      }),
    );

    return {
      results,
      context,
      summary: `Pobrano lokalizacje dla ${results.length} osób w jednym wywołaniu.`,
    };
  },
};
