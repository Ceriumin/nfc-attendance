import mysql from 'mysql2/promise';
import type { PoolOptions } from 'mysql2';
import { env } from '../config/env.ts';

const dbConfig: PoolOptions = {
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};

export const db = mysql.createPool(dbConfig);

export async function testDatabaseConnection() {
    try {
        const connection = await db.getConnection();
        console.log('✔ Connected to the database');
        connection.release();
    } catch( err ) {
        console.error(`× Error connecting to the database: ${err}`);
        throw err;
    }
}