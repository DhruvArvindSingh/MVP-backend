import { Request, Response } from "express";
import { ListObjectsV2Command, ListObjectsV2CommandOutput } from "@aws-sdk/client-s3";
import s3 from "../../utils/s3Client.js";
import dotenv from "dotenv";

dotenv.config();

// You'll need to set this environment variable or pass it as a parameter
const BUCKET = process.env.S3_BUCKET;

interface S3FileObject {
    [key: string]: number;
}

export default async function listAllS3(req: Request, res: Response): Promise<void> {
    try {
        const email: string = req.body.email;
        console.log("email = ", email);
        console.log("listAllS3 called with email", email);

        if (!email || typeof email !== 'string') {
            res.status(400).json({
                success: false,
                error: "Email parameter is required and must be a string"
            });
            return;
        }

        if (!BUCKET) {
            console.log("BUCKET = ", BUCKET);
            res.status(500).json({
                success: false,
                error: "S3_BUCKET environment variable is not configured"
            });
            return;
        }

        const command = new ListObjectsV2Command({
            Bucket: BUCKET,
            Prefix: email + "/" // Add trailing slash to ensure we're looking in the folder
        });
        const data: ListObjectsV2CommandOutput = await s3.send(command);
        const contents = data.Contents || [];

        const filesObj: S3FileObject = {};
        contents.forEach(file => {
            if (file.Key && file.LastModified) {
                // Remove the email prefix from the key for cleaner response
                const fileName = file.Key.replace(`${email}/`, '');
                if (fileName) { // Only include if there's a filename after removing prefix
                    filesObj[fileName] = file.LastModified.getTime();
                }
            }
        });

        res.status(200).json({
            success: true,
            email: email,
            s3Files: filesObj,
            count: Object.keys(filesObj).length
        });
    } catch (err) {
        console.error("Failed to load files from S3", err);
        res.status(500).json({
            success: false,
            error: "Failed to load files from S3",
            message: err instanceof Error ? err.message : "Unknown error"
        });
    }
};