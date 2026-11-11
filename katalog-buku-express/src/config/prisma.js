import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

// Satu PrismaClient dipakai bersama oleh semua request.
export const prisma = new PrismaClient();
