import { Request, Response } from "express";
import s3 from "../utils/s3Client";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
import { retryApiCall } from "../utils/apiRetry";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

dotenv.config();

const BUCKET = process.env.S3_BUCKET;

export default async function uploadLogo(req: Request, res: Response): Promise<void> {
    try {
        const { fileName, content } = req.body;
        const email = req.userEmail; // From verify middleware

        console.log("=== LOGO UPLOAD DEBUG ===");
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

        if (!content) {
            res.status(400).json({
                success: false,
                error: "content parameter is required"
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

        // Create the S3 key with the specified structure: LOGO/email/fileName
        const s3Key = `LOGO/${email}/${fileName}`;
        console.log("S3 Key:", s3Key);

        // Convert content to Buffer
        let fileBuffer: Buffer;
        if (typeof content === 'string') {
            // Handle base64 content
            if (content.startsWith('data:')) {
                // Remove data URL prefix
                const base64Data = content.replace(/^data:.*?;base64,/, '');
                fileBuffer = Buffer.from(base64Data, 'base64');
            } else {
                // Assume it's already base64
                fileBuffer = Buffer.from(content, 'base64');
            }
        } else if (Buffer.isBuffer(content)) {
            fileBuffer = content;
        } else {
            fileBuffer = Buffer.from(content);
        }

        console.log("File buffer size:", fileBuffer.length, "bytes");

        // Determine content type based on file extension
        const getContentType = (filename: string): string => {
            const ext = filename.toLowerCase().split('.').pop();
            const contentTypes: { [key: string]: string } = {
                'png': 'image/png',
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'gif': 'image/gif',
                'svg': 'image/svg+xml',
                'webp': 'image/webp',
                'ico': 'image/x-icon'
            };
            return contentTypes[ext || ''] || 'image/png';
        };

        const contentType = getContentType(fileName);
        console.log("Content type:", contentType);

        // Upload to S3 with retry logic
        const uploadCommand = new PutObjectCommand({
            Bucket: BUCKET,
            Key: s3Key,
            Body: fileBuffer,
            ContentType: contentType,
            CacheControl: 'public, max-age=31536000' // Cache for 1 year
        });

        await retryApiCall(
            () => s3.send(uploadCommand),
            {
                maxAttempts: 3,
                baseDelay: 1000,
                maxDelay: 5000
            }
        );

        console.log("Logo uploaded successfully to S3");

        // Generate signed URL for direct access (valid for 1 year)
        // ... existing code ...
        const getObjectCommand = new GetObjectCommand({
            Bucket: BUCKET,
            Key: s3Key
        });

        const signedUrl = await getSignedUrl(s3, getObjectCommand, {
            expiresIn: 604800 // 7 days in seconds (AWS S3 maximum)
        });

        console.log("Generated signed URL for logo access");
        console.log("=== END LOGO UPLOAD DEBUG ===");

        // Send successful response
        res.status(200).json({
            success: true,
            message: "Logo uploaded successfully",
            data: {
                fileName: fileName,
                s3Key: s3Key,
                signedUrl: signedUrl,
                email: email,
                contentType: contentType,
                size: fileBuffer.length
            }
        });

    } catch (err: any) {
        console.error("=== LOGO UPLOAD ERROR ===");
        console.error("Failed to upload logo to S3", err);
        console.error("Error name:", err?.name);
        console.error("Error message:", err?.message);
        console.error("=== END LOGO UPLOAD ERROR ===");

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
                error: "Failed to upload logo to S3",
                message: err instanceof Error ? err.message : "Unknown error",
                code: "INTERNAL_ERROR"
            });
        }
    }
} 