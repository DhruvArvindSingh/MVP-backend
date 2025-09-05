# Prisma Database Setup

This project now includes Prisma support for both PostgreSQL and MongoDB databases. Here's how to set up and use them.

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# Legacy PostgreSQL connection (for backward compatibility)
DATABASE_LINK="postgresql://myuser:mypassword@localhost:5432/mydatabase"

# Prisma Database Connections
POSTGRES_DATABASE_LINK="postgresql://myuser:mypassword@localhost:5432/mydatabase"
MONGO_DATABASE_LINK="mongodb://username:password@localhost:27017/database_name?authSource=admin"

# JWT Configuration
JWT_SECRET="your-jwt-secret-key-here"
```

### Docker MongoDB Setup

If you're using the Docker MongoDB container, the connection uses these credentials:
- **Username**: `username`
- **Password**: `password`
- **Database**: `database_name`
- **Host**: `localhost`
- **Port**: `27017`
- **Important**: The `?authSource=admin` parameter is required because the user is stored in the `admin` database, not the target database

## Installation

Install the dependencies (already added to package.json):

```bash
npm install
# or
pnpm install
```

## Setup Commands

### 1. Generate Prisma Clients

Generate the Prisma clients for both databases:

```bash
npm run db:generate
```

This will generate:
- PostgreSQL client in `src/generated/postgres/`
- MongoDB client in `src/generated/mongo/`
- Automatically copy generated clients to `dist/generated/` for runtime use

### 2. Push Schema to Databases

For PostgreSQL:
```bash
npm run db:push:postgres
```

For MongoDB:
```bash
npm run db:push:mongo
```

### 3. Open Prisma Studio (Database Browser)

For PostgreSQL:
```bash
npm run db:studio:postgres
```

For MongoDB:
```bash
npm run db:studio:mongo
```

## Usage in Code

### PostgreSQL Client

```typescript
import { getPostgresClient, postgresDbReady } from './src/database/postgresClient';

// Wait for connection to be ready
await postgresDbReady;

// Get the client
const postgresClient = getPostgresClient();

if (postgresClient) {
    // Create a user
    const user = await postgresClient.user.create({
        data: {
            email: 'user@example.com',
            password: 'hashedPassword'
        }
    });

    // Find users
    const users = await postgresClient.user.findMany();

    // Create a file
    const file = await postgresClient.file.create({
        data: {
            userEmail: 'user@example.com',
            fileName: 'document.txt',
            fileContent: 'Hello World',
            isPasswordProtected: false
        }
    });
}
```

### MongoDB Client

```typescript
import { getMongoClient, mongoDbReady } from './src/database/mongoClient';

// Wait for connection to be ready
await mongoDbReady;

// Get the client
const mongoClient = getMongoClient();

if (mongoClient) {
    // Create a user
    const user = await mongoClient.user.create({
        data: {
            email: 'user@example.com',
            password: 'hashedPassword'
        }
    });

    // Find users
    const users = await mongoClient.user.findMany();

    // Create a file
    const file = await mongoClient.file.create({
        data: {
            userEmail: 'user@example.com',
            fileName: 'document.txt',
            fileContent: 'Hello World',
            isPasswordProtected: false
        }
    });
}
```

## Schema Files

- **PostgreSQL Schema**: `prisma/postgres.prisma`
- **MongoDB Schema**: `prisma/mongo.prisma`

Both schemas include the same models:
- `User` - User accounts with email and password
- `File` - Files associated with users

## Error Handling

Both clients include:
- Automatic reconnection with exponential backoff
- Connection health monitoring
- Graceful shutdown handling
- Comprehensive error logging

## Migration Notes

### From Existing PostgreSQL Setup

If you're migrating from the existing `pg` client setup in `src/database/index.ts`:

1. The new Prisma client provides type-safe database operations
2. Replace raw SQL queries with Prisma's query methods
3. The table structure remains the same, so existing data is compatible
4. You can run both systems in parallel during migration

### Schema Changes

To modify the database schema:

1. Edit the appropriate `.prisma` file
2. Run the push command to apply changes:
   ```bash
   npm run db:push:postgres
   # or
   npm run db:push:mongo
   ```

## Troubleshooting

1. **Connection Issues**: Check your environment variables
2. **Generation Errors**: Ensure database is accessible before running `db:generate`
3. **Type Errors**: Run `npm run db:generate` after schema changes
4. **Multiple Schemas**: Each database has its own schema file and generated client
5. **MongoDB Authentication**: If you get `SCRAM failure: Authentication failed`, ensure your `MONGO_DATABASE_LINK` uses the correct Docker container credentials with `authSource=admin` parameter (`mongodb://username:password@localhost:27017/database_name?authSource=admin`)
6. **MongoDB Transaction Issues**: If you encounter "Prisma needs to perform transactions, which requires your MongoDB server to be run as a replica set":
   - **Option 1 (Used)**: Remove Prisma relations from MongoDB schema to avoid transactions - suitable for standalone MongoDB
   - **Option 2**: Set up MongoDB as a replica set with keyfiles for full transaction support

## Available Scripts

- `npm run db:generate` - Generate both Prisma clients (PostgreSQL + MongoDB) and copy to dist
- `npm run db:generate:postgres` - Generate only PostgreSQL Prisma client
- `npm run db:generate:mongo` - Generate only MongoDB Prisma client
- `npm run copy-generated` - Copy generated Prisma clients to dist folder
- `npm run build` - Compile TypeScript and copy generated clients
- `npm run db:push:postgres` - Push PostgreSQL schema to database
- `npm run db:push:mongo` - Push MongoDB schema to database  
- `npm run db:studio:postgres` - Open PostgreSQL Prisma Studio
- `npm run db:studio:mongo` - Open MongoDB Prisma Studio
