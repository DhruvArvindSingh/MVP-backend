import neo4j from 'neo4j-driver'
import dotenv from 'dotenv'
dotenv.config();

let client: any;
async function main() {
    // URI examples: 'neo4j://localhost', 'neo4j+s://xxx.databases.neo4j.io'
    const URI = process.env.NEO4J_URI
    const USER = process.env.NEO4J_USER
    const PASSWORD = process.env.NEO4J_PASSWORD
    if (!URI || !USER || !PASSWORD) {
        throw new Error('NEO4J_URI, NEO4J_USER, and NEO4J_PASSWORD must be set')
    }
    client = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD))
    const serverInfo = await client.getServerInfo()
    console.log('Connection established')
    console.log(serverInfo)

    // Use the client to run queries

}

main();
export default client;