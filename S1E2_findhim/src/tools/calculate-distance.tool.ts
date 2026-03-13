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
  from: Coordinate[];
  fromContext: string;
  to: DestinationPoint[];
}

interface DistanceResult {
  distance_km: number;
  distance_m: number;
  fromContext: string;
  toContext: string;
  nearestFrom: Coordinate;
}

interface Coordinate {
  lat: number;
  lon: number;
}

interface DestinationPoint extends Coordinate {
  context: string;
}

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function validateCoordinate(point: Coordinate, fieldPrefix: string): Coordinate {
  if (point.lat < -90 || point.lat > 90) {
    throw new Error(`Tool argument '${fieldPrefix}.lat' must be between -90 and 90`);
  }

  if (point.lon < -180 || point.lon > 180) {
    throw new Error(`Tool argument '${fieldPrefix}.lon' must be between -180 and 180`);
  }

  return point;
}

function parseDestinationCoordinates(
  args: Record<string, unknown>,
  fieldName: string,
): DestinationPoint[] {
  const rawTo = args[fieldName];

  if (!Array.isArray(rawTo) || rawTo.length === 0) {
    throw new Error(`Tool argument '${fieldName}' must be a non-empty array of coordinates with context`);
  }

  return rawTo.map((item, index) => {
    if (typeof item !== "object" || item === null) {
      throw new Error(`Tool argument '${fieldName}[${index}]' must be an object with numeric lat/lon and context`);
    }

    const point = item as Record<string, unknown>;
    const lat = point.lat;
    const lon = point.lon;
    const context = point.context;

    if (typeof lat !== "number" || Number.isNaN(lat)) {
      throw new Error(`Tool argument '${fieldName}[${index}].lat' must be a valid number`);
    }

    if (typeof lon !== "number" || Number.isNaN(lon)) {
      throw new Error(`Tool argument '${fieldName}[${index}].lon' must be a valid number`);
    }

    // Keep tool resilient even if model forgets destination context in one item.
    const normalizedContext =
      typeof context === "string" && context.trim()
        ? context.trim()
        : `${fieldName}[${index}]`;

    return {
      ...validateCoordinate({ lat, lon }, `${fieldName}[${index}]`),
      context: normalizedContext,
    };
  });
}

function parseFromCoordinates(args: Record<string, unknown>): Coordinate[] {
  const rawFrom = args.from;

  if (!Array.isArray(rawFrom) || rawFrom.length === 0) {
    throw new Error("Tool argument 'from' must be a non-empty array of coordinates");
  }

  return rawFrom.map((item, index) => {
    if (typeof item !== "object" || item === null) {
      throw new Error(`Tool argument 'from[${index}]' must be an object with numeric lat/lon`);
    }

    const point = item as Record<string, unknown>;
    const lat = point.lat;
    const lon = point.lon;

    if (typeof lat !== "number" || Number.isNaN(lat)) {
      throw new Error(`Tool argument 'from[${index}].lat' must be a valid number`);
    }

    if (typeof lon !== "number" || Number.isNaN(lon)) {
      throw new Error(`Tool argument 'from[${index}].lon' must be a valid number`);
    }

    return validateCoordinate({ lat, lon }, `from[${index}]`);
  });
}

function validateCoordinateRanges(input: DistanceInput): void {
  input.to.forEach((point, index) => {
    validateCoordinate(point, `to[${index}]`);
  });
}

function parseSingleComparison(
  comparison: Record<string, unknown>,
  index: number,
): DistanceInput {
  const fromContext = comparison.fromContext;

  if (typeof fromContext !== "string" || !fromContext.trim()) {
    throw new Error(`Tool argument 'comparisons[${index}].fromContext' must be a non-empty string`);
  }

  const input: DistanceInput = {
    from: parseFromCoordinates(comparison),
    fromContext: fromContext.trim(),
    to: parseDestinationCoordinates(comparison, "to"),
  };

  validateCoordinateRanges(input);
  return input;
}

function parseInputs(args: Record<string, unknown>): DistanceInput[] {
  const rawComparisons = args.comparisons;

  if (!Array.isArray(rawComparisons) || rawComparisons.length === 0) {
    throw new Error("Tool argument 'comparisons' must be a non-empty array");
  }

  return rawComparisons.map((item, index) => {
    if (typeof item !== "object" || item === null) {
      throw new Error(`Tool argument 'comparisons[${index}]' must be an object`);
    }

    return parseSingleComparison(item as Record<string, unknown>, index);
  });
}

