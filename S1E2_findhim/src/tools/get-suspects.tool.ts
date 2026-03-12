import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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
    const fileContent = readFileSync(SUSPECTS_FILE_PATH, "utf8");
    return JSON.parse(fileContent) as Suspect[];
  },
};
