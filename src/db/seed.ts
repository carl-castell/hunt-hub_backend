import 'dotenv/config';
import { faker, fakerDE } from '@faker-js/faker';
import * as fs from 'fs/promises';

import { db, pool } from './index';
import * as schema from './schema';

import { roleEnum, usersTable } from './schema/users';
import { estatesTable } from './schema/estates';

import { getTableName, sql, Table } from 'drizzle-orm';

// Reset a single table
async function resetTable(table: Table) {
  return db.execute(
    sql.raw(`TRUNCATE TABLE ${getTableName(table)} RESTART IDENTITY CASCADE`)
  );
}

async function main() {
  try {
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
      schema.eventsTable,
      schema.guestsTable,
      schema.estatesTable,
    ]) {
      await resetTable(table);
    }
    console.log('> truncated tables \n> restarted identity \n ');
  } catch (error) {
    console.error('Error resetting tables:', error);
    process.exit(1);
  }

  console.log('> seeding started');
  const startTime = Date.now();

  const estates = await readEstatesFromFile('./src/db/data/estates.json');
  let estateId = 1;
  for (const estate of estates) {
    await db.insert(estatesTable).values(estate).returning();
    console.log(`Inserted estate: ${estate.name}`);
    await users(10, estateId);
    await guests(40, estateId);
    await territories(3, estateId);
    await events(4, estateId);
    estateId++;
  }

  const groups = await readGroupsFromFile('./src/db/data/groups.json');
  for (const group of groups) {
    if (group.driveId == null) {
      console.error(`Invalid driveId for group: ${group.name}`);
      continue;
    }
    await db.insert(schema.groupsTable).values(group).returning();
  }

  await standsDrive(40);
  await standsGroup(10);
  await standsGuest(39);
  await invitations(100);

  const endTime = Date.now();
  const duration = endTime - startTime;
  console.log('\n \x1b[32m%s\x1b[0m', `\n> seeding finished (${duration} ms) \n `);
}

// Users
async function users(num: number, id: number) {
  for (let index = 0; index < num; index++) {
    await db
      .insert(usersTable)
      .values({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: `${index}${faker.internet.email()}`,
        role: faker.helpers.arrayElement(roleEnum.enumValues),
        password: faker.internet.password({ length: 12 }),
        estateId: id,
      })
      .returning();
    process.stdout.write(`  ${index + 1} users inserted\r`);
  }
}

// Guests
async function guests(num: number, id: number) {
  for (let index = 0; index < num; index++) {
    await db
      .insert(schema.guestsTable)
      .values({
        firstName: fakerDE.person.firstName(),
        lastName: fakerDE.person.lastName(),
        email: `${index}${faker.internet.email()}`,
        phone: fakerDE.phone.imei(),
        estateId: id,
      })
      .returning();
    process.stdout.write(`  ${index + 1} guests inserted\r`);
  }
}

// Territories (spelling corrected)
async function territories(num: number, id: number) {
  let territoryId = 1;
  for (let index = 0; index < num; index++) {
    await db
      .insert(schema.territoriesTable)
      .values({
        territoryName: `Revier ${fakerDE.location.city()}`,
        estateId: id,
      })
      .returning();
    process.stdout.write(`  ${index + 1} territories inserted\r`);
    await stands(50, territoryId);
    territoryId++;
  }
}

// Events
async function events(num: number, id: number) {
  let eventId = 1;
  for (let index = 0; index < num; index++) {
    await db
      .insert(schema.eventsTable)
      .values({
        eventName: 'Drückjagd',
        estateId: id,
        date: faker.date.future().toISOString(),
        time: '08:00:00',
      })
      .returning();
    process.stdout.write(`  ${index + 1} events inserted\r`);
    await drives(1, eventId);
    eventId++;
  }
}

// Stands
async function stands(num: number, id: number) {
  let standId = 1;
  for (let index = 0; index < num; index++) {
    await db
      .insert(schema.standsTable)
      .values({
        territoryId: id,
        number: standId.toString(),
      })
      .returning();
    process.stdout.write(`  ${index + 1} stands inserted\r`);
    standId++;
  }
}

// Drives
async function drives(num: number, id: number) {
  for (let index = 0; index < num; index++) {
    await db
      .insert(schema.drivesTable)
      .values({
        eventId: id,
        startTime: '08:30:00',
        endTime: '12:00:00',
      })
      .returning();
    process.stdout.write(`  ${index + 1} drives inserted\r`);
  }
}

// Read helpers
async function readEstatesFromFile(filePath: string): Promise<{ name: string }[]> {
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

async function readGroupsFromFile(
  filePath: string
): Promise<{ driveId: number; leaderId: number; name: string }[]> {
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

// Invitations
async function invitations(num: number) {
  let invitationGuestId = 1;
  for (let index = 0; index < num; index++) {
    await db
      .insert(schema.invitationsTable)
      .values({
        eventId: 1,
        status: faker.helpers.arrayElement(schema.statusEnum.enumValues),
        guestId: invitationGuestId,
        rsvpDate: faker.date.future().toISOString(),
      })
      .returning();
    process.stdout.write(`  ${index + 1} invitations inserted\r`);
    await drives(1, invitationGuestId);
    invitationGuestId++;
  }
}

// Assign helpers
async function standsDrive(num: number) {
  let standDriveId = 1;
  for (let index = 0; index < num; index++) {
    await db
      .insert(schema.standsDriveTable)
      .values({
        driveId: 1,
        standId: standDriveId,
      })
      .returning();
    process.stdout.write(`  ${index + 1} stands assigned to drive 1\r`);
    standDriveId++;
  }
}

async function standsGroup(num: number) {
  let standGroupId = 1;
  for (let index = 0; index < num; index++) {
    await db
      .insert(schema.standsGroupTable)
      .values({
        groupId: 1,
        standId: standGroupId,
      })
      .returning();
    process.stdout.write(`  ${index + 1} stands assigned to group 1\r`);
    standGroupId++;
  }
}

async function standsGuest(num: number) {
  let standGuestId = 1;
  for (let index = 0; index < num; index++) {
    await db
      .insert(schema.standsGuestTable)
      .values({
        guestId: standGuestId,
        standId: standGuestId,
      })
      .returning();
    process.stdout.write(`  ${index + 1} stands assigned to guest\r`);
    standGuestId++;
  }
}

main()
  .then(async () => {
    if (pool) await pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error(err);
    if (pool) await pool.end();
    process.exit(1);
  });
