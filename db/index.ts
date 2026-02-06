import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { ensureSchema } from './init';

// Durante el build, puede que no tengamos DATABASE_URL configurada
// Creamos una conexión condicional
let dbInstance: NeonHttpDatabase<typeof schema>;

if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL no está configurada. La base de datos no estará disponible.');

    // Recursive proxy to handle deep access like db.query.users.findFirst() without crashing on undefined
    const createRecursiveProxy = (path: string[] = []): any => {
        return new Proxy(() => { }, {
            get: (_, prop) => {
                if (prop === 'then' || prop === 'catch' || typeof prop === 'symbol') return undefined;
                return createRecursiveProxy([...path, String(prop)]);
            },
            apply: () => {
                throw new Error(`DATABASE_URL no está configurada. Intento de ejecutar: ${path.join('.')}`);
            }
        });
    };

    dbInstance = createRecursiveProxy(['db']) as any;
} else {
    const sql = neon(process.env.DATABASE_URL);
    try {
        // En desarrollo, intentamos asegurar el schema
        // En producción podriamos saltar esto si usamos migraciones
        ensureSchema(sql as any).catch(err => {
            console.warn('[DB] Schema check failed (might be fine if already exists):', err);
        });
    } catch (e) {
        console.warn('[DB] Failed to ensure schema:', e);
    }
    dbInstance = drizzle(sql, { schema });
}

export const db = dbInstance;
