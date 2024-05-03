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
    (async () => {
        await db.insert(TBagencies).values({ 
            agencyId: 42069,
            agencyName: 'SpaceX', 
            headquarters: 'Hawthorne, California, USA', 
            foundedYear: 2002,
            contactInfo: 'contact@spacex.com' 
        }).onConflictDoNothing();
    
        await sqldb.end();
    })();
    
    (async () =>{
        await db.insert(TBagencies).values({ 
            agencyId: 69420,
            agencyName: 'NASA', 
            headquarters: 'Washington, DC', 
            foundedYear: 1958,
            contactInfo: 'hq-civilrightsinfo@mail.nasa.gov' 
        }).onConflictDoNothing();
        await sqldb.end();
    })();
    
    (async () =>{
        
        await db.insert(TBsatellites).values([{ 
            satelliteId: 696969, 
            agencyId: 69420, 
            name: 'Starlink-1', 
            launchDate: 1294835010000, 
            orbitType: 'LEO', 
            decommissionDate: 1746222201000 
        }]).onConflictDoNothing();
    
        await sqldb.end();
    })();
    
    //This query is going to delete satellites that have been decommissioned for longer than 10 years
    (async () => {
        const tenYearsAgo = Date.now() - 10 * 365 * 24 * 60 * 60 * 1000; // 10 years in milliseconds
        await db.delete(TBsatellites)
            .where(lte(TBsatellites.decommissionDate, tenYearsAgo))
        await sqldb.end();
    })();
    //This query is going to delete any debris piece that has passed the original satellite 3 times and SMALL in size
    (async () => {
        await db.execute(sql`
            DELETE FROM debris_pieces
            WHERE debris_id IN (
                SELECT d.debris_id
                FROM debris_pieces d
                    JOIN debris_orbit_mapping dom ON d.debris_id = dom.debris_id
                    JOIN orbits o ON dom.orbit_id = o.orbit_id
                    WHERE d.origin_satellite_id = dom.debris_id
                    GROUP BY d.debris_id
                    HAVING COUNT(dom.debris_id) >= 3
            )
            AND size = 'SMALL';
        `);
    })();   
    //Created a way to update a satellite that has a very small chance of staying up after a risk of collision
        (async () => {
            await db.execute(sql`
                UPDATE satellites
                SET
                decommission_date = extract(epoch from current_timestamp) * 1000
                FROM
                collision_risks cr
                JOIN debris_mitigation_attempts dma ON cr.debris_id = dma.debris_id
                JOIN mitigation_strategies ms ON ms.strategy_id = dma.strategy_id
                WHERE
                satellites.satellite_id = cr."satelliteId"
                AND cr.risk_level = 'HIGH'
                AND ms.success_rate < 0.01;
            `);
            await sqldb.end();
        })();
    
    //Update the current status of debris to 'Inactive' if not observed for more than 10 years
    (async () => {
        await db.execute(sql`
            DELETE FROM satellites
            WHERE
            decommission_date <= EXTRACT(
                EPOCH
                FROM
                CURRENT_TIMESTAMP
            ) * 1000 - 315576000000;
        `);
        await sqldb.end();
    })();
    
    //Gets the total number of each debris size
    (async () => {
        await db.execute(sql`
        SELECT size, COUNT(*) AS total_count
        FROM debris_pieces
        WHERE size IN ('SMALL', 'MEDIUM', 'LARGE')
        GROUP BY size;    
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
                AND o.observation_timestamp = latest.LatestObservation;
        `)
    
        await sqldb.end();
    })();
    
    //This gets the agencies that have the most satellites that have been destroyed/have had bad collisions
    (async () => {
        await db.execute(sql`
        SELECT
        a.*,
        COUNT(s.satellite_id) AS decommissioned_count
        FROM
            agencies a
            JOIN satellites s ON a.agency_id = s.agency_id
        WHERE
            s.decommission_date IS NOT NULL
        GROUP BY
            a.agency_id
        HAVING
            COUNT(s.satellite_id) = (
            SELECT
                MAX(decommissioned_count)
            FROM
                (
                SELECT
                    agency_id,
                    COUNT(satellite_id) AS decommissioned_count
                FROM
                    satellites
                WHERE
                    decommission_date IS NOT NULL
                GROUP BY
                    agency_id
                ) AS counts
            WHERE
                counts.agency_id = a.agency_id
            );
      
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
        5;
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
        first_observation ASC;
        `)
    
        await sqldb.end();
    })();
});
