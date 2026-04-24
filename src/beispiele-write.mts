// Copyright (C) 2025 - present Juergen Zimmermann, Hochschule Karlsruhe
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

// Aufruf:   bun i
//           bun --env-file=.env prisma generate
//
//           bun --env-file=.env src\beispiele-write.mts

import { PrismaPg } from '@prisma/adapter-pg';
import process from 'node:process';
import { styleText } from 'node:util';
import { PrismaClient, type Prisma } from './generated/prisma/client.ts';

let message = styleText(
    'yellow',
    `process.env['DATABASE_URL']=${process.env['DATABASE_URL']}`,
);
console.log(message);
console.log();

const adapter = new PrismaPg({
    connectionString: process.env['DATABASE_URL_ADMIN'],
});

const log: (Prisma.LogLevel | Prisma.LogDefinition)[] = [
    {
        emit: 'event',
        level: 'query',
    },
    'info',
    'warn',
    'error',
];

// PrismaClient fuer DB "fussballer" (siehe Umgebungsvariable DATABASE_URL in ".env")
// d.h. mit PostgreSQL-User "fussballer" und Schema "fussballer"
const prisma = new PrismaClient({
    adapter,
    errorFormat: 'pretty',
    log,
});
prisma.$on('query', (e) => {
    message = styleText('green', `Query: ${e.query}`);
    console.log(message);
    message = styleText('cyan', `Duration: ${e.duration} ms`);
    console.log(message);
});

const neuerFussballer: Prisma.FussballerCreateInput = {
    // Spaltentyp "text"
    nachname: 'Beispiel',
    // Spaltentyp "integer"
    version: 0,
    // Spaltentyp "enum('TORWART', ...)"
    position: 'STUERMER',
    // Datum im Format ISO8601 fuer Spaltentyp "date"
    geburtsdatum: '2000-02-28T00:00:00Z',
    nationalitaet: 'Deutschland',
    username: 'beispiel',
};
type FussballerCreated = Prisma.FussballerGetPayload<{}>; // eslint-disable-line @typescript-eslint/no-empty-object-type

const geaenderterFussballer: Prisma.FussballerUpdateInput = {
    version: { increment: 1 },
    nachname: 'Geaendert',
    nationalitaet: 'Frankreich',
    position: 'MITTELFELDSPIELER',
    username: 'geaendert',
};
type FussballerUpdated = Prisma.FussballerGetPayload<{}>; // eslint-disable-line @typescript-eslint/no-empty-object-type

// Schreib-Operationen mit dem Model "Fussballer"
try {
    await prisma.$connect();
    await prisma.$transaction(async (tx) => {
        // Neuer Datensatz mit generierter ID
        const fussballerDb: FussballerCreated = await tx.fussballer.create({
            data: neuerFussballer,
        });
        message = styleText(['black', 'bgWhite'], 'Generierte ID:');
        console.log(`${message} ${fussballerDb.id}`);
        console.log();

        // Version +1 wegen "Optimistic Locking" bzw. Vermeidung von "Lost Updates"
        const fussballerUpdated: FussballerUpdated = await tx.fussballer.update({
            data: geaenderterFussballer,
            where: { id: 30 },
        });
        // eslint-disable-next-line require-atomic-updates
        message = styleText(['black', 'bgWhite'], 'Aktualisierte Version:');
        console.log(`${message} ${fussballerUpdated.version}`);
        console.log();

        // https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/referential-actions#referential-action-defaults
        // https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/relation-mode
        const geloescht = await tx.fussballer.delete({ where: { id: 70 } });
        // eslint-disable-next-line require-atomic-updates
        message = styleText(['black', 'bgWhite'], 'Geloescht:');
        console.log(`${message} ${geloescht.id}`);
    });
} finally {
    await prisma.$disconnect();
}
