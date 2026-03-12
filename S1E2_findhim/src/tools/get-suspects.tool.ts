import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ConsoleMessageFormatterService } from "../logger/console-message-formatter.service";

interface Suspect {
  name: string;
  surname: string;
  gender: string;
  born: number;
  city: string;
  tags: string[];
}

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

const SUSPECTS_FILE_PATH = resolve(process.cwd(), "..", "suspects.json");
const TOOL_NAME = "get_suspects";
const formatter = new ConsoleMessageFormatterService();

export const tools: ToolDefinition[] = [
  {
    type: "function",
    name: "get_suspects",
    description: "Get suspect list from local suspects.json file.",
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
  get_suspects(): Suspect[] {
    formatter.log({
      type: "tool",
      details: TOOL_NAME,
      message: "Input: {}",
    });

    try {
      const fileContent = readFileSync(SUSPECTS_FILE_PATH, "utf8");
      const result = JSON.parse(fileContent) as Suspect[];

      formatter.log({
        type: "tool",
        details: TOOL_NAME,
        message: `Output: ${JSON.stringify(result)}`,
      });

      return result;
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
