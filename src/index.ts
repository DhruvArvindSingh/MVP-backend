import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import listAllS3 from "./controllers/listAllS3";
import cookieParser from "cookie-parser";
import verify from "./middleware/verify";
import hash_pass from "./middleware/hash_pass";
import signupPost from "./controllers/signupPost";
import signinPost from "./controllers/signinPost";
import uploadFileS3 from "./controllers/uploadFileS3";
import getFileS3 from "./controllers/getFileS3";
import deleteFileS3 from "./controllers/deleteFileS3";
import listAllDropbox from "./controllers/listAllDropbox";
import getFileDropbox from "./controllers/getFileDropbox";
import uploadFileDropbox from "./controllers/uploadFileDropbox";
import deleteFileDropbox from "./controllers/deleteFileDropbox";

dotenv.config();

const PORT = process.env.PORT || 3001; // Backend runs on 3001, frontend on 3000
const app = express();

// CORS configuration - allow all origins without credentials
app.use(cors({
    origin: true, // Allow all origins
    credentials: false, // Don't allow credentials
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

app.post("/api/v1/listAllS3", verify, listAllS3);
app.post("/api/v1/listAllDropbox", verify, listAllDropbox);
app.post("/api/v1/getFileDropbox", verify, getFileDropbox);
app.post("/api/v1/uploadFileDropbox", verify, uploadFileDropbox);
app.post("/api/v1/deleteFileDropbox", verify, deleteFileDropbox);
app.post("/api/v1/signup", hash_pass, signupPost);
app.post("/api/v1/signin", hash_pass, signinPost);
app.post("/api/v1/uploadFileS3", verify, uploadFileS3);
app.post("/api/v1/getFileS3", verify, getFileS3);
app.post("/api/v1/deleteFileS3", verify, deleteFileS3);



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});