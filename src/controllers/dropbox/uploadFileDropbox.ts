import { Request, Response } from "express";
import dropbox from "../../utils/dropboxClient.js";
import dotenv from "dotenv";

dotenv.config();

export default async function uploadFileDropbox(req: Request, res: Response): Promise<void> {
    try {
        const { email, fileName, content } = req.body;

        // Validate required parameters
        if (!email || typeof email !== 'string') {
            res.status(400).json({
                success: false,
                error: "Email parameter is required and must be a string"
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

        if (!content || typeof content !== 'string') {
            res.status(400).json({
                success: false,
                error: "content parameter is required and must be a string"
            });
            return;
        }

        console.log("=== DROPBOX UPLOAD DEBUG ===");
        console.log("Email:", email);
        console.log("Uploading file:", fileName);
        console.log("Content length:", content.length, "characters");

        // Use email folder path structure for backend organization
        const filePath = `/${email}/${fileName}`;
        console.log("Full file path:", filePath);

        // Convert string content to Buffer for Dropbox API
        const contentBuffer = Buffer.from(content, 'utf8');
        console.log("Buffer size:", contentBuffer.length, "bytes");

        const response = await dropbox.filesUpload({
            path: filePath,
            contents: contentBuffer,
            mode: { '.tag': 'overwrite' },
            autorename: true
        });

        console.log("Upload successful!");
        console.log("File metadata:", {
            name: response.result.name,
            size: response.result.size,
            path: response.result.path_display
        });
        console.log("=== END DROPBOX UPLOAD DEBUG ===");

        // Send successful response
        res.status(200).json({
            success: true,
            message: "File uploaded successfully",
            fileName: response.result.name
        });

    } catch (err: any) {
        console.error("=== DROPBOX UPLOAD ERROR ===");
        console.error("Failed to upload file to Dropbox", err);
        console.error("Error name:", err?.name);
        console.error("Error message:", err?.message);

        if (err?.error) {
            console.error("Error details:", err.error);
        }
        if (err?.status) {
            console.error("Error status:", err.status);
        }
        console.error("=== END DROPBOX UPLOAD ERROR ===");

        // Handle different error types with proper HTTP responses
        if (err?.status === 401) {
            res.status(401).json({
                success: false,
                error: "Dropbox authentication failed. Please check your access token.",
                code: "AUTHENTICATION_FAILED"
            });
        } else if (err?.status === 403) {
            res.status(403).json({
                success: false,
                error: "Permission denied. Your app may not have sufficient permissions.",
                code: "PERMISSION_DENIED"
            });
        } else if (err?.status === 400) {
            res.status(400).json({
                success: false,
                error: "Bad request. Please check the file name and content.",
                code: "BAD_REQUEST"
            });
        } else if (err?.status === 429) {
            res.status(429).json({
                success: false,
                error: "Rate limit exceeded. Please try again later.",
                code: "RATE_LIMIT_EXCEEDED"
            });
        } else {
            res.status(500).json({
                success: false,
                error: "Failed to upload file to Dropbox",
                code: "INTERNAL_ERROR"
            });
        }
    }
}