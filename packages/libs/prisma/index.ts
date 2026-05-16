import { PrismaClient } from "@prisma/client";

declare global {
  namespace globalThis {
    var prismadb: PrismaClient | undefined;
  }
}

const runtimeDatasources = { db: { url: process.env.DATABASE_URL } };

const prisma = new PrismaClient({ datasources: runtimeDatasources as any });

if (process.env.NODE_ENV !== "production") global.prismadb = prisma;

export default prisma;
