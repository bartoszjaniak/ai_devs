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

interface NormalizedSuspect {
  name: string;
  surname: string;
  gender: string;
  birthYear: number;
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
    description:
      "Loads the full suspect list from the local file and returns normalized records with birthYear. Call this once, then reuse the returned list for batched location and access-level checks.",
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
  get_suspects(): {
    suspects: NormalizedSuspect[];
    count: number;
    summary: string;
  } {
    const fileContent = readFileSync(SUSPECTS_FILE_PATH, "utf8");
    const suspects = (JSON.parse(fileContent) as Suspect[]).map((suspect) => ({
      name: suspect.name,
      surname: suspect.surname,
      gender: suspect.gender,
      birthYear: suspect.born,
      city: suspect.city,
      tags: suspect.tags,
    }));

    return {
      suspects,
      count: suspects.length,
      summary: `Pobrano ${suspects.length} podejrzanych z danymi gotowymi do batchowego sprawdzania.`,
    };
  },
};
