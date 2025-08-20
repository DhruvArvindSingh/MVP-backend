import { Request, Response } from "express";
import s3 from "../../utils/s3Client.js";
import dotenv from "dotenv";
import { PutObjectCommand } from "@aws-sdk/client-s3";

dotenv.config();

const BUCKET = process.env.S3_BUCKET as string;

export default async function uploadFileS3(req: Request, res: Response) {
    const { email, fileName, fileContent, isPasswordProtected } = req.body;

    // Validate required fields
    if (!email || !fileName || !fileContent) {
        res.status(400).json({
            success: false,
            error: "Missing required fields: email, fileName and content are required"
        });
        return;
    }
    if (fileName.startsWith("__password_protected__")) {
        res.status(400).json({
            success: false,
            error: "File name cannot start with '__password_protected__'"
        });
        return;
    }

    try {

        // Create folder structure: email/fileName
        // S3 will automatically create the "folder" when we upload with this key
        const Name = isPasswordProtected ? `__password_protected__${fileName}` : fileName;
        const folderKey = `${email}/${Name}`;

        const params = {
            Bucket: BUCKET,
            Key: folderKey,
            Body: fileContent,
            ContentType: 'text/plain',
        };

        await s3.send(new PutObjectCommand(params));

        res.status(200).json({
            success: true,
            message: "File uploaded successfully",
            fileName: fileName
        });
    } catch (err) {
        console.error("Failed to save file to S3", err);
        res.status(500).json({
            success: false,
            error: "Failed to upload file to S3"
        });
    }
}