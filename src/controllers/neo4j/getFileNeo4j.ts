import { Request, Response } from "express";
import client from "../../neo4j/index.js";

export default async function getFileNeo4j(req: Request, res: Response) {
    const { email, fileName, isPasswordProtected } = req.body;
    if (!email || !fileName) {
        res.status(400).json({
            success: false,
            error: "Missing required fields: email and fileName are required"
        });
        return;
    }

    const session = client.session();

    try {
        const fileNameToFind = isPasswordProtected ? `__password_protected__${fileName}` : fileName;

        // Find the specific file owned by the person with the given email
        const result = await session.run(
            `
            MATCH (p:Person {email: $email})-[:OWNS_FILES]->(f:File {fileName: $fileName})
            RETURN f.fileName as fileName, 
                   f.fileContent as fileContent, 
                   f.is_password_protected as isPasswordProtected,
                   f.updated_at as updatedAt
            `,
            {
                email: email,
                fileName: fileNameToFind
            }
        );

        if (result.records.length === 0) {
            res.status(404).json({
                success: false,
                error: "File not found"
            });
            return;
        }

        const record = result.records[0];

        res.status(200).json({
            success: true,
            message: "File retrieved successfully",
            fileName: fileName,
            isPasswordProtected: isPasswordProtected,
            content: record.get('fileContent'),
            lastModified: record.get('updatedAt').toString(),
            contentType: "text/plain"
        });

    } catch (error) {
        console.error("Failed to get file from Neo4j:", error);
        res.status(404).json({
            success: false,
            error: "File not found or failed to retrieve from Neo4j"
        });
    } finally {
        await session.close();
    }
}
