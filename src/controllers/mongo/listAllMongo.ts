import { Request, Response } from "express";
import { getFilesCollection, nativeMongoDbReady } from "../../database/nativeMongoClient.js";

export default async function listAllMongo(req: Request, res: Response) {
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
        await nativeMongoDbReady;
        const filesCollection = getFilesCollection();

        if (!filesCollection) {
            res.status(500).json({
                success: false,
                error: "Database not available"
            });
            return;
        }

        // Get all files for the user using native MongoDB driver
        const files = await filesCollection.find(
            { userEmail: email },
            { projection: { fileName: 1, updatedAt: 1 } }
        ).toArray();

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
            message: "Files listed successfully from MongoDB",
            files: result,
            passwordProtectedFiles: passwordProtectedFiles,
            count: Object.keys(result).length
        });
    } catch (err) {
        console.error("Failed to list all files from MongoDB", err);
        res.status(500).json({
            success: false,
            error: "Failed to list all files from MongoDB"
        });
    }
}