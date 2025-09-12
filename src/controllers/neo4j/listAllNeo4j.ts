import { Request, Response } from "express";
import client from "../../neo4j/index.js";

export default async function listAllNeo4j(req: Request, res: Response) {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({
            success: false,
            error: "Missing required field: email is required"
        });
        return;
    }

    const session = client.session();

    try {
        // Find all files owned by the person with the given email
        const result = await session.run(
            `
            MATCH (p:Person {email: $email})-[:OWNS_FILES]->(f:File)
            RETURN f.fileName as fileName, f.updated_at as updatedAt
            ORDER BY f.updated_at DESC
            `,
            { email: email }
        );

        const passwordProtectedFiles: Record<string, string> = {};
        const files = result.records.reduce((acc: Record<string, string>, record: any) => {
            const fileName = record.get('fileName');
            const updatedAt = record.get('updatedAt').toString();

            if (fileName.startsWith("__password_protected__")) {
                passwordProtectedFiles[fileName.replace("__password_protected__", "")] = updatedAt;
            } else {
                acc[fileName] = updatedAt;
            }
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            files: files,
            passwordProtectedFiles: passwordProtectedFiles,
            count: Object.keys(files).length
        });

    } catch (error) {
        console.error("Failed to list files from Neo4j:", error);
        res.status(500).json({
            success: false,
            error: "Failed to list all files"
        });
    } finally {
        await session.close();
    }
}
