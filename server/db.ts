import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.log('No DATABASE_URL found. Using mock mode - database operations will use in-memory storage.');
}

let pool: Pool;
let db: any;

if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else {
  // Mock db for compatibility, though storage uses mock
  db = {
    select: () => ({
      from: () => ({
        where: () => ({
          // Return empty for DB-dependent calls, but since storage is mocked, this may not be hit
        })
      })
    }),
    insert: () => ({
      values: () => ({
        returning: () => Promise.resolve([])
      })
    }),
    update: () => ({
      set: () => ({
        where: () => ({
          returning: () => Promise.resolve([])
        })
      })
    }),
    delete: () => ({
      where: () => Promise.resolve({ rowCount: 0 })
    })
  };
}

export { pool, db };
