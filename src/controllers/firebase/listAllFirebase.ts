import { Request, Response } from "express";
import { collection, getDocs } from "firebase/firestore";
import db from "../../firebase/index.js";

export default async function listAllFirebase(req: Request, res: Response) {
    const { email } = req.body;

    if (!email) {
        res.status(400).json({
            success: false,
            error: "Missing required field: email is required",
        });
        return;
    }

    try {
        const colRef = collection(db, email);

        // Get all documents in the collection
        const snapshot = await getDocs(colRef);

        // Build files object: { docId: lastModified }
        const files: Record<string, string> = {};
        snapshot.docs.forEach((doc) => {
            const data = doc.data();
            files[doc.id] = data.lastModified || null; // fallback if missing
        });

        return res.status(200).json({
            success: true,
            files: files,
            count: Object.keys(files).length,
        });
    } catch (error) {
        console.error("Failed to list files", error);
        res.status(500).json({
            success: false,
            error: "Failed to list files"
        });
    }
}