import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Support Vercel serverless writable SQLite (/tmp)
if (process.env.VERCEL || process.env.DATABASE_URL?.includes("/tmp/")) {
  const tmpDb = "/tmp/dev.db";
  if (!fs.existsSync(tmpDb)) {
    const candidates = [
      path.join(process.cwd(), "prisma", "dev.db"),
      path.join(__dirname, "..", "..", "prisma", "dev.db"),
      path.join(__dirname, "..", "prisma", "dev.db"),
      path.join(__dirname, "prisma", "dev.db"),
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        try {
          fs.copyFileSync(p, tmpDb);
          break;
        } catch (err) {
          console.error("Failed to copy dev.db to /tmp:", err);
        }
      }
    }
  }
}

// Singleton Prisma client (hindari hot-reload buka banyak koneksi di dev)
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
