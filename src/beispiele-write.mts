import { PrismaPg } from '@prisma/adapter-pg';
import { styleText } from 'node:util';
import process from 'node:process';
import {
    PrismaClient,
    type Prisma } from './generated/prisma/client.ts';
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
        level: 'query',
        emit: 'event',
    },
    'warn',
    'error',
    'info',
];

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
    nachname: 'Schweizer',
    nationalitaet: 'Singapur',
    username: 'schweizer',
    position: 'VERTEIDIGER',
    geburtsdatum: '2005-03-22T00:00:00Z',
    adresse: {
        create: {
            plz: '79098',
            ort: 'Freiburg',
            bundesland: 'BW',
        },
    },
    auszeichnungen: {
        create: [
            {
                bezeichnung: 'Premier League MVP',
                saison: '2024/25',
            },
        ],
    },
};

type FussballerCreated = Prisma.FussballerGetPayload<{
    include: {
        adresse: true;
        auszeichnungen: true;
    };
}>;

const geaenderterFussballer: Prisma.FussballerUpdateInput = {
    version: { increment: 1 },
    nachname: 'Schneider',
    nationalitaet: 'Deutschland',
    position: 'VERTEIDIGER',
    geburtsdatum: '2004-10-01T00:00:00Z',
    username: 'schneider',
};

type FussballerUpdated = Prisma.FussballerGetPayload<{}>; // eslint-disable-line @typescript-eslint/no-empty-object-type

try {
    await prisma.$connect();
    await prisma.$transaction(async (tx) => {
        const fussballerDb: FussballerCreated = await tx.fussballer.create({
            data: neuerFussballer,
            include: { adresse: true, auszeichnungen: true },
        });
        message = styleText(['black', 'bgWhite'], 'Generierte ID:');
        console.log(`${message} ${fussballerDb.id}`);
        console.log();

        const fussballerUpdated: FussballerUpdated = await tx.fussballer.update({
            data: geaenderterFussballer,
            where: { id: 20 },
        });

        // eslint-disable-next-line require-atomic-updates
        message = styleText(['black', 'bgWhite'], 'Aktualisierte Version:');
        console.log(`${message} ${fussballerUpdated.version}`);
        console.log();

        const geloescht = await tx.fussballer.delete({ where: { id: 40 } });

        // eslint-disable-next-line require-atomic-updates
        message = styleText(['black', 'bgWhite'], 'Geloescht:');
        console.log(`${message} ${geloescht.id}`);
    });
} finally {
    await prisma.$disconnect();
}
