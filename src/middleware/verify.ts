import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET: string = process.env.JWT_SECRET as string;
export default function verify(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.token;
    console.log("token = ", token);
    if (token) {
        jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
            if (err) {
                res.status(401).json({ message: "Unauthorized" });
            } else {
                req.body.email = decoded.email;
                next();
            }
        });
    } else {
        res.status(401).json({ message: "Unauthorized" });
    }
}