import { Request, Response } from "express";
import s3 from "../utils/s3Client.js";
import dotenv from "dotenv";
import { DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

dotenv.config();

const BUCKET = process.env.S3_BUCKET as string;

export default async function deleteFileS3(req: Request, res: Response) {
    const { email, fileName } = req.body;

    // Validate required fields
    if (!email || !fileName) {
        res.status(400).json({
            error: "Missing required fields: email and fileName are required"
        });
        return;
    }

    try {
        // Create the same folder structure as used in upload/get
        const key = `${email}/${fileName}`;

        // Check if file exists before attempting to delete
        try {
            await s3.send(new HeadObjectCommand({
                Bucket: BUCKET,
                Key: key
            }));
        } catch (headErr: any) {
            if (headErr.name === 'NotFound' || headErr.$metadata?.httpStatusCode === 404) {
                res.status(404).json({
                    error: "File not found in bucket",
                    fileName: fileName,
                    filePath: key
                });
                return;
            }
            // If it's some other error, throw it to be handled by the outer catch
            throw headErr;
        }

        // File exists, proceed with deletion
        await s3.send(new DeleteObjectCommand({
            Bucket: BUCKET,
            Key: key
        }));

        res.status(200).json({
            message: "File deleted successfully",
            fileName: fileName,
            filePath: key
        });
    } catch (err) {
        console.error("Failed to delete file from S3", err);
        res.status(500).json({
            error: "Failed to delete file from S3",
            details: err instanceof Error ? err.message : "Unknown error"
        });
    }
}