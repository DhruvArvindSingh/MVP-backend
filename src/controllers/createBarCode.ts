import { Request, Response } from "express";
import s3 from "../utils/s3Client";
import dotenv from "dotenv";
import { retryApiCall } from "../utils/apiRetry";
import { PutObjectCommand } from "@aws-sdk/client-s3";

dotenv.config();

const BUCKET = process.env.S3_BUCKET;

export default async function createBarCode(req: Request, res: Response): Promise<void> {
    try {
        const { email, fileName, fileContent } = req.body;

        console.log("=== BARCODE CREATION DEBUG ===");
        console.log("Email:", email);
        console.log("FileName:", fileName);

        // Validate required parameters
        if (!email || typeof email !== 'string') {
            res.status(400).json({
                success: false,
                error: "Email is required and must be a string"
            });
            return;
        }

        if (!fileName || typeof fileName !== 'string') {
            res.status(400).json({
                success: false,
                error: "fileName parameter is required and must be a string"
            });
            return;
        }

        if (!fileContent) {
            res.status(400).json({
                success: false,
                error: "fileContent parameter is required"
            });
            return;
        }

        if (!BUCKET) {
            console.error("S3_BUCKET environment variable is not configured");
            res.status(500).json({
                success: false,
                error: "S3_BUCKET environment variable is not configured"
            });
            return;
        }

        // Create timestamp for unique filename
        const timestamp = Date.now();
        const fileNameWithTimestamp = `${fileName}-${timestamp}`;

        // Create the S3 key with the specified structure: BARCODE/email/fileName-timestamp
        const s3Key = `BARCODE/${email}/${fileNameWithTimestamp}`;
        console.log("S3 Key:", s3Key);

        // Upload to S3 with retry logic
        const uploadCommand = new PutObjectCommand({
            Bucket: BUCKET,
            Key: s3Key,
            Body: fileContent,
            ContentType: 'text/plain'
        });

        await retryApiCall(
            () => s3.send(uploadCommand),
            {
                maxAttempts: 3,
                baseDelay: 1000,
                maxDelay: 5000
            }
        );

        console.log("Barcode uploaded successfully to S3");

        // Generate normal S3 URL (public access)
        const s3Url = `https://${BUCKET}.s3.amazonaws.com/${s3Key}`;

        console.log("Generated S3 URL for barcode access:", s3Url);
        console.log("=== END BARCODE CREATION DEBUG ===");

        // Send successful response (same format as uploadLogo)
        res.status(200).json({
            success: true,
            message: "Barcode created successfully",
            data: {
                fileName: fileName,
                s3Key: s3Key,
                signedUrl: s3Url, // Using regular S3 URL as normal URL
                email: email,
                contentType: 'text/plain',
                size: Buffer.byteLength(fileContent, 'utf8')
            }
        });

    } catch (err: any) {
        console.error("=== BARCODE CREATION ERROR ===");
        console.error("Failed to create barcode in S3", err);
        console.error("Error name:", err?.name);
        console.error("Error message:", err?.message);
        console.error("=== END BARCODE CREATION ERROR ===");

        // Handle different error types
        if (err?.name === 'NoSuchBucket') {
            res.status(500).json({
                success: false,
                error: "S3 bucket not found. Please check your S3 configuration.",
                code: "BUCKET_NOT_FOUND"
            });
        } else if (err?.name === 'AccessDenied') {
            res.status(500).json({
                success: false,
                error: "Access denied to S3. Please check your AWS credentials.",
                code: "ACCESS_DENIED"
            });
        } else {
            res.status(500).json({
                success: false,
                error: "Failed to create barcode in S3",
                message: err instanceof Error ? err.message : "Unknown error",
                code: "INTERNAL_ERROR"
            });
        }
    }
}
