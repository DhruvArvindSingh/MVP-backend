import { Request, Response } from "express";
import db from "../../firebase/index.js";

export default async function getFileFirebase(req: Request, res: Response) {
    const { email, fileName, isPasswordProtected } = req.body;

    if (!email || !fileName) {
        res.status(400).json({
            success: false,
            error: "Missing required fields: email and fileName are required",
        });
        return;
    }

    try {
        // Reference to the specific document
        const Name = isPasswordProtected ? `__password_protected__${fileName}` : fileName;
        const docRef = db.collection(email).doc(Name);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return res.status(404).json({
                success: false,
                error: "File not found"
            });
        }

        const data = docSnap.data();

        return res.status(200).json({
            success: true,
            message: "File retrieved successfully",
            fileName: fileName,
            isPasswordProtected: isPasswordProtected,
            content: data?.fileContent || null,
            lastModified: data?.lastModified || null,
            contentType: data?.contentType || "text/plain", // fallback if not stored
        });
    } catch (error) {
        console.error("Failed to retrieve file", error);
        res.status(500).json({
            success: false,
            error: "Failed to retrieve file"
        });
    }
}