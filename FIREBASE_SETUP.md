# Firebase Setup Guide

This guide will help you set up Firebase Firestore for the MVP Backend service.

## Problem Solved

The "Missing or insufficient permissions" error occurred because the backend was using Firebase Web SDK, which requires user authentication. Backend services should use Firebase Admin SDK with service account authentication.

## Changes Made

1. **Installed Firebase Admin SDK**: `npm install firebase-admin`
2. **Updated Firebase configuration** to use Admin SDK with service account authentication
3. **Migrated all Firebase controllers** to use Admin SDK API

## Setup Steps

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select existing project
3. Enable Firestore Database

### 2. Create Service Account

1. In Firebase Console, go to **Project Settings** → **Service Accounts**
2. Click **"Generate new private key"**
3. Download the JSON file (keep it secure!)
4. Rename it to `firebase-service-account.json` and place it in the project root

### 3. Configure Environment Variables

Add to your `.env` file:

```env
# Firebase Admin SDK Configuration
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./firebase-service-account.json
```

**Alternative (less secure, development only):**
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

### 4. Configure Firestore Security Rules

In Firebase Console → Firestore Database → Rules, set:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow backend service full access
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **Security Warning**: The above rules allow full access. For production, implement proper security rules based on your authentication system.

### 5. Test the Setup

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the server:
   ```bash
   npm run start:dev
   ```

3. Test Firebase operations:
   ```bash
   curl -X POST http://localhost:3000/api/v1/listAllFirebase \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com"}'
   ```

## Firebase Admin SDK vs Web SDK

| Feature | Web SDK | Admin SDK |
|---------|---------|-----------|
| **Purpose** | Client-side apps | Backend services |
| **Authentication** | User authentication required | Service account authentication |
| **Security Rules** | Must comply with Firestore rules | Bypasses security rules (full access) |
| **API Access** | Limited to authenticated operations | Full administrative access |

## Troubleshooting

### Still getting permissions error?

1. **Check service account key**: Ensure `firebase-service-account.json` exists and has correct permissions
2. **Verify project ID**: Make sure the service account matches your Firebase project
3. **Check Firestore rules**: Ensure rules allow the operations you're trying to perform
4. **Environment variables**: Confirm `.env` file is loaded correctly

### Service account not working?

1. **Regenerate service account key** in Firebase Console
2. **Check file permissions**: Ensure the key file is readable by the application
3. **Verify project access**: Service account must have Firestore access

### Build errors?

1. **Clear node_modules**: `rm -rf node_modules && npm install`
2. **Rebuild**: `npm run build`
3. **Check TypeScript errors**: Ensure all Firebase imports are correct

## Security Best Practices

1. **Never commit service account keys** to version control
2. **Use environment variables** for sensitive configuration
3. **Implement proper security rules** for production
4. **Rotate service account keys** regularly
5. **Limit service account permissions** to only required resources

## Next Steps

After setup, you can:
- Test all Firebase operations (list, upload, get, delete)
- Implement proper authentication-based security rules
- Add Firebase Storage integration if needed
- Configure monitoring and logging
