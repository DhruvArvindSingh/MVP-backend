import client from "../database/index.js";
import { Request, Response, NextFunction } from "express";

export default async function signup_post(req: Request, res: Response) {
    console.log("POST /signup received");

    const { email, password } = req.body;

    try {
        // Insert user into the database
        const user = await client.query(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
            [email, password]
        );

        console.log("Signup successful for:", user.rows[0]);

        // Redirect to the signin page
        res.status(200).json({ message: "Signup successful" });
    } catch (e) {
        console.error("An error occurred during signup:", e);

        // Respond with an error message
        res.status(500).json({ error: "Signup failed. Please try again later." });
    }
}