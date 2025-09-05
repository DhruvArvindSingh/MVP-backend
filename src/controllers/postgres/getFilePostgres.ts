import { Request, Response } from "express";
import { getPostgresClient, postgresDbReady } from "../../database/postgresClient.js";

export default async function getFilePostgres(req: Request, res: Response) {
    const { email, fileName, isPasswordProtected } = req.body;
    if (!email || !fileName) {
        res.status(400).json({
            success: false,
            error: "Missing required fields: email and fileName are required"
        });
        return;
    }

    try {
        // Wait for database connection
        await postgresDbReady;
        const prisma = getPostgresClient();

        if (!prisma) {
            res.status(500).json({
                success: false,
                error: "Database not available"
            });
            return;
        }

        // Create the same folder structure as used in upload
        const Name = isPasswordProtected ? `__password_protected__${fileName}` : fileName;

        // Find file using Prisma
        const file = await prisma.file.findFirst({
            where: {
                userEmail: email,
                fileName: Name
            }
        });

        if (!file) {
            res.status(404).json({
                success: false,
                error: "File not found"
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "File retrieved successfully",
            fileName: fileName,
            isPasswordProtected: isPasswordProtected,
            content: file.fileContent,
            lastModified: file.updatedAt,
            contentType: "text/plain"
        });
    } catch (err) {
        console.error("Failed to get file from Postgres", err);
        res.status(404).json({
            success: false,
            error: "File not found or failed to retrieve from Postgres"
        });
    }
}