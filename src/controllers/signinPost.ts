import jwt from "jsonwebtoken";
import { getPostgresClient, postgresDbReady } from "../database/postgresClient.js";
import dotenv from "dotenv";
import hash from "../utils/hash.js";
import { Request, Response } from "express";
import { PrismaClientKnownRequestError } from "../generated/postgres/runtime/library.js";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

export default async function signin_post(req: Request, res: Response): Promise<void> {
    console.log("POST /signin received");

    try {
        const { email, password } = req.body;

        // Wait for database connection
        await postgresDbReady;
        const prisma = getPostgresClient();

        // Check if database is available
        if (!prisma) {
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

        // Try to find existing user
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (!existingUser) {
            console.log("user not found, creating user");
            try {
                const newUser = await prisma.user.create({
                    data: {
                        email,
                        password
                    }
                });
                console.log("user created =", newUser);
            } catch (createError) {
                console.error("Failed to create user:", createError);
                res.status(500).json({
                    success: false,
                    error: "Signin failed. Please try again later.",
                    code: "INTERNAL_ERROR"
                });
                return;
            }
        } else {
            if (existingUser.password !== password) {
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