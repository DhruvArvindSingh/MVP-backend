/**
 * Quick MongoDB connection test
 * Run this to verify MongoDB is working: node test-mongo-connection.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_DATABASE_LINK;

if (!uri) {
    console.error('❌ MONGO_DATABASE_LINK not found in .env');
    process.exit(1);
}

console.log('🔗 Testing MongoDB connection...');
console.log('📍 URI:', uri.replace(/\/\/.*@/, '//***:***@'));

const client = new MongoClient(uri);

async function testConnection() {
    try {
        await client.connect();
        console.log('✅ MongoDB connected successfully!');

        // Test database access
        const db = client.db();
        const collections = await db.collections();
        console.log(`📊 Database: ${db.databaseName}`);
        console.log(`📁 Collections: ${collections.length}`);

        await client.close();
        console.log('🔌 Connection closed successfully');
    } catch (error) {
        console.error('❌ MongoDB connection failed:');
        console.error('Error:', error.message);
        process.exit(1);
    }
}

testConnection();
