# MVP Backend - Universal File Management System

A comprehensive, production-ready backend service that provides unified file management across multiple databases and cloud storage platforms with JWT authentication and Docker deployment support.

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)
![Docker](https://img.shields.io/badge/Docker-Supported-blue)
![License](https://img.shields.io/badge/License-ISC-yellow)

## 🚀 **Overview**

MVP Backend is a universal file management system that allows you to seamlessly manage files across multiple storage platforms through a single, unified API. Whether you're using cloud databases, local storage, or third-party services, this backend provides consistent CRUD operations with enterprise-grade security and deployment options.

## ✨ **Key Features**

### 🗄️ **Multi-Database Support**
- **PostgreSQL** (via Prisma ORM) - Relational database with ACID compliance
- **MongoDB** (Native Driver) - NoSQL document database
- **Firebase Firestore** - Real-time cloud database
- **Neo4j** - Graph database for complex relationships

### ☁️ **Cloud Storage Integration**
- **AWS S3** - Scalable object storage with presigned URLs
- **Dropbox** - File synchronization and sharing
- **Firebase Storage** - Google's cloud storage solution

### 🔐 **Security & Authentication**
- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt password encryption
- **User Isolation** - Email-based file organization
- **Password-Protected Files** - Optional file-level protection
- **Token Verification** - Comprehensive auth middleware

### 🎨 **Frontend Interface**
- **Web Dashboard** - Beautiful, responsive file manager UI
- **Multi-Tab Interface** - Switch between 5 storage platforms (PostgreSQL, MongoDB, Firebase, Neo4j, AWS S3)
- **Real-time Updates** - Live file operations and notifications
- **Modern Design** - Clean, intuitive user experience

### 🐳 **Deployment Options**
- **Docker Support** - Development and production containers
- **Cloud Deployment** - Production-ready cloud configurations
- **EC2 Deployment** - AWS/GCP VM deployment scripts
- **Local Development** - Quick setup for development

### 🔧 **Utility Features**
- **Barcode Generation** - Create and store barcodes in S3
- **Logo Upload** - Specialized logo management with S3 integration
- **Health Monitoring** - Application health checks and status endpoints
- **Error Handling** - Comprehensive error management and logging

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend UI   │    │   Express API    │    │   Databases     │
│   (EJS Views)   │◄──►│  (TypeScript)    │◄──►│   & Storage     │
│                 │    │                  │    │                 │
│ • File Manager  │    │ • JWT Auth       │    │ • PostgreSQL    │
│ • Dashboard     │    │ • CRUD Ops       │    │ • MongoDB       │
│ • User Login    │    │ • File Upload    │    │ • Firebase      │
└─────────────────┘    │ • Middleware     │    │ • Neo4j         │
                       │ • Error Handling │    │ • AWS S3        │
                       └──────────────────┘    │ • Dropbox       │
                                               └─────────────────┘
```

## 📊 **Supported Platforms**

| Platform | Operations | Features |
|----------|------------|----------|
| **PostgreSQL** | Create, Read, Update, Delete | Prisma ORM, ACID compliance, Relations |
| **MongoDB** | Create, Read, Update, Delete | Native driver, Document storage, Flexible schema |
| **Firebase** | Create, Read, Update, Delete | Real-time sync, Cloud integration, Auto-scaling |
| **Neo4j** | Create, Read, Update, Delete | Graph relationships, Cypher queries, Pattern matching |
| **AWS S3** | Upload, Download, Delete, List | Presigned URLs, Bucket organization, Scalable storage |
| **Dropbox** | Upload, Download, Delete, List | File sync, Sharing capabilities, Version control |

## 🛠️ **Technology Stack**

### **Backend Core**
- **Runtime**: Node.js 18.x
- **Language**: TypeScript 5.8.3
- **Framework**: Express.js 4.21.2
- **Authentication**: JSON Web Tokens (JWT)

### **Databases & ORMs**
- **PostgreSQL**: Prisma Client 6.0.0
- **MongoDB**: Native MongoDB Driver 6.19.0
- **Firebase**: Firebase SDK 12.1.0
- **Neo4j**: Neo4j Driver 5.28.1

### **Cloud Services**
- **AWS SDK**: S3 Client 3.844.0
- **Dropbox**: Dropbox SDK 10.34.0
- **Firebase**: Cloud Firestore & Storage

### **Development Tools**
- **Build Tool**: TypeScript Compiler
- **Process Manager**: PM2 (for production)
- **API Testing**: Built-in health checks
- **Container**: Docker & Docker Compose

## 🚀 **Quick Start**

### **1. Clone Repository**
```bash
git clone <repository-url>
cd MVP-backend
```

### **2. Environment Setup**
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

### **3. Install Dependencies**
```bash
npm install
```

### **4. Generate Database Clients**
```bash
npm run db:generate
```

### **5. Start Development Server**
```bash
# Build the project
npm run build

# Start in development mode
npm run start:dev
```

### **6. Access Application**
- **API Base URL**: http://localhost:3000/api/v1
- **Web Dashboard**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/v1/verify

## 📋 **API Endpoints**

### **Authentication**
```http
POST /api/v1/signup     # User registration
POST /api/v1/signin     # User login
POST /api/v1/verify     # Token verification
```

### **File Operations (per platform)**
```http
# PostgreSQL
POST /api/v1/listAllPostgres     # List files
POST /api/v1/uploadFilePostgres  # Upload file
POST /api/v1/getFilePostgres     # Download file
POST /api/v1/deleteFilePostgres  # Delete file

# MongoDB
POST /api/v1/listAllMongo        # List files
POST /api/v1/uploadFileMongo     # Upload file
POST /api/v1/getFileMongo        # Download file
POST /api/v1/deleteFileMongo     # Delete file

# Firebase
POST /api/v1/listAllFirebase     # List files
POST /api/v1/uploadFileFirebase  # Upload file
POST /api/v1/getFileFirebase     # Download file
POST /api/v1/deleteFileFirebase  # Delete file

# Neo4j
POST /api/v1/listAllNeo4j        # List files
POST /api/v1/uploadFileNeo4j     # Upload file
POST /api/v1/getFileNeo4j        # Download file
POST /api/v1/deleteFileNeo4j     # Delete file

# AWS S3
POST /api/v1/listAllS3           # List files
POST /api/v1/uploadFileS3        # Upload file
POST /api/v1/getFileS3           # Download file
POST /api/v1/deleteFileS3        # Delete file

# Dropbox
POST /api/v1/listAllDropbox      # List files
POST /api/v1/uploadFileDropbox   # Upload file
POST /api/v1/getFileDropbox      # Download file
POST /api/v1/deleteFileDropbox   # Delete file
```

### **Utility Endpoints**
```http
POST /api/v1/uploadLogo    # Upload logo to S3
POST /api/v1/createBarCode # Generate and store barcode
```

## 🔧 **Configuration**

### **Environment Variables**

```env
# Application
NODE_ENV=development
PORT=3000

# JWT Security
JWT_SECRET=your-super-secure-jwt-secret-32-characters-minimum

# PostgreSQL Database
POSTGRES_DATABASE_LINK=postgresql://username:password@host:5432/database

# MongoDB Database
MONGO_DATABASE_LINK=mongodb://username:password@host:27017/database

# Neo4j Database (Optional)
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password

# AWS S3 (Optional)
S3_BUCKET=your-s3-bucket-name
S3_REGION=us-east-1
S3_ACCESS_KEY=your-aws-access-key
S3_SECRET_KEY=your-aws-secret-key

# Firebase (Optional)
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app

# Dropbox (Optional)
DROPBOX_ACCESS_TOKEN=your-dropbox-access-token
```

## 🐳 **Docker Deployment**

### **Development (with local databases)**
```bash
# Start all services including databases
docker compose up -d --build

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### **Production (cloud databases)**
```bash
# Validate configuration
./validate-production.sh

# Deploy to production
./deploy-production.sh

# Manual deployment
docker compose -f docker-compose.prod.yml up -d --build
```

## 🌐 **Deployment Options**

### **1. Docker Deployment** (Recommended)
- **Development**: Local databases in containers
- **Production**: Cloud databases with optimized containers
- **Files**: `docker-compose.yml`, `docker-compose.prod.yml`

### **2. EC2/VM Deployment**
- **Platform**: AWS EC2, GCP Compute Engine
- **OS**: Ubuntu/Debian
- **Setup**: Automated setup scripts
- **Files**: `ec2.sh`, `setup_postgres.sh`, `setup_mongodb.sh`

### **3. Local Development**
- **Dependencies**: Node.js 18+, PostgreSQL, MongoDB
- **Setup**: Manual installation and configuration
- **Use Case**: Development and testing

## 📁 **Project Structure**

```
MVP-backend/
├── src/
│   ├── controllers/          # API endpoint handlers
│   │   ├── postgres/        # PostgreSQL operations
│   │   ├── mongo/           # MongoDB operations
│   │   ├── firebase/        # Firebase operations
│   │   ├── neo4j/           # Neo4j operations
│   │   ├── s3/              # AWS S3 operations
│   │   └── dropbox/         # Dropbox operations
│   ├── middleware/          # Authentication & validation
│   ├── database/            # Database clients & connections
│   ├── utils/               # Helper functions
│   ├── views/               # Frontend EJS templates
│   └── index.ts             # Application entry point
├── prisma/                  # Database schemas
├── docker-compose.yml       # Development deployment
├── docker-compose.prod.yml  # Production deployment
├── Dockerfile               # Development container
├── Dockerfile.prod          # Production container
├── deploy-production.sh     # Production deployment script
├── validate-production.sh   # Configuration validation
├── API_ENDPOINTS.md         # API documentation
├── DOCKER_DEPLOYMENT.md     # Docker deployment guide
└── EC2_DEPLOYMENT.md        # VM deployment guide
```

## 🔐 **Security Features**

### **Authentication & Authorization**
- JWT token-based authentication
- Password hashing with bcrypt
- Token verification middleware
- Session management

### **Data Protection**
- User data isolation (email-based)
- Optional password-protected files
- Secure environment variable handling
- Input validation and sanitization

### **Production Security**
- Non-root Docker containers
- Resource limits and constraints
- Health checks and monitoring
- Structured logging

## 📈 **Performance Features**

### **Database Optimization**
- Connection pooling for all databases
- Prisma query optimization
- MongoDB native driver for performance
- Neo4j session management

### **Cloud Storage**
- S3 presigned URLs for direct access
- Dropbox API retry logic
- Firebase real-time capabilities
- Efficient file streaming

### **Application Performance**
- TypeScript for type safety
- Express.js middleware optimization
- Error handling and recovery
- Health monitoring endpoints

## 🧪 **Available Scripts**

```bash
# Development
npm run dev              # Watch mode compilation
npm run start:dev        # Start development server

# Production
npm run build            # Build TypeScript
npm run start:prod       # Start production server

# Database Management
npm run db:generate      # Generate all Prisma clients
npm run db:push:postgres # Push PostgreSQL schema
npm run db:push:mongo    # Push MongoDB schema
npm run db:studio:postgres # Open PostgreSQL studio
npm run db:studio:mongo    # Open MongoDB studio
```

## 🎯 **Use Cases**

### **Enterprise File Management**
- Multi-platform file storage and retrieval
- User-based file organization
- Scalable cloud storage integration

### **Development Platform**
- Backend-as-a-Service for file operations
- Multi-database testing environment
- API development and prototyping

### **Cloud Migration**
- Gradual migration between storage platforms
- Data consistency across multiple databases
- Hybrid cloud storage solutions

## 🤝 **Contributing**

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 **API Documentation**

Detailed API documentation is available in [`API_ENDPOINTS.md`](./API_ENDPOINTS.md) including:
- Request/response examples
- Authentication requirements
- Error codes and handling
- Usage examples for all endpoints

## 🚀 **Deployment Guides**

- **Docker Deployment**: [`DOCKER_DEPLOYMENT.md`](./DOCKER_DEPLOYMENT.md)
- **EC2 Deployment**: [`EC2_DEPLOYMENT.md`](./EC2_DEPLOYMENT.md)
- **MongoDB Setup**: [`MONGODB_IMPLEMENTATION_SUMMARY.md`](./MONGODB_IMPLEMENTATION_SUMMARY.md)
- **Prisma Setup**: [`PRISMA_SETUP.md`](./PRISMA_SETUP.md)

## 📞 **Support**

For support and questions:
1. Check the documentation files
2. Review the API endpoints guide
3. Examine the deployment guides
4. Open an issue for bugs or feature requests

## 📄 **License**

This project is licensed under the ISC License - see the LICENSE file for details.

---

**🎯 Ready to get started? Follow the Quick Start guide above and you'll have a fully functional multi-platform file management system running in minutes!**
