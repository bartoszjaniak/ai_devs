import axios from "axios";
import { ConsoleMessageFormatterService } from "../logger/console-message-formatter.service";

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
const TOOL_NAME = "get_power_plants";
const formatter = new ConsoleMessageFormatterService();

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
      "Fetches a list of power plants with metadata from the AG3NTS course dataset, including active status, power output, and plant code.",
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
    formatter.log({
      type: "tool",
      details: TOOL_NAME,
      message: "Input: {}",
    });

    try {
      const url = buildLocationsUrl();
      const response = await axios.get(url);

      formatter.log({
        type: "tool",
        details: TOOL_NAME,
        message: `Output: ${JSON.stringify(response.data)}`,
      });

      return response.data;
    } catch (error: unknown) {
      formatter.log({
        type: "tool",
        details: TOOL_NAME,
        message: `Error: ${error instanceof Error ? error.message : String(error)}`,
      });
      throw error;
    }
  },
};
