import { Request, Response } from "express";
import lighthouse, { apiKey } from "../../lighthouse/index";

export default async function listAllLighthouse(req: Request, res: Response) {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({
            success: false,
            error: "Missing required field: email is required"
        });
        return;
    }

    const response = await lighthouse.getUploads(`${apiKey}`, null)
    console.log(response)

    // Transform the response data
    const fileList = response.data?.fileList || [];
    const files: { [key: string]: string } = {};
    const passwordProtectedFiles: { [key: string]: string } = {};

    fileList.forEach((file: any) => {
        const fileName = file.fileName;
        const createdAtISO = new Date(file.createdAt).toISOString();

        if (fileName.startsWith("__password_protected__")) {
            passwordProtectedFiles[fileName] = createdAtISO;
        } else {
            files[fileName] = createdAtISO;
        }
    });

    res.status(200).json({
        success: true,
        files,
        passwordProtectedFiles,
        count: fileList.length
    });
}