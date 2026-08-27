import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath} from "node:url";
import { db } from "./connection.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationsDirectory = path.join(__dirname, "migrations");

async function ensureMigrationsTable() {
    await db.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      run_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function getAppliedMigrations() {
    const [rows] = await db.query("SELECT name FROM migrations");

    return new Set(
        (rows as Array<{ name: string }>).map((row) => row.name)
    );
}

async function getMigrationFiles(){
    const files = await fs.readdir(migrationsDirectory);

    return files.filter((file) => file.endsWith(".sql"));
}

async function runMigrations(fileName: string) {
    const filePath = path.join(migrationsDirectory, fileName);
    const sql = await fs.readFile(filePath, "utf-8");

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        await connection.query(sql);

        await connection.query(
            "INSERT INTO migrations (name) VALUES (?)",
            [fileName]
        );

        await connection.commit();

        console.log(`✔ Applied migration: ${fileName}`);
    } catch(err) {
        await connection.rollback();

        console.error(`× Failed migration: ${fileName}`);
        throw err;
    } finally {
        connection.release();
    }
}

async function migrate(){
    await ensureMigrationsTable();

    const appliedMigrations = await getAppliedMigrations();
    const migrationFiles = await getMigrationFiles();

    for(const fileName of migrationFiles){
        if (appliedMigrations.has(fileName)) {
            console.log(`⏭ Skipping already applied migration: ${fileName}`);
            continue;
        }

        console.log(`◇ Running migration: ${fileName}`);
        await runMigrations(fileName);
    }

    console.log("✔ Migrations complete.");
    await db.end();
}

migrate().catch(async (error) => {
    console.error(error);

    await db.end();

    process.exit(1);
});