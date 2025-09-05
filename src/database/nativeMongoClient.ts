import { MongoClient, Db, Collection } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB connection URL
const MONGO_DATABASE_LINK = process.env.MONGO_DATABASE_LINK as string;

if (!MONGO_DATABASE_LINK) {
    throw new Error('MONGO_DATABASE_LINK environment variable is required');
}

// Extract database name from connection string
const dbName = 'database_name'; // Default database name

// Global variables for connection management
let client: MongoClient | null = null;
let db: Db | null = null;

// Connection promise for initialization
export const nativeMongoDbReady: Promise<void> = initializeConnection();

async function initializeConnection(): Promise<void> {
    try {
        console.log('🔗 Attempting to connect to MongoDB database (Native Driver)...');

        client = new MongoClient(MONGO_DATABASE_LINK, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        await client.connect();
        db = client.db(dbName);

        // Test the connection
        await db.admin().ping();

        console.log('✅ MongoDB database connected successfully via Native Driver');
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB via Native Driver:', error);
        throw error;
    }
}

export function getNativeMongoClient(): Db | null {
    return db;
}

export function getUsersCollection(): Collection | null {
    if (!db) return null;
    return db.collection('User');
}

export function getFilesCollection(): Collection | null {
    if (!db) return null;
    return db.collection('File');
}

// Graceful shutdown
export async function disconnectNativeMongo(): Promise<void> {
    if (client) {
        try {
            await client.close();
            console.log('🔌 Native MongoDB client disconnected');
        } catch (error) {
            console.error('❌ Error disconnecting Native MongoDB client:', error);
        } finally {
            client = null;
            db = null;
        }
    }
}

// Handle process termination
process.on('SIGINT', async () => {
    await disconnectNativeMongo();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await disconnectNativeMongo();
    process.exit(0);
});
