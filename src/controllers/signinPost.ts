import jwt from "jsonwebtoken";
import client, { dbConnected } from "../database";
import dotenv from "dotenv";
import hash from "../utils/hash.js";
import { Request, Response, NextFunction } from "express";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

export default async function signin_post(req: Request, res: Response): Promise<void> {
    console.log("POST /signin received");

    try {
        const { email, password } = req.body;

        // Check if database is available
        if (!dbConnected || !client) {
            res.status(503).json({
                success: false,
                error: "Database service unavailable. Please contact administrator.",
                code: "DATABASE_UNAVAILABLE"
            });
            return;
        }

        // Validate input
        if (!email || !password) {
            res.status(400).json({
                success: false,
                error: "Email and password are required",
                code: "MISSING_FIELDS"
            });
            return;
        }
        const user = await client.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );
        if (user.rows.length === 0) {
            console.log("user not found, creating user");
            const user1 = await client.query(
                "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
                [email, password]
            );
            console.log("user1 =", user1);
            if (user1.rows.length === 0) {
                res.status(500).json({
                    success: false,
                    error: "Signin failed. Please try again later.",
                    code: "INTERNAL_ERROR"
                });
                return;
            }
        } else {
            if (user.rows[0].password !== password) {
                res.status(401).json({
                    success: false,
                    error: "Invalid email or password",
                    code: "INVALID_CREDENTIALS"
                });
                return;
            }
        }
        const token = jwt.sign({ email: email }, JWT_SECRET);
        console.log("token =", token);
        res.status(200).json({
            success: true,
            message: "Signin successful",
            data: {
                token: token,
                email: email
            }
        });
    } catch (e: any) {
        console.error("An error occurred during signin:", e);
        res.status(500).json({
            success: false,
            error: "Signin failed. Please try again later.",
            code: "INTERNAL_ERROR"
        });
    }
}