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
    getFileS3, deleteFileS3, uploadLogo, createBarCode,
    listAllPostgres,
    uploadFilePostgres,
    getFilePostgres,
    deleteFilePostgres,
    listAllFirebase,
    uploadFileFirebase,
    getFileFirebase,
    deleteFileFirebase,
    listAllMongo,
    uploadFileMongo,
    getFileMongo,
    deleteFileMongo,
    listAllNeo4j,
    uploadFileNeo4j,
    getFileNeo4j,
    deleteFileNeo4j
} from "./controllers";

import { dbReady } from "./database/index.js";
import { postgresDbReady } from "./database/postgresClient.js";
import { nativeMongoDbReady } from "./database/nativeMongoClient.js";
import client from "./neo4j/index.js";


dotenv.config();

const PORT = process.env.PORT || 3000; // Backend runs on 3001, frontend on 3000
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
app.use(express.static("public"));

// Set the view engine to ejs
app.set("view engine", "ejs");
app.set("views", "src/views");


//dropbox
app.post("/api/v1/listAllDropbox", verify, listAllDropbox);
app.post("/api/v1/uploadFileDropbox", verify, uploadFileDropbox);
app.post("/api/v1/getFileDropbox", verify, getFileDropbox);
app.post("/api/v1/deleteFileDropbox", verify, deleteFileDropbox);

//auth
app.post("/api/v1/signup", hash_pass, signupPost);
app.post("/api/v1/signin", hash_pass, signinPost);
app.post("/api/v1/verify", checkAuth);
app.post("/api/v1/checkAuth", checkAuth);

// GET routes for pages
app.get("/login", (req: Request, res: Response) => {
    res.render("login");
});

app.get("/", (req: Request, res: Response) => {
    res.render("home");
});


//s3
app.post("/api/v1/listAllS3", verify, listAllS3);
app.post("/api/v1/uploadFileS3", verify, uploadFileS3);
app.post("/api/v1/getFileS3", verify, getFileS3);
app.post("/api/v1/deleteFileS3", verify, deleteFileS3);
app.post("/api/v1/uploadLogo", verify, uploadLogo);
app.post("/api/v1/createBarCode", verify, createBarCode);

//postgres
app.post("/api/v1/listAllPostgres", verify, listAllPostgres);
app.post("/api/v1/uploadFilePostgres", verify, uploadFilePostgres);
app.post("/api/v1/getFilePostgres", verify, getFilePostgres);
app.post("/api/v1/deleteFilePostgres", verify, deleteFilePostgres);

//firebase
app.post("/api/v1/listAllFirebase", verify, listAllFirebase);
app.post("/api/v1/uploadFileFirebase", verify, uploadFileFirebase);
app.post("/api/v1/getFileFirebase", verify, getFileFirebase);
app.post("/api/v1/deleteFileFirebase", verify, deleteFileFirebase);

//mongodb
app.post("/api/v1/listAllMongo", verify, listAllMongo);
app.post("/api/v1/uploadFileMongo", verify, uploadFileMongo);
app.post("/api/v1/getFileMongo", verify, getFileMongo);
app.post("/api/v1/deleteFileMongo", verify, deleteFileMongo);

//neo4j
app.post("/api/v1/listAllNeo4j", verify, listAllNeo4j);
app.post("/api/v1/uploadFileNeo4j", verify, uploadFileNeo4j);
app.post("/api/v1/getFileNeo4j", verify, getFileNeo4j);
app.post("/api/v1/deleteFileNeo4j", verify, deleteFileNeo4j);


async function startServer() {
    try {
        console.log("🚀 Starting server...");

        // Start the server immediately - database connections will happen in background
        app.listen(PORT, () => {
            console.log(`[server]: Server is running at http://localhost:${PORT}`);
            console.log("🔗 Available database endpoints:");
            console.log("  - PostgreSQL (Prisma): /api/v1/*Postgres");
            console.log("  - MongoDB (Native): /api/v1/*Mongo");
            console.log("  - Firebase: /api/v1/*Firebase");
            console.log("  - Neo4j: /api/v1/*Neo4j");
            console.log("  - AWS S3: /api/v1/*S3");
            console.log("  - Dropbox: /api/v1/*Dropbox");
            console.log("📋 Database connections are initializing in background...");
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
}

startServer();
