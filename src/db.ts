import { drizzle } from "drizzle-orm/postgres-js";
import { lte, eq, and, count } from "drizzle-orm";
import { 
    TBagencies, 
    TBsatellites, 
    TBdebrisPieces, 
    TBcollisionRisks,
    TBdebrisOrbitMapping,
    TBdebrisMitigationAttempts,
    TBdebrisObservations,
    TBmitigationStrategies,
    TBorbits,
    TBtrackingStations
 } from "./schema"
import { sql } from 'drizzle-orm' 
import postgres from "postgres";
const connString = "postgresql://db_user:db_password@localhost:5432/db_project";
export const sqldb = postgres(connString);
export const db = drizzle(sqldb);

const queries = (() => {


    /*
      TODO:
      
      Queries that need new entries to make them have a result
      //This query is going to delete satellites that have been decommissioned for longer than 10 years
      //This query is going to delete any debris piece that has passed the original satellite 3 times and SMALL in size
      //Created a way to update a satellite that has a very small chance of staying up after a risk of collision
      //Delete any satellites that have been decommissioned for over 20 years
    */


    (async () => {
        await db.execute(sql`
            INSERT INTO
            agencies (
                agency_id,
                agency_name,
                headquarters,
                founded_year,
                contact_info
            )
            VALUES
            (
                43609,
                'SpaceX',
                'Hawthorne, California, USA',
                2002,
                'contact@spacex.com'
            )
        `);
        await sqldb.end();
    })();
    
    (async () =>{
        await db.execute(sql`
            INSERT INTO
            agencies (
            agency_id,
            agency_name,
            headquarters,
            founded_year,
            contact_info
            )
        VALUES
            (
            20000,
            'NASA',
            'Washington, DC',
            1958,
            'hq-civilrightsinfo@mail.nasa.gov'
            )
        `);
        await sqldb.end();
    })();
    
    (async () =>{
        
        await db.execute(sql`
            INSERT INTO
            satellites (
            satellite_id,
            agency_id,
            NAME,
            launch_date,
            decommission_date,
            orbit_type
            )
        VALUES
            (
            4000000,
            43609,
            'Starlink-1',
            '872253000004',
            100000000000000000,
            'LEO'
            )
        `);
    
        await sqldb.end();
    })();
    
    //This query is going to delete debris peices that have a low activity status and are small in size
    (async () => {
        
       await db.execute(sql`
       DELETE FROM debris_pieces
       WHERE
         current_status = 'high'
         AND size = 'SMALL'
       RETURNING
         *
       `);
       await sqldb.end();
    })();

    //Created a way to update a satellite that has a very small chance of staying up after a risk of collision
    
        (async () => {
            await db.execute(sql`
            UPDATE "debris_pieces"
            SET
              "size" = 'SMALL'
            WHERE
              "debris_id" IN (
                SELECT
                  dp."debris_id"
                FROM
                  "debris_mitigation_attempts" dma
                  JOIN "debris_pieces" dp ON dma."debris_id" = dp."debris_id"
                WHERE
                  dma."result" = 'UNDEFINED'
              )
            RETURNING
              *;
            `);
            await sqldb.end();
        })();
    
    
    //Gets the total number of each debris size
    (async () => {
        await db.execute(sql`
        SELECT size, COUNT(*) AS total_count
        FROM debris_pieces
        WHERE size IN ('SMALL', 'MEDIUM', 'LARGE')
        GROUP BY size 
        `);
        await sqldb.end();
    })();
    
    //The idea for this one is to get the most up to date observation of each piece of debris
    (async () => {
        await db.execute(sql`
            SELECT
                d.debris_id,
                d.current_status,
                d.size,
                d.material,
                o.observation_timestamp,
                o.velocity,
                o.position
            FROM
                debris_pieces d
                JOIN (
                    SELECT
                    debris_id,
                    MAX(observation_timestamp) AS LatestObservation
                    FROM
                        debris_observations
                    GROUP BY
                        debris_id
                ) latest ON d.debris_id = latest.debris_id
                JOIN debris_observations o ON d.debris_id = o.debris_id
                AND o.observation_timestamp = latest.LatestObservation
        `)
    
        await sqldb.end();
    })();
    
    //This gets the agencies that have the most satellites that have been destroyed/have had bad collisions
    (async () => {
        await db.execute(sql`
        WITH decommissioned_counts AS (
            SELECT
              agency_id,
              COUNT(satellite_id) AS decommissioned_count
            FROM
              satellites
            WHERE
              decommission_date IS NOT NULL
            GROUP BY
              agency_id
          ),
          top_20_agencies AS (
            SELECT
              agency_id,
              decommissioned_count
            FROM
              decommissioned_counts
            ORDER BY
              decommissioned_count DESC
            LIMIT 20
          )
          SELECT
            a.*,
            t.decommissioned_count
          FROM
            agencies a
            JOIN top_20_agencies t ON a.agency_id = t.agency_id
          
      
        `)
    
        await sqldb.end();
    })();
    
    //This query lists satellites with the highest number of associated debris pieces, providing insight into satellite models that might be prone to creating debris.
    (async () => { 
        await db.execute(sql`
        SELECT
            s.name,
            d.material,
        COUNT(d.debris_id) AS debris_count
        FROM
            satellites s
        JOIN debris_pieces d ON s.satellite_id = d.origin_satellite_id
        GROUP BY
            s.satellite_id,
            d.material
        ORDER BY
            debris_count DESC
        LIMIT
            5
        `)
    
        await sqldb.end();
    })();
    
    //Select the oldest debris pieces and order them by age
    (async () => {
        await db.execute(sql`
        SELECT
        dp.debris_id,
        dp.current_status,
        dp.size,
        dp.material,
        MIN("do".observation_timestamp) AS first_observation
        FROM
        debris_pieces dp
        JOIN debris_observations "do" ON dp.debris_id = "do".debris_id
        GROUP BY
        dp.debris_id,
        dp.current_status,
        dp.size,
        dp.material
        ORDER BY
        first_observation ASC
        LIMIT 100
        `)
    
        await sqldb.end();
    })();
});
