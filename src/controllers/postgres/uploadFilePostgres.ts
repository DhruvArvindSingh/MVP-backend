import { Request, Response } from "express";
import client from "../../database/index.js";

export default async function uploadFilePostgres(req: Request, res: Response) {
    const { email, fileName, fileContent } = req.body;
    if (!email || !fileName || !fileContent) {
        res.status(400).json({
            success: false,
            error: "Missing required fields: email, fileName and content are required"
        });
        return;
    }
    try {
        const files = await client!.query("INSERT INTO files (user_email, file_name, file_content) VALUES ($1, $2, $3)", [email, fileName, fileContent]);
        res.status(200).json({
            success: true,
            message: "File uploaded successfully",
            fileName: fileName
        });
    } catch (error) {
        console.error("Failed to upload file", error);
        res.status(500).json({
            success: false,
            error: "Failed to upload file"
        });
        return;
    }
}