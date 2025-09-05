import { PrismaClient } from '../generated/mongo/index.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_DATABASE_LINK = process.env.MONGO_DATABASE_LINK as string;

let mongoClient: PrismaClient | null = null;
let isConnected = false;
let reconnectAttempts = 0;
let isReconnecting = false;
const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_RETRY_DELAY = 1000; // 1 second

let resolveDbReady: () => void;
const mongoDbReady = new Promise<void>((resolve) => {
    resolveDbReady = resolve;
});

// Helper function to calculate exponential backoff delay
function getRetryDelay(attempt: number): number {
    return Math.min(BASE_RETRY_DELAY * Math.pow(2, attempt), 30000); // Max 30 seconds
}

function setupConnectionHandlers() {
    if (!mongoClient) return;

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
        if (mongoClient) {
            await mongoClient.$disconnect();
            console.log('🔌 MongoDB Prisma client disconnected');
        }
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        if (mongoClient) {
            await mongoClient.$disconnect();
            console.log('🔌 MongoDB Prisma client disconnected');
        }
        process.exit(0);
    });
}

function handleDisconnection() {
    if (isReconnecting) {
        console.log('🔄 MongoDB reconnection already in progress, skipping...');
        return;
    }

    mongoClient = null;
    isConnected = false;
    scheduleReconnect();
}

function scheduleReconnect() {
    if (isReconnecting) return;

    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.error(`❌ MongoDB max reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Giving up.`);
        isReconnecting = false;
        return;
    }

    isReconnecting = true;
    const delay = getRetryDelay(reconnectAttempts);
    reconnectAttempts++;

    console.log(`🔄 Scheduling MongoDB reconnection attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} in ${delay}ms`);

    setTimeout(async () => {
        try {
            await initMongoClient();
        } catch (error) {
            console.error('MongoDB reconnection attempt failed:', error);
        } finally {
            isReconnecting = false;
        }
    }, delay);
}

async function initMongoClient() {
    try {
        if (!MONGO_DATABASE_LINK) {
            console.warn("⚠️  MONGO_DATABASE_LINK not configured. MongoDB features will be disabled.");
            return;
        }

        console.log("🔗 Attempting to connect to MongoDB database...");
        mongoClient = new PrismaClient({
            datasources: {
                db: {
                    url: MONGO_DATABASE_LINK
                }
            },
            log: ['error', 'warn'],
        });

        // Test the connection
        await mongoClient.$connect();

        // Setup connection event handlers
        setupConnectionHandlers();

        isConnected = true;
        reconnectAttempts = 0; // Reset on successful connection
        console.log("✅ MongoDB database connected successfully via Prisma");
        resolveDbReady();
    } catch (e) {
        console.warn("⚠️  Unable to connect to MongoDB database. MongoDB features will be disabled.");
        console.warn("MongoDB database error:", e instanceof Error ? e.message : e);
        mongoClient = null;
        isConnected = false;

        // Schedule reconnection attempt only if not already reconnecting
        if (!isReconnecting) {
            scheduleReconnect();
        }
    }
}

// Function to manually trigger reconnection (useful for testing)
export function reconnectMongoDatabase() {
    if (mongoClient) {
        mongoClient.$disconnect();
    }
    reconnectAttempts = 0;
    isReconnecting = false;
    initMongoClient();
}

// Function to get the client instance
export function getMongoClient(): PrismaClient | null {
    return mongoClient;
}

// Initialize database connection (non-blocking)
initMongoClient().catch(() => {
    // Error already handled in initMongoClient
});

export { mongoClient, isConnected as mongoConnected, mongoDbReady, initMongoClient };
export default mongoClient;
