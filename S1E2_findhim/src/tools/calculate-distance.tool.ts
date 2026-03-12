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

interface DistanceInput {
  fromLat: number;
  fromLon: number;
  toLat: number;
  toLon: number;
}

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function validateNumberField(
  args: Record<string, unknown>,
  fieldName: keyof DistanceInput,
): number {
  const value = args[fieldName];

  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`Tool argument '${fieldName}' must be a valid number`);
  }

  return value;
}

function validateCoordinateRanges(input: DistanceInput): void {
  if (input.fromLat < -90 || input.fromLat > 90) {
    throw new Error("Tool argument 'fromLat' must be between -90 and 90");
  }

  if (input.toLat < -90 || input.toLat > 90) {
    throw new Error("Tool argument 'toLat' must be between -90 and 90");
  }

  if (input.fromLon < -180 || input.fromLon > 180) {
    throw new Error("Tool argument 'fromLon' must be between -180 and 180");
  }

  if (input.toLon < -180 || input.toLon > 180) {
    throw new Error("Tool argument 'toLon' must be between -180 and 180");
  }
}

function parseInput(args: Record<string, unknown>): DistanceInput {
  const input: DistanceInput = {
    fromLat: validateNumberField(args, "fromLat"),
    fromLon: validateNumberField(args, "fromLon"),
    toLat: validateNumberField(args, "toLat"),
    toLon: validateNumberField(args, "toLon"),
  };

  validateCoordinateRanges(input);
  return input;
}

function calculateHaversineDistanceKm(input: DistanceInput): number {
  const fromLatRad = toRadians(input.fromLat);
  const fromLonRad = toRadians(input.fromLon);
  const toLatRad = toRadians(input.toLat);
  const toLonRad = toRadians(input.toLon);

  const deltaLat = toLatRad - fromLatRad;
  const deltaLon = toLonRad - fromLonRad;

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(fromLatRad) * Math.cos(toLatRad) * Math.sin(deltaLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export const tools: ToolDefinition[] = [
  {
    type: "function",
    name: "calculate_distance",
    description:
      "Calculates the great-circle distance between two geographic points using the Haversine formula.",
    parameters: {
      type: "object",
      properties: {
        fromLat: {
          type: "number",
          description: "Latitude of the starting point in decimal degrees.",
        },
        fromLon: {
          type: "number",
          description: "Longitude of the starting point in decimal degrees.",
        },
        toLat: {
          type: "number",
          description: "Latitude of the destination point in decimal degrees.",
        },
        toLon: {
          type: "number",
          description: "Longitude of the destination point in decimal degrees.",
        },
      },
      required: ["fromLat", "fromLon", "toLat", "toLon"],
      additionalProperties: false,
    },
    strict: true,
  },
];

export const handlers = {
  calculate_distance(args: Record<string, unknown>): {
    distance_km: number;
    distance_m: number;
  } {
    const input = parseInput(args);
    const distanceKm = calculateHaversineDistanceKm(input);

    return {
      distance_km: distanceKm,
      distance_m: distanceKm * 1000,
    };
  },
};
