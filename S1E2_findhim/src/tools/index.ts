import {
  handlers as suspectHandlers,
  tools as suspectTools,
} from "./get-suspects.tool";
import {
  handlers as powerPlantHandlers,
  tools as powerPlantTools,
} from "./get-power-plants.tool";
import {
  handlers as personLocationsHandlers,
  tools as personLocationsTools,
} from "./get-person-locations.tool";
import {
  handlers as distanceHandlers,
  tools as distanceTools,
} from "./calculate-distance.tool";
import {
  handlers as cityCoordinatesHandlers,
  tools as cityCoordinatesTools,
} from "./get-city-coordinates.tool";
import {
  handlers as accessLevelHandlers,
  tools as accessLevelTools,
} from "./get-access-level.tool";
import {
  handlers as submitFindhimHandlers,
  tools as submitFindhimTools,
} from "./submit-findhim-answer.tool";

export const tools = [
  ...suspectTools,
  ...powerPlantTools,
  ...personLocationsTools,
  ...distanceTools,
  ...cityCoordinatesTools,
  ...accessLevelTools,
  ...submitFindhimTools,
];

type ToolHandler = (...args: unknown[]) => any;

export const handlers: Record<string, ToolHandler> = {
  ...suspectHandlers,
  ...powerPlantHandlers,
  ...personLocationsHandlers,
  ...distanceHandlers,
  ...cityCoordinatesHandlers,
  ...accessLevelHandlers,
  ...submitFindhimHandlers,
};
