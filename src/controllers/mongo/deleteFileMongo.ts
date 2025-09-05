import { Request, Response } from "express";
import { getFilesCollection, nativeMongoDbReady } from "../../database/nativeMongoClient.js";

export default async function deleteFileMongo(req: Request, res: Response) {
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

        const Name = isPasswordProtected ? `__password_protected__${fileName}` : fileName;

        // Delete file using native MongoDB driver
        const result = await filesCollection.deleteMany({
            userEmail: email,
            fileName: Name
        });

        if (result.deletedCount === 0) {
            res.status(404).json({
                success: false,
                error: "File not found"
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "File deleted successfully from MongoDB",
            fileName: fileName,
            isPasswordProtected: isPasswordProtected
        });
    } catch (err) {
        console.error("Failed to delete file from MongoDB", err);
        res.status(500).json({
            success: false,
            error: "Failed to delete file from MongoDB",
        });
    }
}