import express from "express";
import dotenv from "dotenv";
import { listAllS3 } from "./controllers/listAllS3.js";
import cookieParser from "cookie-parser";
import verify from "./middleware/verify.js";
import hash_pass from "./middleware/hash_pass.js";
import signupPost from "./controllers/signupPost.js";
import signinPost from "./controllers/signinPost.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

app.post("/api/v1/listAllS3", verify, listAllS3);
app.post("/api/v1/signup", hash_pass, signupPost);
app.post("/api/v1/signin", signinPost);



app.listen(3000, () => {
    console.log("Server is running on port 3000");
});