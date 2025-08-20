import { Request, Response } from "express";
import s3 from "../../utils/s3Client.js";
import dotenv from "dotenv";
import { GetObjectCommand } from "@aws-sdk/client-s3";

dotenv.config();

const BUCKET = process.env.S3_BUCKET as string;

export default async function getFileS3(req: Request, res: Response) {
    const { email, fileName, isPasswordProtected } = req.body;

    // Validate required fields
    if (!email || !fileName) {
        res.status(400).json({
            success: false,
            error: "Missing required fields: email and fileName are required"
        });
        return;
    }

    try {
        // Create the same folder structure as used in upload
        const Name = isPasswordProtected ? `__password_protected__${fileName}` : fileName;
        const key = `${email}/${Name}`;

        const command = new GetObjectCommand({
            Bucket: BUCKET,
            Key: key,
        });

        const response = await s3.send(command);

        // Handle the response body properly
        let content = "";
        if (response.Body) {
            // Convert the stream to string
            const stream = response.Body as any;
            if (stream.transformToString) {
                content = await stream.transformToString();
            } else {
                // Fallback: collect chunks from the stream
                const chunks: Buffer[] = [];
                for await (const chunk of stream) {
                    chunks.push(chunk);
                }
                content = Buffer.concat(chunks).toString('utf-8');
            }
        }

        res.status(200).json({
            success: true,
            message: "File retrieved successfully",
            fileName: fileName,
            isPasswordProtected: isPasswordProtected,
            content: content,
            lastModified: response.LastModified,
            contentType: response.ContentType
        });
    } catch (err) {
        console.error("Failed to get file from S3", err);
        res.status(404).json({
            success: false,
            error: "File not found or failed to retrieve from S3"
        });
    }
}