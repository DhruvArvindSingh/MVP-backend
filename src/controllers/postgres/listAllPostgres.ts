import { Request, Response } from "express";
import { getPostgresClient, postgresDbReady } from "../../database/postgresClient.js";

export default async function listAllPostgres(req: Request, res: Response) {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({
            success: false,
            error: "Missing required field: email is required"
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

        // Get all files for the user using Prisma
        const files = await prisma.file.findMany({
            where: {
                userEmail: email
            },
            select: {
                fileName: true,
                updatedAt: true
            }
        });

        const passwordProtectedFiles: Record<string, string> = {};
        const result = files.reduce((acc: Record<string, string>, file) => {
            if (file.fileName.startsWith("__password_protected__")) {
                passwordProtectedFiles[file.fileName.replace("__password_protected__", "")] = file.updatedAt.toISOString();
            } else {
                acc[file.fileName] = file.updatedAt.toISOString();
            }
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            files: result,
            passwordProtectedFiles: passwordProtectedFiles,
            count: Object.keys(result).length
        });
    } catch (err) {
        console.error("Failed to list all files", err);
        res.status(500).json({
            success: false,
            error: "Failed to list all files"
        });
    }
}