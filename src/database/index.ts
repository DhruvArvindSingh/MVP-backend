import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const DATABASE_LINK = process.env.DATABASE_LINK as string;
const { Client } = pkg;

let client: InstanceType<typeof Client> = new Client(`${DATABASE_LINK}`);

async function initDb() {
    try {
        await client.connect();

        await client.query(`CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );`);
    } catch (e) {
        console.log("Unable to connect to database");
        console.log(e);
        throw e;
    }
}

initDb();

export default client;
