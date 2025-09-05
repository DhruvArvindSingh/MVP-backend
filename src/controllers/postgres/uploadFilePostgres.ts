import { Request, Response } from "express";
import { getPostgresClient, postgresDbReady } from "../../database/postgresClient.js";

export default async function uploadFilePostgres(req: Request, res: Response) {
    const { email, fileName, fileContent, isPasswordProtected } = req.body;
    if (!email || !fileName || !fileContent) {
        res.status(400).json({
            success: false,
            error: "Missing required fields: email, fileName and content are required"
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

        const Name = isPasswordProtected ? `__password_protected__${fileName}` : fileName;

        // Create file using Prisma
        const file = await prisma.file.create({
            data: {
                userEmail: email,
                fileName: Name,
                fileContent: fileContent,
                isPasswordProtected: isPasswordProtected || false
            }
        });

        res.status(200).json({
            success: true,
            message: "File uploaded successfully",
            fileName: fileName,
            fileId: file.id
        });
    } catch (error) {
        console.error("Failed to upload file", error);
        res.status(500).json({
            success: false,
            error: "Failed to upload file"
        });
        return;
    }
}