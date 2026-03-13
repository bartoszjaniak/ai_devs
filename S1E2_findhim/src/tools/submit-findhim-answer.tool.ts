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

interface FindHimAnswer {
  name: string;
  surname: string;
  accessLevel: number;
  powerPlant: string;
  context: string;
}

const VERIFY_API_URL = "https://hub.ag3nts.org/verify";
const FINDHIM_TASK_NAME = "findhim";

function getCourseApiKey(): string {
  const apiKey = process.env.COURSE_API_KEY;
  if (!apiKey) {
    throw new Error("COURSE_API_KEY is not set");
  }

  return apiKey;
}

function parseAnswer(args: Record<string, unknown>): FindHimAnswer {
  const { name, surname, accessLevel, powerPlant, context } = args;

  if (typeof name !== "string" || !name.trim()) {
    throw new Error("Tool argument 'name' must be a non-empty string");
  }

  if (typeof surname !== "string" || !surname.trim()) {
    throw new Error("Tool argument 'surname' must be a non-empty string");
  }

  if (typeof accessLevel !== "number" || Number.isNaN(accessLevel)) {
    throw new Error("Tool argument 'accessLevel' must be a valid number");
  }

  if (typeof powerPlant !== "string" || !powerPlant.trim()) {
    throw new Error("Tool argument 'powerPlant' must be a non-empty string");
  }

  if (typeof context !== "string" || !context.trim()) {
    throw new Error("Tool argument 'context' must be a non-empty string");
  }

  return {
    name: name.trim(),
    surname: surname.trim(),
    accessLevel,
    powerPlant: powerPlant.trim(),
    context: context.trim(),
  };
}

function toVerifyMessage(data: unknown): string {
  if (typeof data === "string") {
    return data;
  }

  if (typeof data === "object" && data !== null) {
    const record = data as Record<string, unknown>;
    const preferred = [record.message, record.msg, record.answer, record.result];
    for (const item of preferred) {
      if (typeof item === "string" && item.trim()) {
        return item;
      }
    }
  }

  return JSON.stringify(data);
}

export const tools: ToolDefinition[] = [
  {
    type: "function",
    name: "submit_findhim_answer",
    description:
      "Submits the final findhim answer to /verify. Use this only once you already know the final person, their accessLevel, and the powerPlant code.",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Suspect first name.",
        },
        surname: {
          type: "string",
          description: "Suspect surname.",
        },
        accessLevel: {
          type: "number",
          description: "Access level number from /api/accesslevel.",
        },
        powerPlant: {
          type: "string",
          description: "Power plant code, for example PWR1234PL.",
        },
        context: {
          type: "string",
          description:
            "Human-readable reasoning for this answer, e.g. 'Adam Nowicki z poziomem dostępu 3, lokalizowany najbliżej Elektrowni Bełchatów KRS123123'.",
        },
        confidence: {
          type: "number",
          description: "Agent's confidence (0.0–1.0) that this tool should be used for the current task.",
        },
      },
      required: ["name", "surname", "accessLevel", "powerPlant", "context", "confidence"],
      additionalProperties: false,
    },
    strict: true,
  },
];

export const handlers = {
  async submit_findhim_answer(args: Record<string, unknown>): Promise<unknown> {
    const answer = parseAnswer(args);
    const apiKey = getCourseApiKey();

    const response = await axios.post<unknown>(
      VERIFY_API_URL,
      {
        apikey: apiKey,
        task: FINDHIM_TASK_NAME,
        answer,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        validateStatus: () => true,
      },
    );

    const verifyMessage = toVerifyMessage(response.data);

    return {
      status: response.status,
      data: response.data,
      verifyMessage,
      context: `${answer.name} ${answer.surname}, poziom dostępu ${answer.accessLevel}, elektrownia ${answer.powerPlant}`,
      summary: `Wysłano finalną odpowiedź findhim dla ${answer.name} ${answer.surname}. Status verify: ${response.status}. Wiadomość verify: ${verifyMessage}`,
    };
  },
};
