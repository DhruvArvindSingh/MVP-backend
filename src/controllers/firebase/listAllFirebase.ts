import { Request, Response } from "express";
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
        const colRef = db.collection(email);

        // Get all documents in the collection
        const snapshot = await colRef.get();

        // Build files object: { docId: lastModified }
        const files: Record<string, string> = {};
        const passwordProtectedFiles: Record<string, string> = {};
        snapshot.docs.forEach((doc: any) => {
            const data = doc.data();
            if (doc.id.startsWith("__password_protected__")) {
                passwordProtectedFiles[doc.id.replace("__password_protected__", "")] = data.lastModified || null;
            }
            else {
                files[doc.id] = data.lastModified || null; // fallback if missing
            }
        });

        return res.status(200).json({
            success: true,
            files: files,
            passwordProtectedFiles: passwordProtectedFiles,
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