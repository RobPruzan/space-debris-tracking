import {db} from "./db"
import { sql } from 'drizzle-orm' 

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
import { date } from "drizzle-orm/mysql-core"

/*

insert queries

*/
// await db.execute(sql`INSERT INTO agencies (agency_id,agency_name, headquarters, founded_year, contact_info) VALUES (69420,'SpaceX', 'Hawthorne, California, USA', 2002, 'contact@spacex.com');`);
await db.insert(TBagencies).values({ agencyId : 42069, agencyName: 'SpaceX', headquarters: 'Hawthorne, California, USA', foundedYear: 2002, contactInfo: 'contact@spacex.com' }).execute();

await db.insert(TBagencies).values({ agencyId : 69420, agencyName: 'NASA', headquarters: 'Washington, DC', foundedYear: 1958, contactInfo: 'hq-civilrightsinfo@mail.nasa.gov’' })

await db.insert(TBsatellites).values([{ satelliteId: 696969, agencyId: 69420, name: 'Starlink-1', launchDate: 1294835000000, orbitType: 'LEO', decommissionDate: 1746222200000 }]);


