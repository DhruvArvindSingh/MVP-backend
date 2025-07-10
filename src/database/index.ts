import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const DATABASE_LINK = process.env.DATABASE_LINK as string;
const { Client } = pkg;

let client: InstanceType<typeof Client> | null = null;
let dbConnected = false;

async function initDb() {
    try {
        if (!DATABASE_LINK) {
            console.warn("⚠️  DATABASE_LINK not configured. Database features will be disabled.");
            return;
        }

        client = new Client(DATABASE_LINK);
        await client.connect();

        await client.query(`CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );`);

        dbConnected = true;
        console.log("✅ Database connected successfully");
    } catch (e) {
        console.warn("⚠️  Unable to connect to database. Database features will be disabled.");
        console.warn("Database error:", e instanceof Error ? e.message : e);
        client = null;
        dbConnected = false;
    }
}

// Initialize database connection (non-blocking)
initDb().catch(() => {
    // Error already handled in initDb
});

export default client;
export { dbConnected };
