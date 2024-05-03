import { readFileSync } from "fs";
import { parse } from "csv-parse/sync";
import { de, fa, faker } from "@faker-js/faker";
import { db, sqldb } from "./db";
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
  Satellite,
  Agency,
} from "./schema";

type DebrisRecord = {
  APOAPSIS: number;
  PERIAPSIS: number;
  INCLINATION: number;
  ECCENTRICITY: number;
};

type OrbitData = {
  altitude: number;
  inclination: number;
  eccentricity: number;
};

const calculateOrbitData = (debrisRecord: DebrisRecord): OrbitData => {
  const altitude = (debrisRecord.APOAPSIS + debrisRecord.PERIAPSIS) / 2;
  const { INCLINATION: inclination, ECCENTRICITY: eccentricity } = debrisRecord;

  return { altitude, inclination, eccentricity };
};

type SatelliteRecord = {
  TLE_LINE0: string;
  TLE_LINE1: string;
  TLE_LINE2: string;
};

function getLocation(record: SatelliteRecord) {
  return `${record.TLE_LINE0}\n${record.TLE_LINE1}\n${record.TLE_LINE2}`;
}

(async () => {
  const satellites: Array<Satellite> = [];
  const agencies: Array<Agency> = [];
  console.log("seeding agencies");
  for (let i = 0; i < 10000; i++) {
    const agency = await db
      .insert(TBagencies)
      .values({
        agencyName: faker.company.name(),
        headquarters: faker.location.city(),
        foundedYear: faker.date
          .past({
            refDate: new Date(),
            years: 50,
          })
          .getFullYear(),
        contactInfo: faker.phone.number(),
        agencyId: i,
      })
      .onConflictDoNothing()
      .returning()
      .then((data) => data[0]);
    agencies.push(agency);

    const anytime = faker.date.anytime();
    const satellite = await db
      .insert(TBsatellites)
      .values({
        decommissionDate: anytime.getTime(),
        launchDate: faker.date
          .past({
            refDate: new Date(),
            years: 50,
          })
          .getTime(),
        name: faker.lorem.word(),
        orbitType: ["LEO", "GEO", "MEO", "HEO"][Math.floor(Math.random() * 3)],
        agencyId: agency.agencyId,
        satelliteId: i,
      })
      .returning()
      .then((data) => data[0]);
    satellites.push(satellite);
  }

  const csvData = readFileSync(path.join(__dirname, "..", "space-decay.csv"));
  const records: Array<any> = parse(csvData, { columns: true });
  // for (const record of ) {
  console.log("seeding all basically");
  await Promise.all(
    records.map(async (record, idx) => {
      const debris = await db
        .insert(TBdebrisPieces)
        .values({
          currentStatus: ["low", "medium", "high"][
            Math.floor(Math.random() * 3)
          ],
          material: record.MEAN_ELEMENT_THEORY,
          debrisId: idx,
          size: record.RCS_SIZE,
          originSatelliteId:
            satellites[Math.floor(Math.random() * satellites.length)]
              .satelliteId,
        })
        .returning()
        .then((data) => data[0]);

      const orbitData = calculateOrbitData(record);

      const orbit = await db
        .insert(TBorbits)
        .values({
          altitude: orbitData.altitude,
          eccentricity: orbitData.eccentricity,
          inclination: orbitData.inclination,
          orbitId: idx,
        })
        .returning()
        .then((data) => data[0]);

      await db.insert(TBdebrisOrbitMapping).values({
        debrisId: debris.debrisId,
        mappingId: idx,
        orbitId: orbit.orbitId,
      });

      if (faker.number.int({ min: 1, max: 2 }) % 2 == 0) {
        await db.insert(TBcollisionRisks).values({
          debrisId: debris.debrisId,
          satelliteId:
            satellites[Math.floor(Math.random() * satellites.length)]
              .satelliteId,
          riskId: idx,
          estimatedCollisionTime: faker.date.future(),
          riskLevel: ["low", "medium", "high"][Math.floor(Math.random() * 3)],
        });
      }

      const station = await db
        .insert(TBtrackingStations)
        .values({
          capabilities: faker.lorem.sentence(),
          location: faker.location.streetAddress(),
          agencyId:
            satellites[Math.floor(Math.random() * satellites.length)].agencyId,
          stationId: idx,
        })
        .returning()
        .then((data) => data[0]);

      await db.insert(TBdebrisObservations).values({
        position: getLocation(record),
        velocity: record.MEAN_MOTION,
        debrisId: debris.debrisId,
        stationId: station.stationId,
        observationId: idx,
        observationTimestamp: record.CREATION_DATE
          ? new Date(record.CREATION_DATE)
          : faker.date.anytime(),
      });

      const strategy = await db
        .insert(TBmitigationStrategies)
        .values({
          costEstimate: faker.number.float({ min: 10_000, max: 1_000_000 }),
          description: faker.lorem.sentence(),
          successRate: faker.number.float({ min: 0, max: 1 }),
          strategyId: idx,
        })
        .returning()
        .then((data) => data[0]);

      await db.insert(TBdebrisMitigationAttempts).values({
        attemptDate: faker.date.anytime().getTime(),
        result: ["SUCCESS", "FAILURE", "UNDEFINED"][
          Math.floor(Math.random() * 3)
        ],
        attemptId: idx,
        debrisId: debris.debrisId,
        strategyId: strategy.strategyId,
      });
    })
  );

  await sqldb.end();
})();
