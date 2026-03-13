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

interface NominatimResultItem {
  lat: string;
  lon: string;
  display_name?: string;
}

interface CityCoordinateQuery {
  city: string;
  label: string;
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

function validateInputArgs(args: Record<string, unknown>): {
  queries: CityCoordinateQuery[];
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
    const city = query.city;
    const label = query.label;

    if (typeof city !== "string" || !city.trim()) {
      throw new Error(`Tool argument 'queries[${index}].city' must be a non-empty string`);
    }

    if (typeof label !== "string" || !label.trim()) {
      throw new Error(`Tool argument 'queries[${index}].label' must be a non-empty string`);
    }

    return {
      city: city.trim(),
      label: label.trim(),
    };
  });

  return { queries, context: context.trim() };
}

export const tools: ToolDefinition[] = [
  {
    type: "function",
    name: "get_city_coordinates",
    description:
      "Gets geographic coordinates for one or more cities in a single call. Prefer batching all plant cities at once and use label to preserve the plant code or other identifier.",
    parameters: {
      type: "object",
      properties: {
        queries: {
          type: "array",
          description:
            "List of geocoding queries. Prefer batching all power-plant cities into one request.",
          items: {
            type: "object",
            properties: {
              city: {
                type: "string",
                description: "City name to geocode.",
              },
              label: {
                type: "string",
                description:
                  "Identifier that should travel with the result, e.g. 'Grudziądz | PWR7264PL'.",
              },
            },
            required: ["city", "label"],
            additionalProperties: false,
          },
          minItems: 1,
        },
        context: {
          type: "string",
          description:
            "Human-readable context describing what the geocoding batch is for, e.g. 'miasta elektrowni do zadania findhim'.",
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
  async get_city_coordinates(args: Record<string, unknown>): Promise<{
    results: Array<{
      city: string;
      label: string;
      found: boolean;
      lat?: number;
      lon?: number;
      displayName?: string;
    }>;
    context: string;
    summary: string;
  }> {
    const { queries, context } = validateInputArgs(args);

    const results = await Promise.all(
      queries.map(async ({ city, label }) => {
        const response = await axios.get<NominatimResultItem[]>(NOMINATIM_URL, {
          params: {
            q: city,
            format: "json",
            limit: 1,
          },
          headers: {
            "User-Agent": "AI-Devs-S1E2-FindHim/1.0",
          },
        });

        const firstResult = response.data[0];
        if (!firstResult) {
          return {
            city,
            label,
            found: false,
          };
        }

        return {
          city,
          label,
          found: true,
          lat: Number(firstResult.lat),
          lon: Number(firstResult.lon),
          displayName: firstResult.display_name ?? city,
        };
      }),
    );

    return {
      results,
      context,
      summary: `Pobrano współrzędne dla ${results.length} miast w jednym wywołaniu.`,
    };
  },
};
