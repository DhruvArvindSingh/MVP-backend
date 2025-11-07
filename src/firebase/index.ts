// Import the functions you need from the Admin SDK
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK with service account
const serviceAccount = require("../../firebase-service-account.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // Optional: Add other config if needed
    // projectId: serviceAccount.project_id,
    // storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

// Get Firestore instance
const db = admin.firestore();

export default db;