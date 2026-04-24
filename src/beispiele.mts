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

// Aufruf:  bun i
//          bun --env-file=.env prisma generate
//
//          bun --env-file=.env src\beispiele.mts

import process from 'node:process';
import { styleText } from 'node:util';
import { PrismaPg } from '@prisma/adapter-pg';
import { prismaQueryInsights } from '@prisma/sqlcommenter-query-insights';
import {
    PrismaClient,
    type Fussballer,
    type Prisma,
} from './generated/prisma/client.ts';

let message = styleText(['black', 'bgWhite'], 'Node version');
console.log(`${message}=${process.version}`);
message = styleText(['black', 'bgWhite'], 'DATABASE_URL');
console.log(`${message}=${process.env['DATABASE_URL']}`);
console.log();

// "named parameter" durch JSON-Objekt
const adapter = new PrismaPg({
    connectionString: process.env['DATABASE_URL'],
});

// union type
const log: (Prisma.LogLevel | Prisma.LogDefinition)[] = [
    {
        // siehe unten: prisma.$on('query', ...);
        emit: 'event',
        level: 'query',
    },
    'info',
    'warn',
    'error',
];

// PrismaClient passend zur Umgebungsvariable DATABASE_URL in ".env"
// d.h. mit PostgreSQL-User "fussballer" und Schema "fussballer"
const prisma = new PrismaClient({
    // shorthand property
    adapter,
    errorFormat: 'pretty',
    log,
    // Kommentar zu Log-Ausgabe:
    // /*prismaQuery='Fussballer.findMany%3A...
    comments: [prismaQueryInsights()],
});
prisma.$on('query', (e) => {
    message = styleText('green', `Query: ${e.query}`);
    console.log(message);
    message = styleText('cyan', `Duration: ${e.duration} ms`);
    console.log(message);
});

export type FussballerMitAdresseUndAuszeichnungen =
    Prisma.FussballerGetPayload<{}>; // eslint-disable-line @typescript-eslint/no-empty-object-type

// Operationen mit dem Model "Fussballer"
try {
    await prisma.$connect();

    // Das Resultat ist null, falls kein Datensatz gefunden
    const fussballer: Fussballer | null = await prisma.fussballer.findUnique({
        where: { id: 1 },
    });
    message = styleText(['black', 'bgWhite'], 'fussballer');
    console.log(`${message} = %j`, fussballer);
    console.log();

    // SELECT *
    // FROM   fussballer
    // WHERE  nachname LIKE "%e%"
    const fussballerListe: FussballerMitAdresseUndAuszeichnungen[] =
        await prisma.fussballer.findMany({
        where: {
            nachname: {
                // https://www.prisma.io/docs/orm/reference/prisma-client-reference#filter-conditions-and-operators
                contains: 'e',
            },
        },
    });
    message = styleText(['black', 'bgWhite'], 'fussballerListe');
    console.log(`${message} = %j`, fussballerListe);
    console.log();

    // higher-order function und arrow function
    const nationalitaeten = fussballerListe.map((f) => f.nationalitaet);
    message = styleText(['black', 'bgWhite'], 'nationalitaeten');
    console.log(`${message} = %j`, nationalitaeten);
    console.log();

    // union type
    const usernames = fussballerListe.map((f) => f.username);
    message = styleText(['black', 'bgWhite'], 'usernames');
    console.log(`${message} = %j`, usernames);
    console.log();

    // Pagination
    const fussballerPage2: Fussballer[] = await prisma.fussballer.findMany({
        skip: 5,
        take: 5,
    });
    message = styleText(['black', 'bgWhite'], 'fussballerPage2');
    console.log(`${message} = %j`, fussballerPage2);
    console.log();
} finally {
    await prisma.$disconnect();
}

// PrismaClient mit PostgreSQL-User "postgres", d.h. mit Administrationsrechten
const adapterAdmin = new PrismaPg({
    connectionString: process.env['DATABASE_URL_ADMIN'],
});
const prismaAdmin = new PrismaClient({ adapter: adapterAdmin });
try {
    const fussballerAdmin: Fussballer[] = await prismaAdmin.fussballer.findMany({
        where: {
            nachname: {
                contains: 'e',
            },
        },
    });
    message = styleText(['black', 'bgWhite'], 'fussballerAdmin');
    console.log(`${message} = ${JSON.stringify(fussballerAdmin)}`);
} finally {
    await prismaAdmin.$disconnect();
}
