import { env } from "./config/env.ts";
import app from './app.ts';
import { testDatabaseConnection } from "./database/connection.ts";

async function startServer(){
    try {
        await testDatabaseConnection();

        app.listen(env.PORT, () => {
            console.log(`✔ Server running on port ${env.PORT}`);
        });
    } catch (error) {
        console.error(`× Failed to start the server: ${error}`);
        process.exit(1);
    }
}

void startServer();