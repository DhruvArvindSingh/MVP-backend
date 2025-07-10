import client, { dbConnected } from "../database/index.js";
import { Request, Response, NextFunction } from "express";

export default async function signup_post(req: Request, res: Response): Promise<void> {
    console.log("POST /signup received");

    const { email, password } = req.body;

    try {
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

        // Insert user into the database
        const user = await client.query(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
            [email, password]
        );

        console.log("Signup successful for:", user.rows[0]);

        res.status(200).json({
            success: true,
            message: "Signup successful",
            data: {
                email: email,
                userId: user.rows[0].id
            }
        });
    } catch (e: any) {
        console.error("An error occurred during signup:", e);

        // Handle unique constraint violation (duplicate email)
        if (e.code === '23505') {
            res.status(409).json({
                success: false,
                error: "Email already exists. Please use a different email.",
                code: "EMAIL_EXISTS"
            });
        } else {
            res.status(500).json({
                success: false,
                error: "Signup failed. Please try again later.",
                code: "INTERNAL_ERROR"
            });
        }
    }
}