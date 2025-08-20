import { Request, response, Response } from "express";
import client from "../../database/index.js";

export default async function deleteFilePostgres(req: Request, res: Response) {
    const { email, fileName, isPasswordProtected } = req.body;
    if (!email || !fileName) {
        res.status(400).json({
            success: false,
            error: "Missing required fields: email and fileName are required"
        });
        return;
    }


    try {
        const Name = isPasswordProtected ? `__password_protected__${fileName}` : fileName;
        await client!.query("DELETE FROM files WHERE user_email = $1 AND file_name = $2", [email, Name]);
        res.status(200).json({
            success: true,
            message: "File deleted successfully",
            fileName: fileName,
            isPasswordProtected: isPasswordProtected
        });
    } catch (err) {
        console.error("Failed to delete file from Postgres", err);
        res.status(500).json({
            success: false,
            error: "Failed to delete file from Postgres",
        });
    }
}