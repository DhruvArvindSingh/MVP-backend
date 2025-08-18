import { Request, response, Response } from "express";
import client from "../../database/index.js";

export default async function deleteFilePostgres(req: Request, res: Response) {
    const { email, fileName } = req.body;
    if (!email || !fileName) {
        res.status(400).json({
            error: "Missing required fields: email and fileName are required"
        });
        return;
    }


    try {
        await client!.query("DELETE FROM files WHERE user_email = $1 AND file_name = $2", [email, fileName]);
        res.status(200).json({
            message: "File deleted successfully",
            fileName: fileName,
        });
    } catch (err) {
        console.error("Failed to delete file from Postgres", err);
        res.status(500).json({
            error: "Failed to delete file from Postgres",
            details: err instanceof Error ? err.message : "Unknown error"
        });
    }
}