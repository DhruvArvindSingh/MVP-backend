import { Request, Response } from "express";
import { getPostgresClient, postgresDbReady } from "../../database/postgresClient.js";

export default async function deleteFilePostgres(req: Request, res: Response) {
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

        const Name = isPasswordProtected ? `__password_protected__${fileName}` : fileName;

        // Delete file using Prisma
        const deletedFile = await prisma.file.deleteMany({
            where: {
                userEmail: email,
                fileName: Name
            }
        });

        if (deletedFile.count === 0) {
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
    } catch (err) {
        console.error("Failed to delete file from Postgres", err);
        res.status(500).json({
            success: false,
            error: "Failed to delete file from Postgres",
        });
    }
}