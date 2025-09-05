import { Request, Response } from "express";
import { getFilesCollection, nativeMongoDbReady } from "../../database/nativeMongoClient.js";

export default async function getFileMongo(req: Request, res: Response) {
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
        await nativeMongoDbReady;
        const filesCollection = getFilesCollection();

        if (!filesCollection) {
            res.status(500).json({
                success: false,
                error: "Database not available"
            });
            return;
        }

        // Create the same folder structure as used in upload
        const Name = isPasswordProtected ? `__password_protected__${fileName}` : fileName;

        // Find file using native MongoDB driver
        const file = await filesCollection.findOne({
            userEmail: email,
            fileName: Name
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
            message: "File retrieved successfully from MongoDB",
            fileName: fileName,
            isPasswordProtected: isPasswordProtected,
            content: file.fileContent,
            lastModified: file.updatedAt,
            contentType: "text/plain"
        });
    } catch (err) {
        console.error("Failed to get file from MongoDB", err);
        res.status(404).json({
            success: false,
            error: "File not found or failed to retrieve from MongoDB"
        });
    }
}

