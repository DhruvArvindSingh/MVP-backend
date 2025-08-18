import { Request, Response } from "express";
import client from "../../database/index.js";

export default async function getFilePostgres(req: Request, res: Response) {
    const { email, fileName } = req.body;
    if (!email || !fileName) {
        res.status(400).json({
            error: "Missing required fields: email and fileName are required"
        });
        return;
    }

    try {
        // Create the same folder structure as used in upload
        const files = await client!.query("SELECT * FROM files WHERE user_email = $1 AND file_name = $2", [email, fileName]);

        res.status(200).json({
            message: "File retrieved successfully",
            fileName: fileName,
            content: files.rows[0].file_content,
            lastModified: files.rows[0].updated_at,
            contentType: "text/plain"
        });
    } catch (err) {
        console.error("Failed to get file from Postgres", err);
        res.status(404).json({
            error: "File not found or failed to retrieve from Postgres"
        });
    }
}