import { Request, Response } from "express";
import client from "../../neo4j/index.js";

export default async function deleteFileNeo4j(req: Request, res: Response) {
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
        const fileNameToDelete = isPasswordProtected ? `__password_protected__${fileName}` : fileName;

        // Delete the file and its relationship
        const result = await session.run(
            `
            MATCH (p:Person {email: $email})-[r:OWNS_FILES]->(f:File {fileName: $fileName})
            DELETE r, f
            RETURN count(f) as deletedCount
            `,
            {
                email: email,
                fileName: fileNameToDelete
            }
        );

        const deletedCount = result.records[0].get('deletedCount').toNumber();

        if (deletedCount === 0) {
            res.status(404).json({
                success: false,
                error: "File not found"
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "File deleted successfully",
            fileName: fileName,
            isPasswordProtected: isPasswordProtected
        });

    } catch (error) {
        console.error("Failed to delete file from Neo4j:", error);
        res.status(500).json({
            success: false,
            error: "Failed to delete file from Neo4j"
        });
    } finally {
        await session.close();
    }
}
