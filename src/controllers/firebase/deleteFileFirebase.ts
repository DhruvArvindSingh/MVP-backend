import { Request, Response } from "express";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import db from "../../firebase/index.js";

export default async function deleteFileFirebase(req: Request, res: Response) {
    const { email, fileName } = req.body;

    if (!email || !fileName) {
        res.status(400).json({
            success: false,
            error: "Missing required fields: email and fileName are required",
        });
        return;
    }

    try {
        const docRef = doc(db, email, fileName);

        // Check if the document exists before deleting
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            return res.status(404).json({
                success: false,
                error: "File not found",
            });
        }

        // Delete the document
        await deleteDoc(docRef);

        return res.status(200).json({
            success: true,
            message: "File deleted successfully",
            fileName: fileName
        });
    } catch (error) {
        console.error("Failed to delete file", error);
        res.status(500).json({
            success: false,
            error: "Failed to delete file"
        });
    }
}