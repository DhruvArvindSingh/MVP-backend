import { Request, Response } from "express";
import lighthouse, { apiKey } from "../../lighthouse/index";

export default async function uploadFileLighthouse(req: Request, res: Response) {
    const { email, fileName, fileContent } = req.body;
    if (!email || !fileName || !fileContent) {
        res.status(400).json({
            success: false,
            error: "Missing required fields: email, fileName and content are required"
        });
        return;
    }
    if (fileName.startsWith("__password_protected__")) {
        res.status(400).json({
            success: false,
            error: "File name cannot start with '__password_protected__'"
        });
        return;
    }

    try {
        const response = await lighthouse.uploadText(fileContent, `${apiKey}`, fileName);
        console.log(response)
        res.status(200).json({
            success: true,
            file: response
        });
    } catch (error) {
        console.error("Failed to upload file to Lighthouse:", error);
        res.status(500).json({
            success: false,
            error: "Failed to upload file to Lighthouse"
        });
    }
}