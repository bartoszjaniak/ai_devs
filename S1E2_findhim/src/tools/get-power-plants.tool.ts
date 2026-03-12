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

const LOCATIONS_FILE_NAME = "findhim_locations.json";
const HUB_BASE_URL = "https://hub.ag3nts.org/data";

function getCourseApiKey(): string {
  const apiKey = process.env.COURSE_API_KEY;

  if (!apiKey) {
    throw new Error("COURSE_API_KEY is not set");
  }

  return apiKey;
}

function buildLocationsUrl(): string {
  const apiKey = getCourseApiKey();
  return `${HUB_BASE_URL}/${apiKey}/${LOCATIONS_FILE_NAME}`;
}

export const tools: ToolDefinition[] = [
  {
    type: "function",
    name: "get_power_plants",
    description:
      "Fetches a complete list of power plants and their geographic coordinates (latitude and longitude) from the AG3NTS course dataset.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
      additionalProperties: false,
    },
    strict: true,
  },
];

export const handlers = {
  async get_power_plants(): Promise<unknown> {
    const url = buildLocationsUrl();
    const response = await axios.get(url);
    return response.data;
  },
};
