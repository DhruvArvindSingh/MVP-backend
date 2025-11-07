// Import the functions you need from the SDKs you need
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

// Firebase Admin SDK configuration for backend service
let db: FirebaseFirestore.Firestore;

try {
    // Try to initialize with service account key file if available
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH ||
        path.join(process.cwd(), 'firebase-service-account.json');

    if (fs.existsSync(serviceAccountPath)) {
        // Use service account key file
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        const app = initializeApp({
            credential: cert(serviceAccount),
            projectId: serviceAccount.project_id
        });
        db = getFirestore(app);
        console.log("Firebase initialized with service account key file");
    } else {
        // Fallback to environment variables (less secure, for development only)
        console.warn("Warning: No service account key file found. Using environment variables (not recommended for production)");
        const app = initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            }),
            projectId: process.env.FIREBASE_PROJECT_ID
        });
        db = getFirestore(app);
        console.log("Firebase initialized with environment variables");
    }
} catch (error) {
    console.error("Failed to initialize Firebase:", error);
    throw error;
}

export default db;