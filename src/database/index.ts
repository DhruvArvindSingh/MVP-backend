import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const DATABASE_LINK = process.env.DATABASE_LINK as string;
const { Client } = pkg;

let client: InstanceType<typeof Client> | null = null;
let dbConnected = false;
let reconnectAttempts = 0;
let isReconnecting = false;
const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_RETRY_DELAY = 1000; // 1 second

// Helper function to calculate exponential backoff delay
function getRetryDelay(attempt: number): number {
    return Math.min(BASE_RETRY_DELAY * Math.pow(2, attempt), 30000); // Max 30 seconds
}

async function setupDatabase() {
    if (!client) return;

    try {
        await client.query(`CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );`);
    } catch (e) {
        console.error("Error setting up database tables:", e instanceof Error ? e.message : e);
    }
}

function setupConnectionHandlers() {
    if (!client) return;

    // Handle connection errors
    client.on('error', (err) => {
        console.error('💥 Database connection error:', err.message);
        dbConnected = false;
        handleDisconnection();
    });

    // Handle connection end/termination
    client.on('end', () => {
        console.warn('🔌 Database connection terminated');
        dbConnected = false;
        handleDisconnection();
    });
}

function handleDisconnection() {
    if (isReconnecting) {
        console.log('🔄 Reconnection already in progress, skipping...');
        return;
    }

    client = null;
    scheduleReconnect();
}

function scheduleReconnect() {
    if (isReconnecting) return;

    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.error(`❌ Max reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Giving up.`);
        isReconnecting = false;
        return;
    }

    isReconnecting = true;
    const delay = getRetryDelay(reconnectAttempts);
    reconnectAttempts++;

    console.log(`🔄 Scheduling database reconnection attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} in ${delay}ms`);

    setTimeout(async () => {
        try {
            await initDb();
        } catch (error) {
            console.error('Reconnection attempt failed:', error);
        } finally {
            isReconnecting = false;
        }
    }, delay);
}

async function initDb() {
    try {
        if (!DATABASE_LINK) {
            console.warn("⚠️  DATABASE_LINK not configured. Database features will be disabled.");
            return;
        }

        console.log("🔗 Attempting to connect to database...");
        client = new Client(DATABASE_LINK);
        await client.connect();

        // Setup connection event handlers
        setupConnectionHandlers();

        // Setup database tables
        await setupDatabase();

        dbConnected = true;
        reconnectAttempts = 0; // Reset on successful connection
        console.log("✅ Database connected successfully");
    } catch (e) {
        console.warn("⚠️  Unable to connect to database. Database features will be disabled.");
        console.warn("Database error:", e instanceof Error ? e.message : e);
        client = null;
        dbConnected = false;

        // Schedule reconnection attempt only if not already reconnecting
        if (!isReconnecting) {
            scheduleReconnect();
        }
    }
}

// Function to manually trigger reconnection (useful for testing)
export function reconnectDatabase() {
    if (client) {
        client.end();
    }
    reconnectAttempts = 0;
    isReconnecting = false;
    initDb();
}

// Initialize database connection (non-blocking)
initDb().catch(() => {
    // Error already handled in initDb
});

export default client;
export { dbConnected };
