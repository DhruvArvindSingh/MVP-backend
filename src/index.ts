import express from "express";
import dotenv from "dotenv";
import { listAllS3 } from "./controllers/listAllS3.js";
import cookieParser from "cookie-parser";
import verify from "./middleware/verify.js";
import hash_pass from "./middleware/hash_pass.js";
import signupPost from "./controllers/signupPost.js";
import signinPost from "./controllers/signinPost.js";
import uploadFileS3 from "./controllers/uploadFileS3.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

app.post("/api/v1/listAllS3", verify, listAllS3);
app.post("/api/v1/signup", hash_pass, signupPost);
app.post("/api/v1/signin", signinPost);
app.post("/api/v1/uploadFileS3", verify, uploadFileS3);


app.listen(3000, () => {
    console.log("Server is running on port 3000");
});