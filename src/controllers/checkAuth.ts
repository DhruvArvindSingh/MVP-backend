import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

interface JWTPayload {
    email: string;
    iat: number;
}

interface AuthResponse {
    success: boolean;
    authenticated?: boolean;
    data?: {
        email: string;
        token: string;
    }
    user?: any;
    message?: string;
    error?: string;
}

const JWT_SECRET: string = process.env.JWT_SECRET as string;

export default function checkAuth(req: Request, res: Response): void {
    const token = req.body.token;

    console.log(`Checking auth for token: ${token ? 'provided' : 'not provided'}`);

    if (!token) {
        const response: AuthResponse = {
            success: false,
            authenticated: false,
            message: "No token provided",
            error: "UNAUTHORIZED"
        };
        res.status(401).json(response);
        return;
    }

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
        if (err) {
            console.error("JWT verification error:", err);
            const response: AuthResponse = {
                success: false,
                authenticated: false,
                message: "Invalid token",
                error: "UNAUTHORIZED"
            };
            res.status(401).json(response);
        } else {
            const payload = decoded as JWTPayload;
            console.log("JWT verified for user:", payload.email);

            const response: AuthResponse = {
                success: true,
                authenticated: true,
                data: {
                    email: payload.email,
                    token: token
                },
                user: {
                    email: payload.email
                },
                message: "Token is valid"
            };
            res.status(200).json(response);
        }
    });
} 