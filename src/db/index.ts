import { Pool } from "pg";
import { PGlite } from "@electric-sql/pglite";
import { CREATE_TABLES_SQL } from "./schema";
import { seedDatabase } from "./seed";
import path from "path";
import fs from "fs";

let poolInstance: Pool | null = null;
let pgliteInstance: PGlite | null = null;
let initialized = false;

interface QueryResult {
  rows: any[];
  rowCount?: number;
}

export async function getDb() {
  if (!initialized) {
    await initDb();
  }

  return {
    query: async (text: string, params: any[] = []): Promise<QueryResult> => {
      if (poolInstance) {
        const res = await poolInstance.query(text, params);
        return { rows: res.rows, rowCount: res.rowCount ?? res.rows.length };
      } else if (pgliteInstance) {
        const res = await pgliteInstance.query(text, params);
        return { rows: res.rows || [], rowCount: res.affectedRows || res.rows?.length || 0 };
      } else {
        throw new Error("Database connection has not been initialized.");
      }
    },
  };
}

async function initDb() {
  if (initialized) return;

  const dbUrl = process.env.DATABASE_URL;

  if (dbUrl && dbUrl.trim().length > 0) {
    console.log("[DB] Connecting to PostgreSQL via Pool (DATABASE_URL)");
    poolInstance = new Pool({
      connectionString: dbUrl,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    });
    await poolInstance.query(CREATE_TABLES_SQL);
    await seedDatabase({
      query: (t: string, p: any[]) => poolInstance!.query(t, p),
    });
  } else {
    console.log("[DB] Initializing PGLite Embedded PostgreSQL Engine");
    const dataDir = process.env.PGDATA_DIR || path.join(process.cwd(), ".data", "postgres");
    if (!fs.existsSync(/*turbopackIgnore: true*/ dataDir)) {
      fs.mkdirSync(/*turbopackIgnore: true*/ dataDir, { recursive: true });
    }

    pgliteInstance = new PGlite(dataDir);
    await pgliteInstance.waitReady;
    await pgliteInstance.exec(CREATE_TABLES_SQL);
    await seedDatabase({
      query: (t: string, p: any[]) => pgliteInstance!.query(t, p),
    });
  }

  initialized = true;
}
