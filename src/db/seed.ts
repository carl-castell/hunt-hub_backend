
import { roleEnum, usersTable } from './schema/users';
import { faker, fakerDE } from '@faker-js/faker';
import "dotenv/config";
import { estatesTable } from './schema/estates';
import { db } from '.';
import { getTableName, sql, Table } from 'drizzle-orm';
import * as schema from '@/db/schema'
import * as fs from 'fs/promises';

// main function
async function main() {
    try{
        for (const table of [
            schema.standsDriveTable,
            schema.standsGroupTable,
            schema.standsGuestTable,
            schema.trainingCertificatesTable,
            schema.licensesTable,
            schema.standsTable,
            schema.territoriesTable,
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
    const startTime = Date.now();
    

    
    const estates = await readEstatesFromFile('./src/db/data/estates.json');
    let estateId = 1
    for (const estate of estates) {
        await db.insert(estatesTable).values(estate).returning();
        console.log(`Inserted estate: ${estate.name}`);
        await users(10, estateId);
        await guests(40,estateId);
        await terretories(3, estateId);
        await events(4, estateId);
        estateId++
    }
    
    const groups = await readGroupsFromFile('./src/db/data/groups.json');
        for (const group of groups) {
            if (group.driveId == null) {
                console.error(`Invalid driveId for group: ${group.name}`);
                continue; // Skip this group if driveId is not valid
            }

            await db.insert(schema.groupsTable).values(group).returning();
        }
    await standsDrive(40);
    await standsGroup(10);
    await standsGuest(39);
    await invitations(100)

        const endTime = Date.now(); //stop recording of seeding time
        const duration = endTime - startTime; // calculate seeding time

        console.log('\n \x1b[32m%s\x1b[0m',`\n> seeding finished (${duration} ms) \n `);
        process.exit(0)
}



//function to reset db
async function resetTable(db: db, table: Table) {
    return db.execute(
        sql.raw(`TRUNCATE TABLE ${getTableName(table)} RESTART IDENTITY CASCADE`)
    );
}
//create users
async function users(num: number, id: number) {
    for(let index=0; index<num; index++){
        const user = await db.insert(usersTable).values({
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: `${index}${faker.internet.email()}`,
            role: faker.helpers.arrayElement(roleEnum.enumValues),
            password: faker.internet.password({length: 12}),
            estateId: id
        }).returning();

        process.stdout.write(`  ${index + 1} users inserted\r`);
    }
}
//create guests
async function guests(num: number, id: number) {
    for(let index=0; index<num; index++){
        const guest = await db.insert(schema.guestsTable).values({
            firstName: fakerDE.person.firstName(),
            lastName: fakerDE.person.lastName(),
            email: `${index}${faker.internet.email()}`,
            phone: fakerDE.phone.imei(),
            estateId: id
        }).returning();

        process.stdout.write(`  ${index + 1} guests inserted\r`);
    }
}
//create territories
async function terretories(num: number, id: number) {
    let territoryId = 1
    for(let index=0; index<num; index++){
        const guest = await db.insert(schema.territoriesTable).values({
            territoryName: `Revier ${fakerDE.location.city()}`,
            estateId: id
        }).returning();

        process.stdout.write(`  ${index + 1} territories inserted\r`);
        await stands(50, territoryId);
        territoryId++
    }
}
//create events
async function events(num: number, id: number) {
    let eventId = 1
    for(let index=0; index<num; index++){
        const guest = await db.insert(schema.eventsTable).values({
            eventName: 'Drückjagd',
            estateId: id,
            date: faker.date.future().toISOString(),
            time: '08:00:00',
        }).returning();

        process.stdout.write(`  ${index + 1} events inserted\r`);
        await drives(1, eventId);
        eventId++
    }
}
//create stands
async function stands(num: number, id: number) {
    let standId = 1
    for(let index=0; index<num; index++){
        const stand = await db.insert(schema.standsTable).values({
            territoryId: id,
            number: standId.toString(),
            
        }).returning();

        process.stdout.write(`  ${index + 1} stands inserted\r`);
        standId++
    }
}
//create drives
async function drives(num: number, id: number) {
    for(let index=0; index<num; index++){
        const drive = await db.insert(schema.drivesTable).values({
            eventId: id,
            startTime: '08:30:00',
            endTime: '12:00:00',
        }).returning();

        process.stdout.write(`  ${index + 1} drives inserted\r`);
    }
}


//read estates from JSON file
async function readEstatesFromFile(filePath: string): Promise<{ name: string }[]> {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
}

//read groups from json
async function readGroupsFromFile(filePath: string): Promise<{ driveId: number, leaderId: number, name: string }[]> {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
}
//create invitations for eventId = 1 
async function invitations(num: number) {
    let invitationGuestId = 1
    for(let index=0; index<num; index++){
        const invitation = await db.insert(schema.invitationsTable).values({
            eventId: 1,
            status: faker.helpers.arrayElement(schema.statusEnum.enumValues),
            guestId: invitationGuestId,
            rsvpDate: faker.date.future().toISOString(),
        }).returning();

        process.stdout.write(`  ${index + 1} invitations inserted\r`);
        await drives(1, invitationGuestId);
        invitationGuestId++
    }
}
//asign stands drive
async function standsDrive(num: number) {
    let standDriveId = 1
    for(let index=0; index<num; index++){
        const stand = await db.insert(schema.standsDriveTable).values({
            driveId: 1,
            standId: standDriveId,
        }).returning();

        process.stdout.write(`  ${index + 1} stands asigned to drive 1\r`);
        standDriveId++
    }
}
//asign stands group
async function standsGroup(num: number) {
    let standGroupId = 1
    for(let index=0; index<num; index++){
        const stand = await db.insert(schema.standsGroupTable).values({
            groupId: 1,
            standId: standGroupId,
        }).returning();

        process.stdout.write(`  ${index + 1} stands asigned to group 1\r`);
        standGroupId++
    }
}
//asign stands guest
async function standsGuest(num: number) {
    let standGuestId = 1
    for(let index=0; index<num; index++){
        const stand = await db.insert(schema.standsGuestTable).values({
            guestId: standGuestId,
            standId: standGuestId,
        }).returning();

        process.stdout.write(`  ${index + 1} stands asigned to group 1\r`);
        standGuestId++
    }
}


main().then().catch(err=>{
    console.error(err);
    process.exit(0)
})

