import {
  handlers as suspectHandlers,
  tools as suspectTools,
} from "./get-suspects.tool";
import {
  handlers as powerPlantHandlers,
  tools as powerPlantTools,
} from "./get-power-plants.tool";

export const tools = [...suspectTools, ...powerPlantTools];

type ToolHandler = (...args: unknown[]) => any;

export const handlers: Record<string, ToolHandler> = {
  ...suspectHandlers,
  ...powerPlantHandlers,
};
