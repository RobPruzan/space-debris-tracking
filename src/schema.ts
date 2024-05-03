import { InferSelectModel } from "drizzle-orm";
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
  agencyId: serial("agency_id").primaryKey(),
  agencyName: text("agency_name").notNull(),
  headquarters: text("headquarters").notNull(),
  foundedYear: real("founded_year").notNull(),
  contactInfo: text("contact_info").notNull(),
});

export type Agency = InferSelectModel<typeof TBagencies>;

export const TBsatellites = pgTable("satellites", {
  satelliteId: serial("satellite_id").primaryKey(),
  agencyId: serial("agency_id").references(() => TBagencies.agencyId, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
  launchDate: real("launch_date").notNull(),
  decommissionDate: real("decommission_date").notNull(),
  orbitType: text("orbit_type").notNull(),
});

export type Satellite = InferSelectModel<typeof TBsatellites>;

export const TBorbits = pgTable("orbits", {
  orbitId: serial("orbit_id").primaryKey(),
  altitude: doublePrecision("altitude").notNull(),
  inclination: doublePrecision("inclination").notNull(),
  eccentricity: doublePrecision("eccentricity").notNull(),
});

export type Orbit = InferSelectModel<typeof TBorbits>;

export const TBdebrisPieces = pgTable("debris_pieces", {
  debrisId: serial("debris_id").primaryKey(),
  originSatelliteId: serial("origin_satellite_id").references(
    () => TBsatellites.satelliteId,
    { onDelete: "cascade" },
    { onDelete: "cascade" }
  ),
  currentStatus: text("current_status").notNull(),
  size: text("size").notNull(),
  material: text("material").notNull(),
});

export type DebrisPiece = InferSelectModel<typeof TBdebrisPieces>;

export const TBtrackingStations = pgTable("tracking_stations", {
  stationId: serial("station_id").primaryKey(),
  agencyId: serial("agency_id").references(() => TBagencies.agencyId, {
    onDelete: "cascade",
  }),
  location: text("location").notNull(),
  capabilities: text("capabilities").notNull(),
});

export type TrackingStation = InferSelectModel<typeof TBtrackingStations>;

export const TBmitigationStrategies = pgTable("mitigation_strategies", {
  strategyId: serial("strategy_id").primaryKey(),
  description: text("description").notNull(),
  successRate: doublePrecision("success_rate").notNull(),
  costEstimate: doublePrecision("cost_estimate").notNull(),
});

export type MitigationStrategy = InferSelectModel<
  typeof TBmitigationStrategies
>;

export const TBdebrisOrbitMapping = pgTable("debris_orbit_mapping", {
  mappingId: serial("mapping_id").primaryKey(),
  debrisId: serial("debris_id").references(() => TBdebrisPieces.debrisId, {
    onDelete: "cascade",
  }),
  orbitId: serial("orbit_id").references(() => TBorbits.orbitId, {
    onDelete: "cascade",
  }),
  // removed timestamp column
});

export const TBdebrisObservations = pgTable("debris_observations", {
  observationId: serial("observation_id").primaryKey(),
  stationId: serial("station_id").references(
    () => TBtrackingStations.stationId,
    { onDelete: "cascade" }
  ),
  debrisId: serial("debris_id").references(() => TBdebrisPieces.debrisId, {
    onDelete: "cascade",
  }),
  observationTimestamp: timestamp("observation_timestamp"),
  velocity: doublePrecision("velocity").notNull(),
  position: text("position").notNull(),
});

export const TBcollisionRisks = pgTable("collision_risks", {
  riskId: serial("risk_id").primaryKey(),
  debrisId: serial("debris_id").references(() => TBdebrisPieces.debrisId, {
    onDelete: "cascade",
  }),
  satelliteId: serial("satelliteId").references(
    () => TBsatellites.satelliteId,
    { onDelete: "cascade" }
  ),
  riskLevel: text("risk_level").notNull(),
  estimatedCollisionTime: timestamp("estimated_collision_time").notNull(),
});

export const TBdebrisMitigationAttempts = pgTable(
  "debris_mitigation_attempts",
  {
    attemptId: serial("attempt_id").primaryKey(),
    debrisId: serial("debris_id").references(() => TBdebrisPieces.debrisId, {
      onDelete: "cascade",
    }),
    strategyId: serial("strategy_id").references(
      () => TBmitigationStrategies.strategyId,
      { onDelete: "cascade" }
    ),
    attemptDate: real("attempt_date").notNull(),
    result: text("result").notNull(),
  }
);
