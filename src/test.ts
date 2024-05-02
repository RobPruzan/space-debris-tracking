import { readFileSync } from "fs";
import { parse } from "csv-parse/sync";
import { faker } from "@faker-js/faker";
import { db } from "./db";
import path from "path";
import {
  TBagencies,
  TBsatellites,
  TBdebrisPieces,
  TBorbits,
  TBtrackingStations,
  TBmitigationStrategies,
  TBdebrisOrbitMapping,
  TBdebrisObservations,
  TBcollisionRisks,
  TBdebrisMitigationAttempts,
} from "./schema";
import { sql } from "drizzle-orm";

const csvData = readFileSync(path.join(__dirname, "..", "space-decay.csv"));
const records = parse(csvData, { columns: true });

console.log(records);
