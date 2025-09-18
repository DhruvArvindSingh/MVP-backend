import neo4j from 'neo4j-driver'
import dotenv from 'dotenv'
dotenv.config();

let client: any;
async function main() {
    try {
        // URI examples: 'neo4j://localhost', 'neo4j+s://xxx.databases.neo4j.io'
        const URI = process.env.NEO4J_URI
        const USER = process.env.NEO4J_USER
        const PASSWORD = process.env.NEO4J_PASSWORD

        if (!URI || !USER || !PASSWORD) {
            console.warn('⚠️  Neo4j configuration not found. Neo4j features will be disabled.')
            return
        }

        client = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD))
        const serverInfo = await client.getServerInfo()
        console.log('✅ Neo4j connection established')
        console.log(serverInfo)
    } catch (error) {
        console.error('❌ Failed to connect to Neo4j:', error instanceof Error ? error.message : error)
        client = null
    }
}

main().catch(() => {
    // Error already handled in main
});
export default client;