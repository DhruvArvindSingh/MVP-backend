import { Request, Response } from "express";
import client from "../../database/index.js";

export default async function listAllPostgres(req: Request, res: Response) {
    const { email } = req.body;
    try {
        const files = await client!.query("SELECT file_name, updated_at FROM files WHERE user_email = $1", [email]);
        const result = files.rows.reduce((acc: Record<string, string>, row) => {
            acc[row.file_name] = row.updated_at;
            return acc;
        }, {});
        res.status(200).json({
            success: true,
            email: email,
            files: result,
            count: Object.keys(result).length
        });
    } catch (err) {
        console.error("Failed to list all files", err);
        res.status(500).json({
            error: "Failed to list all files",
            details: err instanceof Error ? err.message : "Unknown error"
        });
    }
}