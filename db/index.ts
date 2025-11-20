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
    // Crear un proxy que no falle en la inicialización, solo al ejecutar queries
    dbInstance = new Proxy({} as any, {
        get: (target, prop) => {
            // Permitir acceso a propiedades durante inicialización
            if (prop === 'then' || prop === 'catch' || typeof prop === 'symbol') return undefined;

            // Devolver una función dummy para métodos como select, insert, etc.
            return () => {
                throw new Error('DATABASE_URL no está configurada. Por favor configurala en .env.local para usar la base de datos.');
            };
        }
    });
} else {
    const sql = neon(process.env.DATABASE_URL);
    try {
        await ensureSchema(sql as any);
        console.info('[DB] Schema ensured');
    } catch (e) {
        console.warn('[DB] Failed to ensure schema:', e);
    }
    dbInstance = drizzle(sql, { schema });
}

export const db = dbInstance;
