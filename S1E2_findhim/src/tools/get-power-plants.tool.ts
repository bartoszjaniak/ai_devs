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

interface RawPowerPlantRecord {
  is_active: boolean;
  power: string;
  code: string;
}

interface NormalizedPowerPlant {
  city: string;
  code: string;
  isActive: boolean;
  power: string;
}

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
      "Fetches the full power plant dataset and returns a normalized array of plants with city, plant code, active flag, and power. Call this once and use the result for batched coordinate and distance calculations.",
    parameters: {
      type: "object",
      properties: {
        confidence: {
          type: "number",
          description: "Agent's confidence (0.0–1.0) that this tool should be used for the current task.",
        },
      },
      required: ["confidence"],
      additionalProperties: false,
    },
    strict: true,
  },
];

export const handlers = {
  async get_power_plants(): Promise<{
    powerPlants: NormalizedPowerPlant[];
    count: number;
    summary: string;
  }> {
    const url = buildLocationsUrl();
    const response = await axios.get<{ power_plants?: Record<string, RawPowerPlantRecord> }>(url);
    const rawPlants = response.data.power_plants ?? {};
    const powerPlants = Object.entries(rawPlants).map(([city, plant]) => ({
      city,
      code: plant.code,
      isActive: plant.is_active,
      power: plant.power,
    }));

    return {
      powerPlants,
      count: powerPlants.length,
      summary: `Pobrano ${powerPlants.length} elektrowni z kodami i miastami do dalszego batchowego przetwarzania.`,
    };
  },
};
