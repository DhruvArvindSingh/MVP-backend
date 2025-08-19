import { Request, Response } from "express";
import { doc, getDoc, setDoc } from "firebase/firestore";
import db from "../../firebase/index.js";

export default async function uploadFileFirebase(req: Request, res: Response) {
    const { email, fileName, fileContent } = req.body;
    if (!email || !fileName || !fileContent) {
        res.status(400).json({
            success: false,
            error: "Missing required fields: email, fileName and content are required"
        });
        return;
    }
    try {
        const docRef = doc(db, email, fileName);

        // Check if document exists
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            await setDoc(doc(db, email, fileName), {
                fileContent: fileContent,
                lastModified: new Date().toISOString()
            }, { merge: true });
            return res.status(200).json({
                success: true,
                message: "File Updated successfully",
                fileName: fileName
            });
        }
        await setDoc(doc(db, email, fileName), {
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