function calculateHaversineDistanceKm(from: Coordinate, to: Coordinate): number {
  const fromLatRad = toRadians(from.lat);
  const fromLonRad = toRadians(from.lon);
  const toLatRad = toRadians(to.lat);
  const toLonRad = toRadians(to.lon);

  const deltaLat = toLatRad - fromLatRad;
  const deltaLon = toLonRad - fromLonRad;

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(fromLatRad) * Math.cos(toLatRad) * Math.sin(deltaLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

function calculateShortestDistance(input: DistanceInput): {
  distanceKm: number;
  nearestFrom: Coordinate;
  destination: DestinationPoint;
}[] {
  return input.to.map((destination) => {
    let shortestDistanceKm = Number.POSITIVE_INFINITY;
    let nearestFrom = input.from[0];

    for (const fromPoint of input.from) {
      const distanceKm = calculateHaversineDistanceKm(fromPoint, destination);
      if (distanceKm < shortestDistanceKm) {
        shortestDistanceKm = distanceKm;
        nearestFrom = fromPoint;
      }
    }

    return {
      distanceKm: shortestDistanceKm,
      nearestFrom,
      destination,
    };
  });
}

export const tools: ToolDefinition[] = [
  {
    type: "function",
    name: "calculate_distance",
    description:
      "Calculates shortest great-circle distances for one or more comparisons in a single call. Prefer batching all suspect-to-plant comparisons needed for ranking candidates.",
    parameters: {
      type: "object",
      properties: {
        comparisons: {
          type: "array",
          description:
            "List of distance comparisons to calculate. Prefer one batched call containing all candidate comparisons needed for final ranking.",
          items: {
            type: "object",
            properties: {
              from: {
                type: "array",
                description:
                  "List of source points in decimal degrees. The shortest distance to the destination will be returned.",
                items: {
                  type: "object",
                  properties: {
                    lat: {
                      type: "number",
                      description: "Latitude of a source point in decimal degrees.",
                    },
                    lon: {
                      type: "number",
                      description: "Longitude of a source point in decimal degrees.",
                    },
                  },
                  required: ["lat", "lon"],
                  additionalProperties: false,
                },
                minItems: 1,
              },
              to: {
                type: "array",
                description:
                  "List of destination points in decimal degrees. A separate result will be returned for each destination.",
                items: {
                  type: "object",
                  properties: {
                    lat: {
                      type: "number",
                      description: "Latitude of the destination point in decimal degrees.",
                    },
                    lon: {
                      type: "number",
                      description: "Longitude of the destination point in decimal degrees.",
                    },
                    context: {
                      type: "string",
                      description:
                        "Human-readable description of the destination, e.g. 'Grudziądz | PWR7264PL'.",
                    },
                  },
                  required: ["lat", "lon", "context"],
                  additionalProperties: false,
                },
                minItems: 1,
              },
              fromContext: {
                type: "string",
                description:
                  "Human-readable description of what the source points represent, e.g. person's full name 'Adam Nowicki'.",
              },
            },
            required: ["from", "to", "fromContext"],
            additionalProperties: false,
          },
          minItems: 1,
        },
        confidence: {
          type: "number",
          description: "Agent's confidence (0.0–1.0) that this tool should be used for the current task.",
        },
      },
      required: ["comparisons", "confidence"],
      additionalProperties: false,
    },
    strict: true,
  },
];

export const handlers = {
  calculate_distance(args: Record<string, unknown>): {
    results: DistanceResult[];
    summary: string;
  } {
    const inputs = parseInputs(args);
    const results = inputs.flatMap((input) =>
      calculateShortestDistance(input).map(
        ({ distanceKm, nearestFrom, destination }) => ({
          distance_km: distanceKm,
          distance_m: distanceKm * 1000,
          fromContext: input.fromContext,
          toContext: destination.context,
          nearestFrom,
        }),
      ),
    );

    const bestResult = results.reduce((best, current) =>
      current.distance_km < best.distance_km ? current : best,
    );

    return {
      results,
      summary: `Policzono ${results.length} odległości. Najkrótsza: ${bestResult.fromContext} -> ${bestResult.toContext} = ${bestResult.distance_km.toFixed(2)} km.`,
    };
  },
};
