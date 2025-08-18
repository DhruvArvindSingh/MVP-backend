import { Request, Response } from "express";
import s3 from "../../utils/s3Client.js";
import dotenv from "dotenv";
import { PutObjectCommand } from "@aws-sdk/client-s3";

dotenv.config();

const BUCKET = process.env.S3_BUCKET as string;

export default async function uploadFileS3(req: Request, res: Response) {
    const { email, fileName, content } = req.body;

    // Validate required fields
    if (!email || !fileName || !content) {
        res.status(400).json({
            error: "Missing required fields: email, fileName and content are required"
        });
        return;
    }

    try {
        // Create folder structure: email/fileName
        // S3 will automatically create the "folder" when we upload with this key
        const folderKey = `${email}/${fileName}`;

        const params = {
            Bucket: BUCKET,
            Key: folderKey,
            Body: content,
            ContentType: 'text/plain'
        };

        await s3.send(new PutObjectCommand(params));

        res.status(200).json({
            message: "File uploaded successfully",
            fileName: fileName,
            filePath: folderKey,
            email: email
        });
    } catch (err) {
        console.error("Failed to save file to S3", err);
        res.status(500).json({
            error: "Failed to upload file to S3"
        });
    }
}