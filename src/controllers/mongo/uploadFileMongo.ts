import { Request, Response } from "express";
import { getFilesCollection, nativeMongoDbReady } from "../../database/nativeMongoClient.js";
import { ObjectId } from "mongodb";

export default async function uploadFileMongo(req: Request, res: Response) {
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

        // Create file using native MongoDB driver
        const fileDoc = {
            userEmail: email,
            fileName: Name,
            fileContent: fileContent,
            isPasswordProtected: isPasswordProtected || false,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await filesCollection.insertOne(fileDoc);

        res.status(200).json({
            success: true,
            message: "File uploaded successfully to MongoDB",
            fileName: fileName,
            fileId: result.insertedId.toString()
        });
    } catch (error) {
        console.error("Failed to upload file to MongoDB", error);
        res.status(500).json({
            success: false,
            error: "Failed to upload file to MongoDB"
        });
        return;
    }
}

