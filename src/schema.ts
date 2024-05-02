import {
  serial,
  timestamp,
  pgTable,
  uuid,
  boolean,
  alias,
  integer,
  AnyPgTable,
  AnyPgColumn,
  text,
  doublePrecision,
  PgColumn,
  real,
  date,
} from "drizzle-orm/pg-core";

export const TBagencies = pgTable("agencies", {
  agencyId: real("agency_id").primaryKey(),
  agencyName: text("agency_name").notNull(),
  headquarters: text("headquarters").notNull(),
  foundedYear: real("founded_year").notNull(),
  contactInfo: text("contact_info").notNull(),
});

export const TBsatellites = pgTable("satellites", {
  satelliteId: real("satellite_id").primaryKey(),
  agencyId: real("agency_id").references(() => TBagencies.agencyId),
  name: text("name").notNull(),
  launchDate: date("launch_date").notNull(),
  decommissionDate: date("decommission_date").notNull(),
  orbitType: text("orbit_type").notNull(),
});

export const TBorbits = pgTable("orbits", {
  orbitId: real("orbit_id").primaryKey(),
  altitude: doublePrecision("altitude").notNull(),
  inclination: doublePrecision("inclination").notNull(),
  eccentricity: doublePrecision("eccentricity").notNull(),
});

export const TBdebrisPieces = pgTable("debris_pieces", {
  debrisId: real("debris_id").primaryKey(),
  originSatelliteId: real("origin_satellite_id").references(
    () => TBsatellites.satelliteId
  ),
  currentStatus: text("current_status").notNull(),
  size: doublePrecision("size").notNull(),
  material: text("material").notNull(),
});

export const TBtrackingStations = pgTable("tracking_stations", {
  stationId: real("station_id").primaryKey(),
  agencyId: real("agency_id").references(() => TBagencies.agencyId),
  location: text("location").notNull(),
  capabilities: text("capabilities").notNull(),
});

export const TBmitigationStrategies = pgTable("mitigation_strategies", {
  strategyId: real("strategy_id").primaryKey(),
  description: text("description").notNull(),
  successRate: doublePrecision("success_rate").notNull(),
  costEstimate: doublePrecision("cost_estimate").notNull(),
});

export const TBdebrisOrbitMapping = pgTable("debris_orbit_mapping", {
  mappingId: real("mapping_id").primaryKey(),
  debrisId: real("debris_id").references(() => TBdebrisPieces.debrisId),
  orbitId: real("orbit_id").references(() => TBorbits.orbitId),
  // removed timestamp column
});

export const TBdebrisObservations = pgTable("debris_observations", {
  observationId: real("observation_id").primaryKey(),
  stationId: real("station_id").references(() => TBtrackingStations.stationId),
  debrisId: real("debris_id").references(() => TBdebrisPieces.debrisId),
  observationTimestamp: timestamp("observation_timestamp"),
  velocity: doublePrecision("velocity").notNull(),
  position: text("position").notNull(),
});

export const TBcollisionRisks = pgTable("collision_risks", {
  riskId: real("risk_id").primaryKey(),
  debrisId: real("debris_id").references(() => TBdebrisPieces.debrisId),
  satelliteId: real("satelliteId").references(() => TBsatellites.satelliteId),
  riskLevel: text("risk_level").notNull(),
  estimatedCollisionTime: timestamp("estimated_collision_time").notNull(),
});

export const TBdebrisMitigationAttempts = pgTable(
  "debris_mitigation_attempts",
  {
    attemptId: real("attempt_id").primaryKey(),
    debrisId: real("debris_id").references(() => TBdebrisPieces.debrisId),
    strategyId: real("strategy_id").references(
      () => TBmitigationStrategies.strategyId
    ),
    attemptDate: date("attempt_date").notNull(),
    result: text("result").notNull(),
  }
);
