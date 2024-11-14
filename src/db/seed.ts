
import { roleEnum, usersTable } from './schema/users';
import { faker } from '@faker-js/faker';
import "dotenv/config";
import { estatesTable } from './schema/estates';
import { db } from '.';
import { getTableName, sql, Table } from 'drizzle-orm';
import * as schema from '@/db/schema'


async function resetTable(db: db, table: Table) {
    return db.execute(
        sql.raw(`TRUNCATE TABLE ${getTableName(table)} RESTART IDENTITY CASCADE`)
    );
}

async function main() {

    try{
        
        for (const table of [
            schema.standsDriveTable,
            schema.standsGroupTable,
            schema.standsGuestTable,
            schema.licensesTable,
            schema.standsTable,
            schema.territorysTable,
            schema.drivesTable,
            schema.groupsTable,
            schema.usersTable,
            schema.invitationsTable,
            schema.drivesTable,
            schema.eventsTable,
            schema.guestsTable,
            schema.estatesTable
        ]) {

            await resetTable(db, table);
        }
        console.log('> truncated tables \n> restarted identity \n ')    
    } catch (error) {
        console.error('Error resetting tables:', error);
        process.exit(1);
    }
    console.log('> seeding started');
    const startTime = Date.now(); //start recording of seeding time

    
        //insert estates (hard coded)
        const estates = await db.insert(estatesTable).values([
            {
                name: 'Bayrische Staats Forsten'
            },
            {
                name: 'Blauwald GmbH'
            }
        ]).returning();

        

        for(let index=0; index<10; index++){
            const user = await db.insert(usersTable).values({
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
                email: `${index}${faker.internet.email()}`,
                role: faker.helpers.arrayElement(roleEnum.enumValues),
                password: faker.internet.password({length: 12}),
                estateId: 1
            }).returning();

            process.stdout.write(`  ${index + 1} users inserted\r`);
        }


        const endTime = Date.now(); //stop recording of seeding time
        const duration = endTime - startTime; // calculate seeding time

        console.log('\n \x1b[32m%s\x1b[0m',`\n> seeding finished (${duration} ms) \n `);
        process.exit(0)
}

main().then().catch(err=>{
    console.error(err);
    process.exit(0)
})