import { Request, Response } from "express";
import client from "../../database/index.js";

export default async function listAllPostgres(req: Request, res: Response) {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({
            success: false,
            error: "Missing required field: email is required"
        });
        return;
    }
    try {
        const files = await client!.query("SELECT file_name, updated_at FROM files WHERE user_email = $1", [email]);
        const passwordProtectedFiles: Record<string, string> = {};
        const result = files.rows.reduce((acc: Record<string, string>, row) => {
            if (row.file_name.startsWith("__password_protected__")) {
                passwordProtectedFiles[row.file_name.replace("__password_protected__", "")] = row.updated_at;
            }
            else {
                acc[row.file_name] = row.updated_at;
            }
            return acc;
        }, {});
        res.status(200).json({
            success: true,
            files: result,
            passwordProtectedFiles: passwordProtectedFiles,
            count: Object.keys(result).length
        });
    } catch (err) {
        console.error("Failed to list all files", err);
        res.status(500).json({
            success: false,
            error: "Failed to list all files"
        });
    }
}