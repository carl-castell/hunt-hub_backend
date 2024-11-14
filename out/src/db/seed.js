"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const users_1 = require("./schema/users");
const faker_1 = require("@faker-js/faker");
require("dotenv/config");
const estates_1 = require("./schema/estates");
const _1 = require(".");
const drizzle_orm_1 = require("drizzle-orm");
const schema = __importStar(require("@/db/schema"));
function resetTable(db, table) {
    return __awaiter(this, void 0, void 0, function* () {
        return db.execute(drizzle_orm_1.sql.raw(`TRUNCATE TABLE ${(0, drizzle_orm_1.getTableName)(table)} RESTART IDENTITY CASCADE`));
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            for (const table of [
                schema.licensesTable,
                schema.standAssignmentTable,
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
                yield resetTable(_1.db, table);
            }
            console.log('> truncated tables \n> restarted identity \n ');
        }
        catch (error) {
            console.error('Error resetting tables:', error);
            process.exit(1);
        }
        console.log('> seeding started');
        const startTime = Date.now(); //start recording of seeding time
        //insert estates (hard coded)
        const estates = yield _1.db.insert(estates_1.estatesTable).values([
            {
                name: 'Bayrische Staats Forsten'
            },
            {
                name: 'Blauwald GmbH'
            }
        ]).returning();
        for (let index = 0; index < 10; index++) {
            const user = yield _1.db.insert(users_1.usersTable).values({
                firstName: faker_1.faker.person.firstName(),
                lastName: faker_1.faker.person.lastName(),
                email: `${index}${faker_1.faker.internet.email()}`,
                role: faker_1.faker.helpers.arrayElement(users_1.roleEnum.enumValues),
                password: faker_1.faker.internet.password({ length: 12 }),
                estateId: 1
            }).returning();
            process.stdout.write(`  ${index + 1} users inserted\r`);
        }
        const endTime = Date.now(); //stop recording of seeding time
        const duration = endTime - startTime; // calculate seeding time
        console.log('\n \x1b[32m%s\x1b[0m', `\n> seeding finished (${duration} ms) \n `);
        process.exit(0);
    });
}
main().then().catch(err => {
    console.error(err);
    process.exit(0);
});
