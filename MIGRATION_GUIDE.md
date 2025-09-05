# Migration Guide: From pg Client to Prisma

This guide helps you migrate from the existing `pg` client setup to the new Prisma clients.

## Before Migration

The current setup uses:
- Raw PostgreSQL client from `pg` package
- Manual SQL queries
- Custom connection handling in `src/database/index.ts`

## After Migration

The new setup provides:
- Type-safe database operations with Prisma
- Automatic query generation
- Better error handling and reconnection logic
- Support for both PostgreSQL and MongoDB

## Step-by-Step Migration

### 1. Install Dependencies

```bash
npm install @prisma/client prisma
```

### 2. Generate Prisma Clients

```bash
npm run db:generate
```

### 3. Update Your Controllers

#### Before (Raw SQL):
```typescript
import client from '../database/index.js';

// Raw SQL query
const result = await client.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
);
const user = result.rows[0];
```

#### After (Prisma):
```typescript
import { getPostgresClient, postgresDbReady } from '../database/postgresClient.js';

// Wait for connection
await postgresDbReady;
const prisma = getPostgresClient();

// Type-safe query
const user = await prisma?.user.findUnique({
    where: { email }
});
```

### 4. Common Query Patterns

#### Creating Records

**Before:**
```typescript
await client.query(
    'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *',
    [email, hashedPassword]
);
```

**After:**
```typescript
const user = await prisma?.user.create({
    data: {
        email,
        password: hashedPassword
    }
});
```

#### Finding Records

**Before:**
```typescript
const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
const user = result.rows[0];
```

**After:**
```typescript
const user = await prisma?.user.findUnique({
    where: { email }
});
```

#### Updating Records

**Before:**
```typescript
await client.query(
    'UPDATE users SET password = $1 WHERE email = $2',
    [newPassword, email]
);
```

**After:**
```typescript
await prisma?.user.update({
    where: { email },
    data: { password: newPassword }
});
```

#### Deleting Records

**Before:**
```typescript
await client.query('DELETE FROM users WHERE email = $1', [email]);
```

**After:**
```typescript
await prisma?.user.delete({
    where: { email }
});
```

#### Complex Queries with Joins

**Before:**
```typescript
const result = await client.query(`
    SELECT u.*, f.file_name, f.file_content 
    FROM users u 
    LEFT JOIN files f ON u.email = f.user_email 
    WHERE u.email = $1
`, [email]);
```

**After:**
```typescript
const userWithFiles = await prisma?.user.findUnique({
    where: { email },
    include: {
        files: true
    }
});
```

### 5. Update Specific Controllers

Here are examples for common controller patterns:

#### User Authentication (signin/signup)

```typescript
// src/controllers/signinPost.ts
import { getPostgresClient, postgresDbReady } from '../database/postgresClient.js';

export async function signinPost(req: Request, res: Response) {
    await postgresDbReady;
    const prisma = getPostgresClient();
    
    if (!prisma) {
        return res.status(500).json({ error: 'Database not available' });
    }

    const { email, password } = req.body;
    
    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });
        
        if (user && await verifyPassword(password, user.password)) {
            // User authenticated
            res.json({ success: true, user: { email: user.email } });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
}
```

#### File Operations

```typescript
// src/controllers/postgres/uploadFilePostgres.ts
import { getPostgresClient, postgresDbReady } from '../../database/postgresClient.js';

export async function uploadFilePostgres(req: Request, res: Response) {
    await postgresDbReady;
    const prisma = getPostgresClient();
    
    if (!prisma) {
        return res.status(500).json({ error: 'Database not available' });
    }

    const { userEmail, fileName, fileContent, isPasswordProtected } = req.body;
    
    try {
        const file = await prisma.file.create({
            data: {
                userEmail,
                fileName,
                fileContent,
                isPasswordProtected: isPasswordProtected || false
            }
        });
        
        res.json({ success: true, file });
    } catch (error) {
        res.status(500).json({ error: 'Failed to upload file' });
    }
}
```

### 6. Error Handling

Prisma provides better error handling:

```typescript
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

try {
    const user = await prisma.user.create({ data: { email, password } });
} catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
            // Unique constraint violation
            res.status(400).json({ error: 'Email already exists' });
        }
    }
}
```

### 7. Testing the Migration

1. Keep the old `src/database/index.ts` file temporarily
2. Update controllers one by one
3. Test each endpoint after migration
4. Use the health check endpoint to verify both systems work

### 8. Environment Variables

Add to your `.env` file:

```env
# Keep existing
DATABASE_LINK="postgresql://..."

# Add new Prisma variables
POSTGRES_DATABASE_LINK="postgresql://..."
MONGO_DATABASE_LINK="mongodb://..."
```

### 9. Gradual Migration Strategy

1. **Phase 1**: Set up Prisma alongside existing pg client
2. **Phase 2**: Migrate read operations first (safer)
3. **Phase 3**: Migrate write operations
4. **Phase 4**: Remove old pg client setup

### 10. Benefits After Migration

- **Type Safety**: No more SQL typos or runtime errors
- **Auto-completion**: IDE support for database queries
- **Relationship Handling**: Easy joins and nested queries
- **Query Optimization**: Prisma optimizes queries automatically
- **Database Agnostic**: Same code works with PostgreSQL and MongoDB
- **Migration Safety**: Schema changes are tracked and versioned

## Rollback Plan

If you need to rollback:

1. The existing `src/database/index.ts` remains unchanged
2. Simply remove Prisma imports and revert to pg client calls
3. No database schema changes are made during migration

## Common Issues and Solutions

### Import Errors
```bash
# Generate clients first
npm run db:generate
```

### Connection Issues
- Check environment variables
- Verify database is accessible
- Check network connectivity

### Type Errors
- Ensure you're using the correct Prisma client for each database
- Run `npm run db:generate` after schema changes

### Performance
- Use `include` and `select` to optimize queries
- Consider using `findMany` with pagination for large datasets
