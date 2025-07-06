import { Request, Response } from "express";
import dotenv from "dotenv";
import dropbox from "../utils/dropboxClient.js";

dotenv.config();

export default async function deleteFileDropbox(req: Request, res: Response): Promise<void> {
    try {
        const { email, fileName } = req.body;

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

        console.log("=== DROPBOX DELETE DEBUG ===");
        console.log("Email:", email);
        console.log("Deleting file:", fileName);

        // Use email folder path structure for backend organization
        const filePath = `/${email}/${fileName}`;
        console.log("Full file path:", filePath);

        await dropbox.filesDeleteV2({ path: filePath });

        console.log("Delete successful!");
        console.log("Deleted file path:", filePath);
        console.log("=== END DROPBOX DELETE DEBUG ===");

        // Send successful response
        res.status(200).json({
            success: true,
            message: "File deleted from Dropbox successfully",
            data: {
                fileName: fileName,
                filePath: filePath,
                email: email
            }
        });

    } catch (err: any) {
        console.error("=== DROPBOX DELETE ERROR ===");
        console.error("Failed to delete file from Dropbox", err);
        console.error("Error name:", err?.name);
        console.error("Error message:", err?.message);

        if (err?.error) {
            console.error("Error details:", err.error);
        }
        if (err?.status) {
            console.error("Error status:", err.status);
        }
        console.error("=== END DROPBOX DELETE ERROR ===");

        // Handle different error types with proper HTTP responses
        if (err?.status === 401) {
            res.status(401).json({
                success: false,
                error: "Dropbox authentication failed. Please check your access token.",
                code: "AUTHENTICATION_FAILED"
            });
        } else if (err?.status === 404) {
            res.status(404).json({
                success: false,
                error: "File not found in Dropbox. The file may have been already deleted or moved.",
                code: "FILE_NOT_FOUND"
            });
        } else if (err?.status === 403) {
            res.status(403).json({
                success: false,
                error: "Permission denied. Your app may not have delete permissions.",
                code: "PERMISSION_DENIED"
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
                error: "Failed to delete file from Dropbox",
                message: err instanceof Error ? err.message : "Unknown error",
                code: "INTERNAL_ERROR"
            });
        }
    }
}