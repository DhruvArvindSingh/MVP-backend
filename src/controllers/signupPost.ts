import { getPostgresClient, postgresDbReady } from "../database/postgresClient.js";
import { Request, Response } from "express";
import { PrismaClientKnownRequestError } from "../generated/postgres/runtime/library.js";

export default async function signup_post(req: Request, res: Response): Promise<void> {
    console.log("POST /signup received");

    const { email, password } = req.body;

    try {
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

        // Insert user into the database using Prisma
        const user = await prisma.user.create({
            data: {
                email,
                password
            }
        });

        console.log("Signup successful for:", user);

        res.status(200).json({
            success: true,
            message: "Signup successful",
            data: {
                email: email,
                userId: user.id
            }
        });
    } catch (e: any) {
        console.error("An error occurred during signup:", e);

        // Handle unique constraint violation (duplicate email) using Prisma error
        if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
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