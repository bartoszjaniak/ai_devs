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

interface AccessLevelInput {
  name: string;
  surname: string;
  birthYear: number;
}

const ACCESS_LEVEL_API_URL = "https://hub.ag3nts.org/api/accesslevel";
const TOOL_NAME = "get_access_level";
const formatter = new ConsoleMessageFormatterService();

function getCourseApiKey(): string {
  const apiKey = process.env.COURSE_API_KEY;
  if (!apiKey) {
    throw new Error("COURSE_API_KEY is not set");
  }

  return apiKey;
}

function parseInput(args: Record<string, unknown>): AccessLevelInput {
  const { name, surname, birthYear } = args;

  if (typeof name !== "string" || !name.trim()) {
    throw new Error("Tool argument 'name' must be a non-empty string");
  }

  if (typeof surname !== "string" || !surname.trim()) {
    throw new Error("Tool argument 'surname' must be a non-empty string");
  }

  if (typeof birthYear !== "number" || Number.isNaN(birthYear)) {
    throw new Error("Tool argument 'birthYear' must be a valid number");
  }

  return {
    name: name.trim(),
    surname: surname.trim(),
    birthYear,
  };
}

export const tools: ToolDefinition[] = [
  {
    type: "function",
    name: "get_access_level",
    description:
      "Gets the access level number for a specific person based on their name, surname, and birth year.",
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
        birthYear: {
          type: "number",
          description: "Person birth year.",
        },
      },
      required: ["name", "surname", "birthYear"],
      additionalProperties: false,
    },
    strict: true,
  },
];

export const handlers = {
  async get_access_level(args: Record<string, unknown>): Promise<unknown> {
    formatter.log({
      type: "tool",
      details: TOOL_NAME,
      message: `Input: ${JSON.stringify(args)}`,
    });

    try {
      const input = parseInput(args);
      const apiKey = getCourseApiKey();

      const response = await axios.post(
        ACCESS_LEVEL_API_URL,
        {
          apikey: apiKey,
          name: input.name,
          surname: input.surname,
          birthYear: input.birthYear,
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
