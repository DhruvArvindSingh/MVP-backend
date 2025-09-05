/**
 * Example usage of both PostgreSQL and MongoDB Prisma clients
 * This file demonstrates how to use the database clients in your application
 */

import { getPostgresClient, postgresDbReady } from './postgresClient';
import { getMongoClient, mongoDbReady } from './mongoClient';

// Example: Create a user in both databases
export async function createUserInBothDbs(email: string, password: string) {
    try {
        // Wait for both databases to be ready
        await Promise.all([postgresDbReady, mongoDbReady]);

        const postgresClient = getPostgresClient();
        const mongoClient = getMongoClient();

        const results = {
            postgres: null as any,
            mongo: null as any,
        };

        // Create user in PostgreSQL
        if (postgresClient) {
            results.postgres = await postgresClient.user.create({
                data: {
                    email,
                    password,
                }
            });
            console.log('✅ User created in PostgreSQL:', results.postgres.id);
        }

        // Create user in MongoDB
        if (mongoClient) {
            results.mongo = await mongoClient.user.create({
                data: {
                    email,
                    password,
                }
            });
            console.log('✅ User created in MongoDB:', results.mongo.id);
        }

        return results;
    } catch (error) {
        console.error('❌ Error creating user:', error);
        throw error;
    }
}

// Example: Get all users from both databases
export async function getAllUsersFromBothDbs() {
    try {
        await Promise.all([postgresDbReady, mongoDbReady]);

        const postgresClient = getPostgresClient();
        const mongoClient = getMongoClient();

        const results = {
            postgres: [] as any[],
            mongo: [] as any[],
        };

        // Get users from PostgreSQL
        if (postgresClient) {
            results.postgres = await postgresClient.user.findMany({
                // include: {
                //     files: true, // Include related files
                // }
            });
        }

        // Get users from MongoDB
        if (mongoClient) {
            results.mongo = await mongoClient.user.findMany();
        }

        return results;
    } catch (error) {
        console.error('❌ Error fetching users:', error);
        throw error;
    }
}

// Example: Create a file for a user
export async function createFileForUser(
    userEmail: string,
    fileName: string,
    fileContent: string,
    isPasswordProtected: boolean = false,
    database: 'postgres' | 'mongo' | 'both' = 'both'
) {
    try {
        const results = {
            postgres: null as any,
            mongo: null as any,
        };

        if (database === 'postgres' || database === 'both') {
            await postgresDbReady;
            const postgresClient = getPostgresClient();

            if (postgresClient) {
                results.postgres = await postgresClient.file.create({
                    data: {
                        userEmail,
                        fileName,
                        fileContent,
                        isPasswordProtected,
                    }
                });
                console.log('✅ File created in PostgreSQL:', results.postgres.id);
            }
        }

        if (database === 'mongo' || database === 'both') {
            await mongoDbReady;
            const mongoClient = getMongoClient();

            if (mongoClient) {
                results.mongo = await mongoClient.file.create({
                    data: {
                        userEmail,
                        fileName,
                        fileContent,
                        isPasswordProtected,
                    }
                });
                console.log('✅ File created in MongoDB:', results.mongo.id);
            }
        }

        return results;
    } catch (error) {
        console.error('❌ Error creating file:', error);
        throw error;
    }
}

// Example: Search for files across both databases
export async function searchFiles(searchTerm: string) {
    try {
        await Promise.all([postgresDbReady, mongoDbReady]);

        const postgresClient = getPostgresClient();
        const mongoClient = getMongoClient();

        const results = {
            postgres: [] as any[],
            mongo: [] as any[],
        };

        // Search in PostgreSQL
        if (postgresClient) {
            results.postgres = await postgresClient.file.findMany({
                where: {
                    OR: [
                        { fileName: { contains: searchTerm, mode: 'insensitive' } },
                        { fileContent: { contains: searchTerm, mode: 'insensitive' } },
                    ]
                }
                // include: {
                //     user: {
                //         select: {
                //             email: true,
                //             createdAt: true,
                //         }
                //     }
                // }
            });
        }

        // Search in MongoDB
        if (mongoClient) {
            results.mongo = await mongoClient.file.findMany({
                where: {
                    OR: [
                        { fileName: { contains: searchTerm, mode: 'insensitive' } },
                        { fileContent: { contains: searchTerm, mode: 'insensitive' } },
                    ]
                }
                // include: {
                //     user: {
                //         select: {
                //             email: true,
                //             createdAt: true,
                //         }
                //     }
                // }
            });
        }

        return results;
    } catch (error) {
        console.error('❌ Error searching files:', error);
        throw error;
    }
}

// Example: Database health check
export async function checkDatabaseHealth() {
    const health = {
        postgres: {
            connected: false,
            userCount: 0,
            fileCount: 0,
        },
        mongo: {
            connected: false,
            userCount: 0,
            fileCount: 0,
        }
    };

    try {
        // Check PostgreSQL
        const postgresClient = getPostgresClient();
        if (postgresClient) {
            await postgresClient.$queryRaw`SELECT 1`; // Simple health check
            health.postgres.connected = true;
            health.postgres.userCount = await postgresClient.user.count();
            health.postgres.fileCount = await postgresClient.file.count();
        }
    } catch (error) {
        console.warn('PostgreSQL health check failed:', error);
    }

    try {
        // Check MongoDB
        const mongoClient = getMongoClient();
        if (mongoClient) {
            await mongoClient.user.findFirst(); // Simple health check
            health.mongo.connected = true;
            health.mongo.userCount = await mongoClient.user.count();
            health.mongo.fileCount = await mongoClient.file.count();
        }
    } catch (error) {
        console.warn('MongoDB health check failed:', error);
    }

    return health;
}

