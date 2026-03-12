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

interface PersonIdentity {
  name: string;
  surname: string;
}

const LOCATION_API_URL = "https://hub.ag3nts.org/api/location";
const TOOL_NAME = "get_person_locations";
const formatter = new ConsoleMessageFormatterService();

function getCourseApiKey(): string {
  const apiKey = process.env.COURSE_API_KEY;
  if (!apiKey) {
    throw new Error("COURSE_API_KEY is not set");
  }

  return apiKey;
}

function validateIdentity(args: Record<string, unknown>): PersonIdentity {
  const { name, surname } = args;

  if (typeof name !== "string" || !name.trim()) {
    throw new Error("Tool argument 'name' must be a non-empty string");
  }

  if (typeof surname !== "string" || !surname.trim()) {
    throw new Error("Tool argument 'surname' must be a non-empty string");
  }

  return {
    name: name.trim(),
    surname: surname.trim(),
  };
}

export const tools: ToolDefinition[] = [
  {
    type: "function",
    name: "get_person_locations",
    description:
      "Gets coordinates of locations where a specific person was seen, based on their name and surname.",
    parameters: {
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
    strict: true,
  },
];

export const handlers = {
  async get_person_locations(args: Record<string, unknown>): Promise<unknown> {
    formatter.log({
      type: "tool",
      details: TOOL_NAME,
      message: `Input: ${JSON.stringify(args)}`,
    });

    try {
      const identity = validateIdentity(args);
      const apiKey = getCourseApiKey();

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
