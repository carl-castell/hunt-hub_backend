import { neon } from '@neondatabase/serverless';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { roleEnum, usersTable } from './schema/users';
import { faker } from '@faker-js/faker';
import "dotenv/config";
import { estatesTable } from './schema/estates';


async function main() {
    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql);

    console.log('seeding started');
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

        for(let index=0; index<100; index++){
            const user = await db.insert(usersTable).values({
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
                email: `${index}${faker.internet.email()}`,
                role: 'user',
                password: faker.internet.password({length: 12}),
                estateId: 1
            }).returning();

            process.stdout.write(`${index + 1} users inserted\r`);
        }


        const endTime = Date.now(); //stop recording of seeding time
        const duration = endTime - startTime; // calculate seeding time

        console.log('\x1b[32m%s\x1b[0m',`\nSeeding finished in ${duration} ms`);
        process.exit(0)
}

main().then().catch(err=>{
    console.error(err);
    process.exit(0)
})