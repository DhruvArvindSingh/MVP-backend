import { Request, Response } from "express";
import client from "../../neo4j/index.js";

export default async function uploadFileNeo4j(req: Request, res: Response) {
    const { email, fileName, fileContent, isPasswordProtected } = req.body;
    if (!email || !fileName || !fileContent) {
        res.status(400).json({
            success: false,
            error: "Missing required fields: email, fileName and content are required"
        });
        return;
    }

    const session = client.session();

    try {
        const fileNameToStore = isPasswordProtected ? `__password_protected__${fileName}` : fileName;

        // Create Person node if it doesn't exist and File node, then create relationship
        const result = await session.run(
            `
            MERGE (p:Person {email: $email})
            CREATE (f:File {
                fileName: $fileName,
                fileContent: $fileContent,
                is_password_protected: $isPasswordProtected,
                created_at: datetime(),
                updated_at: datetime()
            })
            CREATE (p)-[:OWNS_FILES]->(f)
            RETURN f.fileName as fileName, elementId(f) as fileId
            `,
            {
                email: email,
                fileName: fileNameToStore,
                fileContent: fileContent,
                isPasswordProtected: isPasswordProtected || false
            }
        );

        const record = result.records[0];

        res.status(200).json({
            success: true,
            message: "File uploaded successfully",
            fileName: fileName,
            fileId: record.get('fileId')
        });

    } catch (error) {
        console.error("Failed to upload file to Neo4j:", error);
        res.status(500).json({
            success: false,
            error: "Failed to upload file"
        });
    } finally {
        await session.close();
    }
}
