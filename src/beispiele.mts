import process from 'node:process';
import { PrismaPg } from '@prisma/adapter-pg';
import { prismaQueryInsights } from '@prisma/sqlcommenter-query-insights';
import {
    PrismaClient,
    type Fussballer,
    type Prisma,
} from './generated/prisma/client.ts';
import { styleText } from 'node:util';
import { FussballerGetPayload } from './generated/prisma/models/Fussballer';

let message = styleText (['blue', 'bgWhite'], 'Node version');
console.log(`${message}=${process.version}`);
message = styleText (['blue', 'bgWhite'], 'DATABASE_URL');
console.log(`${message}=${process.env['DATABASE_URL']}`);
console.log();

const adapter = new PrismaPg({
    connectionString: process.env['DATABASE_URL'],
});

const log: (Prisma.LogLevel | Prisma.LogDefinition)[] = [
    {
        level: 'query',
        emit: 'event',
    },
    'info',
    'error',
    'warn',
];

const prisma = new PrismaClient({
    adapter,
    errorFormat: 'pretty',
    log,
    comments: [prismaQueryInsights()],
});

prisma.$on('query', (e) => {
    message = styleText('green', `Query: ${e.query}`);
    console.log(message);
    message = styleText('cyan', `Duration: ${e.duration} ms`);
    console.log(message);
});

export type FussballerMitAdresseUndAuszeichnungen = Prisma.FussballerGetPayload<{
    include: {
        adresse: true;
        auszeichnungen: true;
    };
}>;

try {
    await prisma.$connect();

    const fussballer: Fussballer | null = await prisma.fussballer.findUnique({
        where: {id: 1},
    });
    message= styleText (['black', 'bgWhite'], 'fussballer');
    console.log(`${message} = %j`, fussballer);
    console.log();


    const fussballers: FussballerMitAdresseUndAuszeichnungen[] = await prisma.fussballer.findMany({
        where: {
            adresse: {
                ort: {
                    contains: 'n',
                }
            }
        }
    })
}
