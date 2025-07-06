# MVP Backend API Documentation

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
Most endpoints require JWT authentication via the `verify` middleware. Include the JWT token in cookies.

---

## 📁 **File Management Endpoints**

### 1. **List S3 Files**
```http
POST /listAllS3
```

**Headers:**
```
Content-Type: application/json
Cookie: token=your-jwt-token
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "email": "user@example.com",
  "s3Files": {
    "document.pdf": 1640995200000,
    "image.jpg": 1640995300000
  },
  "count": 2
}
```

---

### 2. **List Dropbox Files**
```http
POST /listAllDropbox
```

**Headers:**
```
Content-Type: application/json
Cookie: token=your-jwt-token
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "email": "user@example.com",
  "dropboxFiles": {
    "document.pdf": 1640995200000,
    "notes.txt": 1640995400000
  },
  "count": 2
}
```

---

### 3. **Download File from Dropbox**
```http
POST /getFileDropbox
```

**Headers:**
```
Content-Type: application/json
Cookie: token=your-jwt-token
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "fileName": "document.pdf"
}
```

**Success Response (200) - Text File:**
```json
{
  "success": true,
  "data": {
    "fileName": "document.txt",
    "size": 1024,
    "modified": "2024-01-15T10:30:00Z",
    "contentType": "text/plain",
    "content": "This is the actual text content of the file",
    "encoding": "text",
    "isText": true,
    "email": "user@example.com"
  }
}
```

**Success Response (200) - Binary File:**
```json
{
  "success": true,
  "data": {
    "fileName": "document.pdf",
    "size": 1024,
    "modified": "2024-01-15T10:30:00Z",
    "contentType": "application/pdf",
    "content": "base64-encoded-file-content",
    "encoding": "base64",
    "isText": false,
    "email": "user@example.com"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "File not found in Dropbox. The file may have been moved or deleted.",
  "code": "FILE_NOT_FOUND"
}
```

---

### 4. **Upload File to S3**
```http
POST /uploadFileS3
```

**Headers:**
```
Content-Type: application/json
Cookie: token=your-jwt-token
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "fileName": "document.txt",
  "content": "File content here"
}
```

**Success Response (200):**
```json
{
  "message": "File uploaded successfully",
  "fileName": "document.txt",
  "filePath": "user@example.com/document.txt",
  "email": "user@example.com"
}
```

---

### 5. **Download File from S3**
```http
POST /getFileS3
```

**Headers:**
```
Content-Type: application/json
Cookie: token=your-jwt-token
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "fileName": "document.txt"
}
```

**Success Response (200) - Text File:**
```json
{
  "success": true,
  "data": {
    "fileName": "document.txt",
    "size": 1024,
    "modified": "2024-01-15T10:30:00Z",
    "contentType": "text/plain",
    "content": "File content here",
    "encoding": "text",
    "isText": true,
    "filePath": "user@example.com/document.txt",
    "email": "user@example.com"
  }
}
```

**Success Response (200) - Binary File:**
```json
{
  "success": true,
  "data": {
    "fileName": "document.pdf",
    "size": 1024,
    "modified": "2024-01-15T10:30:00Z",
    "contentType": "application/pdf",
    "content": "base64-encoded-file-content",
    "encoding": "base64",
    "isText": false,
    "filePath": "user@example.com/document.pdf",
    "email": "user@example.com"
  }
}
```

---

### 6. **Delete File from S3**
```http
POST /deleteFileS3
```

**Headers:**
```
Content-Type: application/json
Cookie: token=your-jwt-token
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "fileName": "document.txt"
}
```

**Success Response (200):**
```json
{
  "message": "File deleted successfully",
  "fileName": "document.txt",
  "filePath": "user@example.com/document.txt"
}
```

---

## 👤 **Authentication Endpoints**

### 7. **User Signup**
```http
POST /signup
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Success Response (200):**
```json
{
  "message": "Signup successful"
}
```

**Error Response (500):**
```json
{
  "error": "Signup failed. Please try again later."
}
```

---

### 8. **User Signin**
```http
POST /signin
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

*Note: JWT token is set as an HTTP-only cookie*

---

## 🔧 **Environment Variables Required**

Create a `.env` file in the project root with:

```env
# Database
DATABASE_LINK=postgresql://username:password@localhost:5432/database_name

# JWT
JWT_SECRET=your-super-secret-jwt-key

# AWS S3
S3_BUCKET=your-s3-bucket-name
S3_REGION=us-east-1
S3_ACCESS_KEY=your-aws-access-key
S3_SECRET_KEY=your-aws-secret-key

# Dropbox
DROPBOX_ACCESS_TOKEN=your-dropbox-access-token

# Server
PORT=3000
```

---

## 🚀 **Quick Start**

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Start development server:**
   ```bash
   npm run start:dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm run start:prod
   ```

---

## 📝 **Error Codes**

| Code | Description |
|------|-------------|
| `AUTHENTICATION_FAILED` | Invalid or expired token |
| `FILE_NOT_FOUND` | File doesn't exist |
| `PERMISSION_DENIED` | Insufficient permissions |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Server error |

---

## 📂 **File Organization**

All files are organized by email folders:
- S3: `bucket/user@example.com/filename.ext`
- Dropbox: `/user@example.com/filename.ext`

This ensures user data isolation and easy management. 