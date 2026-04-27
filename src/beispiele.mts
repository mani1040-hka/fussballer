import process from 'node:process';
import { PrismaPg } from '@prisma/adapter-pg';
import { prismaQueryInsights } from '@prisma/sqlcommenter-query-insights';
import {
    PrismaClient,
    type Fussballer,
    type Prisma,
} from './generated/prisma/client.ts';
import { styleText } from 'node:util';

let message = styleText (['blue', 'bgWhite'], 'Node version');
console.log(`${message}=${process.version}`);
message = styleText (['blue', 'bgWhite'], 'DATABASE_URL');
console.log(`${message}=${process.env['DATABASE_URL']}`);
console.log();