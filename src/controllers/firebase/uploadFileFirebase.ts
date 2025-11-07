import { Request, Response } from "express";
import db from "../../firebase/index.js";

export default async function uploadFileFirebase(req: Request, res: Response) {
    const { email, fileName, fileContent, isPasswordProtected } = req.body;
    if (!email || !fileName || !fileContent) {
        res.status(400).json({
            success: false,
            error: "Missing required fields: email, fileName and content are required"
        });
        return;
    }
    try {
        const Name = isPasswordProtected ? `__password_protected__${fileName}` : fileName;
        const docRef = db.collection(email).doc(Name);

        // Check if document exists
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            await docRef.set({
                fileContent: fileContent,
                lastModified: new Date().toISOString()
            }, { merge: true });
            return res.status(200).json({
                success: true,
                message: "File Updated successfully",
                fileName: fileName
            });
        }
        await docRef.set({
            fileContent: fileContent,
            lastModified: new Date().toISOString(),
            createdAt: new Date().toISOString(),
        });
        return res.status(200).json({
            success: true,
            message: "File Created successfully",
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