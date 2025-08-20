import { Request, Response } from "express";
import client from "../../database/index.js";

export default async function getFilePostgres(req: Request, res: Response) {
    const { email, fileName, isPasswordProtected } = req.body;
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
        const files = await client!.query("SELECT * FROM files WHERE user_email = $1 AND file_name = $2", [email, Name]);

        res.status(200).json({
            success: true,
            message: "File retrieved successfully",
            fileName: fileName,
            isPasswordProtected: isPasswordProtected,
            content: files.rows[0].file_content,
            lastModified: files.rows[0].updated_at,
            contentType: "text/plain"
        });
    } catch (err) {
        console.error("Failed to get file from Postgres", err);
        res.status(404).json({
            success: false,
            error: "File not found or failed to retrieve from Postgres"
        });
    }
}