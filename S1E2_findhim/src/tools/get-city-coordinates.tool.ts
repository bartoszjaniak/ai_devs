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

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

function validateCityArg(args: Record<string, unknown>): string {
  const city = args.city;
  if (typeof city !== "string" || !city.trim()) {
    throw new Error("Tool argument 'city' must be a non-empty string");
  }

  return city.trim();
}

export const tools: ToolDefinition[] = [
  {
    type: "function",
    name: "get_city_coordinates",
    description:
      "Gets geographic coordinates (latitude and longitude) for a given city name.",
    parameters: {
      type: "object",
      properties: {
        city: {
          type: "string",
          description: "City name to geocode.",
        },
      },
      required: ["city"],
      additionalProperties: false,
    },
    strict: true,
  },
];

export const handlers = {
  async get_city_coordinates(args: Record<string, unknown>): Promise<unknown> {
    const city = validateCityArg(args);

    const response = await axios.get<NominatimResultItem[]>(NOMINATIM_URL, {
      params: {
        q: city,
        format: "json",
        limit: 1,
      },
      headers: {
        // Nominatim requires a descriptive User-Agent for API access.
        "User-Agent": "AI-Devs-S1E2-FindHim/1.0",
      },
    });

    const firstResult = response.data[0];
    if (!firstResult) {
      return {
        city,
        found: false,
      };
    }

    return {
      city,
      found: true,
      latitude: Number(firstResult.lat),
      longitude: Number(firstResult.lon),
      display_name: firstResult.display_name ?? city,
    };
  },
};
