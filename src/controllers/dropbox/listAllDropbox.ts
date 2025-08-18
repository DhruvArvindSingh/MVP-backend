import dropbox from "../../utils/dropboxClient";
import { Request, Response } from "express";
import { retryApiCall } from "../../utils/apiRetry";
import dotenv from "dotenv";

dotenv.config();

const DROPBOX_ACCESS_TOKEN = process.env.DROPBOX_ACCESS_TOKEN;

interface DropboxFileObject {
    [key: string]: number;
}

export default async function listAllDropbox(req: Request, res: Response): Promise<void> {
    try {
        const email: string = req.body.email;
        console.log("email = ", email);

        // Validate email parameter
        if (!email || typeof email !== 'string') {
            res.status(400).json({
                success: false,
                error: "Email parameter is required and must be a string"
            });
            return;
        }

        // Check if access token is configured
        if (!DROPBOX_ACCESS_TOKEN) {
            console.error("Dropbox access token not configured");
            res.status(500).json({
                success: false,
                error: "Dropbox access token not configured. Please set DROPBOX_ACCESS_TOKEN in your environment variables."
            });
            return;
        }

        // Wrap Dropbox API call with retry logic
        const response = await retryApiCall(
            () => dropbox.filesListFolder({ path: `/${email}` }),
            {
                maxAttempts: 3,
                baseDelay: 1000,
                maxDelay: 5000
            }
        );
        const files = response.result.entries || [];

        // Convert Dropbox files to the expected format
        const filesObj: DropboxFileObject = {};
        files.forEach((file: any) => {
            if (file['.tag'] === 'file' && file.name && file.client_modified) {
                filesObj[file.name] = new Date(file.client_modified).getTime();
            }
        });

        res.status(200).json({
            success: true,
            email: email,
            dropboxFiles: filesObj,
            count: Object.keys(filesObj).length
        });
    } catch (err) {
        console.error("Failed to load files from Dropbox", err);
        console.error("Error details:", err);
        res.status(500).json({
            success: false,
            error: "Failed to load files from Dropbox",
            message: err instanceof Error ? err.message : "Unknown error"
        });
    }
}