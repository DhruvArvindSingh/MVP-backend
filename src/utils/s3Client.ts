import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const REGION = process.env.AWS_REGION;
const ACCESS_KEY = process.env.AWS_ACCESS_KEY;
const SECRET_KEY = process.env.AWS_SECRET_KEY;

const s3 = new S3Client({
    region: REGION,
    credentials: {
        accessKeyId: ACCESS_KEY as string,
        secretAccessKey: SECRET_KEY as string,
    } as {
        accessKeyId: string;
        secretAccessKey: string;
    },
});

export default s3;