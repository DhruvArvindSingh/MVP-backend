import { Request, Response } from "express";
import lighthouse, { apiKey } from "../../lighthouse/index";
import fetch from "isomorphic-fetch";

export default async function getFileLighthouse(req: Request, res: Response) {
    const { email, fileName } = req.body;
    if (!email || !fileName) {
        res.status(400).json({
            success: false,
            error: "Missing required fields: email and fileName are required"
        });
        return;
    }

    try {
        // Get the uploads list to find the file with matching name
        const uploadsResponse = await lighthouse.getUploads(`${apiKey}`, null);
        const fileList = uploadsResponse.data?.fileList || [];

        // Find the file with the matching name
        const fileData = fileList.find((file: any) => file.fileName === fileName);

        if (!fileData) {
            return res.status(404).json({
                success: false,
                error: "File not found"
            });
        }

        // Download the file from IPFS
        const cid = fileData.cid;
        const ipfsUrl = `https://gateway.lighthouse.storage/ipfs/${cid}`;

        const response = await fetch(ipfsUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch file from IPFS: ${response.statusText}`);
        }

        const buffer = await response.arrayBuffer();
        const fileBuffer = Buffer.from(buffer);

        // Set appropriate headers for file download
        return res.status(200).json({
            success: true,
            message: "File retrieved successfully",
            fileName: fileName,
            isPasswordProtected: false,
            content: fileBuffer.toString('utf8'),
            lastModified: new Date().toISOString(),
            contentType: "text/plain", // fallback if not stored
        });
    } catch (error) {
        console.error("Failed to get file from Lighthouse:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get file from Lighthouse"
        });
    }
}