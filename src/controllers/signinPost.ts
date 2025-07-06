import jwt from "jsonwebtoken";
import client from "../database";
import dotenv from "dotenv";
import hash from "../utils/hash.js";
import { Request, Response, NextFunction } from "express";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

export default async function signin_post(req: Request, res: Response) {
    console.log("post signin received");
    const { email, password } = req.body;
    const user = await client.query("SELECT * FROM users WHERE email = $1 AND password = $2", [email, await Promise.resolve(hash(password))]);
    // console.log("user =",user);
    const user_email = user.rows[0].email;
    console.log("user_email = ", user_email);
    if (user.rows.length > 0) {
        const token = jwt.sign({ email: user_email }, JWT_SECRET);
        console.log("token = ", token);
        res.cookie("token", token);
        res.status(200).json({ message: "Signin successful" });
    }
    else {
        console.log("user not found");
    }
}