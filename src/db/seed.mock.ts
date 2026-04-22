import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { db } from '@/db';
import { estatesTable, usersTable, accountsTable, userAuthTokensTable } from '@/db/schema';

export async function seedMockData() {
  console.log('> Seeding mock data...');

  // 1. Create one estate
  const [estate] = await db
    .insert(estatesTable)
    .values({ name: faker.company.name() + ' Estate' })
    .returning();

  console.log(`  ✔ Estate created: "${estate.name}" (id: ${estate.id})`);

  // 2. Create the manager user
  const [manager] = await db
    .insert(usersTable)
    .values({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      role: 'manager',
      estateId: estate.id,
    })
    .returning();

  console.log(`  ✔ Manager created: ${manager.firstName} ${manager.lastName} (id: ${manager.id})`);

  // 3. Create the manager's account
  await db.insert(accountsTable).values({
    userId: manager.id,
    email: 'a@a.de',
    password: await bcrypt.hash('jjjjjjjj', 10),
    active: true,
  });

  console.log(`  ✔ Account created — email: a@a.de / password: jjjjjjjj`);

  // 4. Create an activation token (for testing the onboarding flow)
  const token = crypto.randomBytes(32).toString('hex');

  await db.insert(userAuthTokensTable).values({
    userId: manager.id,
    token,
    type: 'activation',
    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
  });

  console.log(`  ✔ Activation token created: ${token}`);
  console.log('> Mock data seeding complete.');
}
