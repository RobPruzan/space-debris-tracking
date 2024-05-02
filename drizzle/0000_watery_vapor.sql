CREATE TABLE IF NOT EXISTS "agencies" (
	"agency_id" real PRIMARY KEY NOT NULL,
	"agency_name" text NOT NULL,
	"headquarters" text NOT NULL,
	"founded_year" real NOT NULL,
	"contact_info" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "collision_risks" (
	"risk_id" real PRIMARY KEY NOT NULL,
	"debris_id" real,
	"satelliteId" real,
	"risk_level" text NOT NULL,
	"estimated_collision_time" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "debris_mitigation_attempts" (
	"attempt_id" real PRIMARY KEY NOT NULL,
	"debris_id" real,
	"strategy_id" real,
	"attempt_date" date NOT NULL,
	"result" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "debris_observations" (
	"observation_id" real PRIMARY KEY NOT NULL,
	"station_id" real,
	"debris_id" real,
	"observation_timestamp" timestamp,
	"velocity" double precision NOT NULL,
	"position" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "debris_orbit_mapping" (
	"mapping_id" real PRIMARY KEY NOT NULL,
	"debris_id" real,
	"orbit_id" real
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "debris_pieces" (
	"debris_id" real PRIMARY KEY NOT NULL,
	"origin_satellite_id" real,
	"current_status" text NOT NULL,
	"size" double precision NOT NULL,
	"material" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mitigation_strategies" (
	"strategy_id" real PRIMARY KEY NOT NULL,
	"description" text NOT NULL,
	"success_rate" double precision NOT NULL,
	"cost_estimate" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orbits" (
	"orbit_id" real PRIMARY KEY NOT NULL,
	"altitude" double precision NOT NULL,
	"inclination" double precision NOT NULL,
	"eccentricity" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "satellites" (
	"satellite_id" real PRIMARY KEY NOT NULL,
	"agency_id" real,
	"name" text NOT NULL,
	"launch_date" date NOT NULL,
	"decommission_date" date NOT NULL,
	"orbit_type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tracking_stations" (
	"station_id" real PRIMARY KEY NOT NULL,
	"agency_id" real,
	"location" text NOT NULL,
	"capabilities" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collision_risks" ADD CONSTRAINT "collision_risks_debris_id_debris_pieces_debris_id_fk" FOREIGN KEY ("debris_id") REFERENCES "debris_pieces"("debris_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collision_risks" ADD CONSTRAINT "collision_risks_satelliteId_satellites_satellite_id_fk" FOREIGN KEY ("satelliteId") REFERENCES "satellites"("satellite_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "debris_mitigation_attempts" ADD CONSTRAINT "debris_mitigation_attempts_debris_id_debris_pieces_debris_id_fk" FOREIGN KEY ("debris_id") REFERENCES "debris_pieces"("debris_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "debris_mitigation_attempts" ADD CONSTRAINT "debris_mitigation_attempts_strategy_id_mitigation_strategies_strategy_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "mitigation_strategies"("strategy_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "debris_observations" ADD CONSTRAINT "debris_observations_station_id_tracking_stations_station_id_fk" FOREIGN KEY ("station_id") REFERENCES "tracking_stations"("station_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "debris_observations" ADD CONSTRAINT "debris_observations_debris_id_debris_pieces_debris_id_fk" FOREIGN KEY ("debris_id") REFERENCES "debris_pieces"("debris_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "debris_orbit_mapping" ADD CONSTRAINT "debris_orbit_mapping_debris_id_debris_pieces_debris_id_fk" FOREIGN KEY ("debris_id") REFERENCES "debris_pieces"("debris_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "debris_orbit_mapping" ADD CONSTRAINT "debris_orbit_mapping_orbit_id_orbits_orbit_id_fk" FOREIGN KEY ("orbit_id") REFERENCES "orbits"("orbit_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "debris_pieces" ADD CONSTRAINT "debris_pieces_origin_satellite_id_satellites_satellite_id_fk" FOREIGN KEY ("origin_satellite_id") REFERENCES "satellites"("satellite_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "satellites" ADD CONSTRAINT "satellites_agency_id_agencies_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "agencies"("agency_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tracking_stations" ADD CONSTRAINT "tracking_stations_agency_id_agencies_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "agencies"("agency_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
