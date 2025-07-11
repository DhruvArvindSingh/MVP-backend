import { Request, Response } from "express";
import dropbox from "../utils/dropboxClient";
import { retryApiCall, isRetriableError } from "../utils/apiRetry";
import dotenv from "dotenv";

dotenv.config();

export default async function getFileDropbox(req: Request, res: Response): Promise<void> {
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

        console.log("=== DROPBOX DOWNLOAD DEBUG ===");
        console.log("Email:", email);
        console.log("Attempting to download file:", fileName);

        // Use email folder path structure for backend
        const filePath = `/${email}/${fileName}`;
        console.log("Full file path:", filePath);

        // Wrap Dropbox API call with retry logic
        const response = await retryApiCall(
            () => dropbox.filesDownload({ path: filePath }),
            {
                maxAttempts: 3,
                baseDelay: 1000,
                maxDelay: 5000
            }
        );
        console.log("Dropbox response status:", response.status);
        console.log("Response result keys:", Object.keys(response.result));

        // Handle file content - cast response to access fileBinary
        const responseWithBinary = response as any;

        // Check if fileBinary exists
        if (!responseWithBinary.result.fileBinary) {
            console.error("No fileBinary in response");
            console.log("Available properties:", Object.keys(responseWithBinary.result));
            throw new Error("No file content received from Dropbox");
        }

        const fileBinary = responseWithBinary.result.fileBinary;
        console.log("File binary type:", typeof fileBinary);
        console.log("File binary constructor:", fileBinary.constructor.name);

        // Convert to Buffer first for consistent handling
        let fileBuffer: Buffer;
        if (Buffer.isBuffer(fileBinary)) {
            console.log("Processing as Buffer");
            fileBuffer = fileBinary;
        } else if (fileBinary && fileBinary.constructor && fileBinary.constructor.name === 'Buffer') {
            console.log("Processing as Buffer-like object");
            fileBuffer = Buffer.from(fileBinary);
        } else if (fileBinary instanceof ArrayBuffer) {
            console.log("Processing as ArrayBuffer");
            fileBuffer = Buffer.from(new Uint8Array(fileBinary));
        } else if (typeof fileBinary === 'string') {
            console.log("Processing as string");
            fileBuffer = Buffer.from(fileBinary, 'binary');
        } else {
            console.log("Processing as unknown format, converting to Buffer");
            fileBuffer = Buffer.from(fileBinary);
        }

        console.log("Successfully extracted content");
        console.log("File buffer size:", fileBuffer.length, "bytes");

        // Get file metadata
        const metadata = responseWithBinary.result;
        console.log("Metadata =", metadata);

        // Determine content type and if file is text or binary
        const getContentInfo = (filename: string) => {
            const ext = filename.toLowerCase().split('.').pop();
            const textExtensions = ['txt', 'json', 'html', 'css', 'js', 'ts', 'md', 'xml', 'csv', 'log', 'sql', 'py', 'java', 'cpp', 'c', 'h', 'php', 'rb', 'go', 'rs', 'sh', 'yml', 'yaml', 'ini', 'conf', 'config'];
            const contentTypes: { [key: string]: string } = {
                'txt': 'text/plain',
                'json': 'application/json',
                'html': 'text/html',
                'css': 'text/css',
                'js': 'application/javascript',
                'ts': 'application/typescript',
                'md': 'text/markdown',
                'xml': 'application/xml',
                'csv': 'text/csv',
                'pdf': 'application/pdf',
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'png': 'image/png',
                'gif': 'image/gif',
                'doc': 'application/msword',
                'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'xls': 'application/vnd.ms-excel',
                'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'zip': 'application/zip',
                'mp4': 'video/mp4',
                'mp3': 'audio/mpeg',
                'msc': 'application/vnd.ms-msc'
            };

            return {
                contentType: contentTypes[ext || ''] || 'application/octet-stream',
                isText: textExtensions.includes(ext || ''),
                extension: ext
            };
        };

        const fileInfo = getContentInfo(fileName);

        // Determine how to send the content
        let content: string;
        let encoding: string;

        if (fileInfo.isText) {
            // For text files, send as UTF-8 string
            console.log("Processing as text file");
            content = fileBuffer.toString('utf8');
            encoding = 'text';
        } else {
            // For binary files, send as base64
            console.log("Processing as binary file");
            content = fileBuffer.toString('base64');
            encoding = 'base64';
        }

        console.log("Content processed as:", encoding);
        console.log("Content size:", content.length, encoding === 'text' ? "characters" : "base64 characters");
        console.log("=== END DROPBOX DOWNLOAD DEBUG ===");

        // Send successful response
        res.status(200).json({
            success: true,
            data: {
                fileName: metadata.name,
                size: metadata.size,
                modified: metadata.server_modified || metadata.client_modified,
                contentType: fileInfo.contentType,
                content: content,
                encoding: encoding, // 'text' or 'base64'
                isText: fileInfo.isText,
                email: email
            }
        });

    } catch (err: any) {
        console.error("=== DROPBOX DOWNLOAD ERROR ===");
        console.error("Failed to get file from Dropbox", err);
        console.error("Error name:", err?.name);
        console.error("Error message:", err?.message);

        if (err?.error) {
            console.error("Error details:", err.error);
        }
        if (err?.status) {
            console.error("Error status:", err.status);
        }
        console.error("=== END DROPBOX DOWNLOAD ERROR ===");

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
                error: "File not found in Dropbox. The file may have been moved or deleted.",
                code: "FILE_NOT_FOUND"
            });
        } else if (err?.status === 403) {
            res.status(403).json({
                success: false,
                error: "Permission denied. Your app may not have read access to this file.",
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
                error: "Failed to load file from Dropbox",
                message: err instanceof Error ? err.message : "Unknown error",
                code: "INTERNAL_ERROR"
            });
        }
    }
}