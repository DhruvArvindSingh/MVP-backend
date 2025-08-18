import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import verify from "./middleware/verify";
import hash_pass from "./middleware/hash_pass";
import {
    checkAuth,
    listAllS3,
    listAllDropbox,
    getFileDropbox,
    uploadFileDropbox,
    deleteFileDropbox,
    signupPost,
    signinPost,
    uploadFileS3,
    getFileS3, deleteFileS3, uploadLogo,
    listAllPostgres,
    uploadFilePostgres,
    getFilePostgres,
    deleteFilePostgres
} from "./controllers";
import { dbReady } from "./database/index.js";

dotenv.config();

const PORT = process.env.PORT || 3001; // Backend runs on 3001, frontend on 3000
const app: Express = express();

// CORS configuration - allow all origins without credentials
app.use(cors({
    origin: true, // Allow all origins
    credentials: false, // Don't allow credentials
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Increase payload limits for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());


//dropbox
app.post("/api/v1/listAllDropbox", verify, listAllDropbox);
app.post("/api/v1/uploadFileDropbox", verify, uploadFileDropbox);
app.post("/api/v1/getFileDropbox", verify, getFileDropbox);
app.post("/api/v1/deleteFileDropbox", verify, deleteFileDropbox);

//auth
app.post("/api/v1/signup", hash_pass, signupPost);
app.post("/api/v1/signin", hash_pass, signinPost);
app.post("/api/v1/checkAuth", checkAuth);

//s3
app.post("/api/v1/listAllS3", verify, listAllS3);
app.post("/api/v1/uploadFileS3", verify, uploadFileS3);
app.post("/api/v1/getFileS3", verify, getFileS3);
app.post("/api/v1/deleteFileS3", verify, deleteFileS3);
app.post("/api/v1/uploadLogo", verify, uploadLogo);

//postgres
app.post("/api/v1/listAllPostgres", verify, listAllPostgres);
app.post("/api/v1/uploadFilePostgres", verify, uploadFilePostgres);
app.post("/api/v1/getFilePostgres", verify, getFilePostgres);
app.post("/api/v1/deleteFilePostgres", verify, deleteFilePostgres);


async function startServer() {
    try {
        await dbReady;
        console.log("📋 Database schema verification completed");

        const port = process.env.PORT || 4000;
        app.listen(port, () => {
            console.log(`[server]: Server is running at http://localhost:${port}`);
        });
    } catch (error) {
        console.error("❌ Failed to initialize database connection:", error);
        process.exit(1);
    }
}

startServer();