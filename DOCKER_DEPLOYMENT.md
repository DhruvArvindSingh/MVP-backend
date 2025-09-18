# Docker Deployment Guide

This comprehensive guide covers deploying the MVP Backend using Docker containers in both development and production environments.

## 🏗️ Overview

The MVP Backend supports two Docker deployment approaches:

1. **Development/Local Deployment** - Includes local PostgreSQL and MongoDB containers
2. **Production Deployment** - Uses cloud-hosted databases only

## 📋 Prerequisites

- **Docker** (v20.10 or later)
- **Docker Compose** (v2.0 or later)
- **Git** (for cloning the repository)

### Installation Check
```bash
# Verify installations
docker --version
docker compose version
git --version
```

---

## 🚀 Development/Local Deployment

This setup includes local database containers and is perfect for development and testing.

### 📁 Files Used
- `docker-compose.yml` - Main compose file with all services
- `Dockerfile` - Standard development Dockerfile
- `.env` - Local environment variables
- `mongo-init.js` - MongoDB initialization script

### 🔧 Setup Steps

#### 1. Clone and Prepare
```bash
# Clone the repository
git clone <repository-url>
cd MVP-backend

# Ensure .env file exists with local configuration
cp .env.example .env  # if .env doesn't exist
```

#### 2. Configure Environment Variables
The `.env` file should contain:
```env
# Local Development Configuration
NODE_ENV=development
PORT=3000

# Local Database Links (using Docker service names)
POSTGRES_DATABASE_LINK=postgresql://myuser:mypassword@localhost:5432/mydatabase
MONGO_DATABASE_LINK=mongodb://username:password@localhost:27017/database_name?authSource=database_name

# JWT Configuration
JWT_SECRET=your-development-jwt-secret

# Neo4j (Optional)
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password

# Other services (Optional)
S3_ACCESS_KEY=your-s3-key
S3_SECRET_KEY=your-s3-secret
FIREBASE_API_KEY=your-firebase-key
DROPBOX_ACCESS_TOKEN=your-dropbox-token
```

#### 3. Deploy with Docker Compose
```bash
# Build and start all services (app + databases)
docker compose up -d --build

# View logs
docker compose logs -f

# Check service status
docker compose ps
```

#### 4. Verify Deployment
```bash
# Check application health
curl http://localhost:3000/api/v1/verify

# Test home page
curl http://localhost:3000

# Check database connections in logs
docker compose logs app | grep -E "(PostgreSQL|MongoDB|Neo4j)"
```

### 🗃️ Local Services Included

| Service | Port | Description |
|---------|------|-------------|
| **Application** | 3000 | Node.js backend |
| **PostgreSQL** | 5432 | Local Postgres database |
| **MongoDB** | 27017 | Local MongoDB database |

### 📊 Management Commands

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# Rebuild application
docker compose up -d --build app

# View logs
docker compose logs -f [service-name]

# Execute commands in container
docker compose exec app npm run [command]

# Reset databases (removes data)
docker compose down -v
docker compose up -d --build
```

---

## 🌐 Production Deployment

This setup uses cloud-hosted databases and is optimized for production environments.

### 📁 Files Used
- `docker-compose.prod.yml` - Production compose file (app only)
- `Dockerfile.prod` - Optimized production Dockerfile
- `.env` - Production environment variables
- `deploy-production.sh` - Automated deployment script
- `validate-production.sh` - Pre-deployment validation

### 🔧 Setup Steps

#### 1. Prepare Cloud Databases

**PostgreSQL (AWS RDS Example)**
```sql
-- Connect to your cloud PostgreSQL instance
CREATE DATABASE mvp_backend;
CREATE USER mvp_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE mvp_backend TO mvp_user;
```

**MongoDB Atlas Setup**
1. Create cluster on [MongoDB Atlas](https://cloud.mongodb.com)
2. Create database user with read/write permissions
3. Whitelist your server IP address
4. Get connection string

**Neo4j Aura (Optional)**
1. Create database on [Neo4j Aura](https://neo4j.com/cloud/aura/)
2. Note connection URI, username, and password

#### 2. Configure Production Environment
```bash
# Create production environment file
cp env.production.template .env

# Edit with your actual cloud database credentials
nano .env
```

Production `.env` example:
```env
# Production Configuration
NODE_ENV=production
PORT=3000

# Cloud Database Connections
POSTGRES_DATABASE_LINK=postgresql://username:password@your-rds-host.amazonaws.com:5432/mvp_backend
MONGO_DATABASE_LINK=mongodb+srv://username:password@your-cluster.mongodb.net/mvp_backend?retryWrites=true&w=majority

# Security
JWT_SECRET=your-super-secure-production-jwt-secret-32-characters-minimum

# Neo4j Cloud (Optional)
NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-neo4j-password

# AWS S3 (Optional)
S3_ACCESS_KEY=AKIA...
S3_SECRET_KEY=your-secret-key
S3_REGION=us-east-1
S3_BUCKET=your-bucket-name

# Firebase (Optional)
FIREBASE_API_KEY=AIza...
FIREBASE_PROJECT_ID=your-project-id
```

#### 3. Validate Configuration
```bash
# Run validation script
./validate-production.sh
```

#### 4. Deploy to Production
```bash
# Automated deployment
./deploy-production.sh
```

Or manually:
```bash
# Build and start production container
docker compose -f docker-compose.prod.yml up -d --build

# Check status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

#### 5. Verify Production Deployment
```bash
# Health check
curl http://localhost:3000/api/v1/verify

# Check application logs
docker compose -f docker-compose.prod.yml logs app

# Monitor container stats
docker stats
```

### 🌐 Production Services

| Service | Port | Description |
|---------|------|-------------|
| **Application** | 3000 | Dockerized Node.js app |
| **PostgreSQL** | - | Cloud-hosted (AWS RDS, etc.) |
| **MongoDB** | - | Cloud-hosted (Atlas, etc.) |
| **Neo4j** | - | Cloud-hosted (Aura, etc.) |

### 🛡️ Production Security Features

- **Multi-stage Docker build** for smaller image size
- **Non-root user execution** for security
- **Resource limits** (CPU: 1 core, Memory: 1GB)
- **Health checks** with proper timeouts
- **Security options** (no-new-privileges)
- **Structured logging** with size limits

---

## 🔄 Switching Between Environments

### Development to Production
```bash
# Stop development environment
docker compose down

# Start production environment
docker compose -f docker-compose.prod.yml up -d --build
```

### Production to Development
```bash
# Stop production environment
docker compose -f docker-compose.prod.yml down

# Start development environment
docker compose up -d --build
```

---

## 📊 Monitoring & Management

### Common Commands

```bash
# Check container status
docker compose ps                          # Development
docker compose -f docker-compose.prod.yml ps  # Production

# View logs
docker compose logs -f app                 # Development
docker compose -f docker-compose.prod.yml logs -f app  # Production

# Execute commands
docker compose exec app bash               # Development
docker compose -f docker-compose.prod.yml exec app bash  # Production

# Update application
docker compose up -d --build app           # Development
docker compose -f docker-compose.prod.yml up -d --build app  # Production
```

### Health Check Endpoints

| Endpoint | Description |
|----------|-------------|
| `http://localhost:3000` | Home page |
| `http://localhost:3000/api/v1/verify` | Health check |
| `http://localhost:3000/api/v1/uploadFilePostgres` | PostgreSQL test |
| `http://localhost:3000/api/v1/uploadFileMongo` | MongoDB test |
| `http://localhost:3000/api/v1/uploadFileNeo4j` | Neo4j test |

---

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check environment variables
docker compose exec app env | grep DATABASE

# Test database connectivity from container
docker compose exec app node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.POSTGRES_DATABASE_LINK });
pool.query('SELECT NOW()').then(() => console.log('PostgreSQL OK')).catch(console.error);
"
```

#### 2. Container Won't Start
```bash
# Check detailed logs
docker compose logs app

# Check if ports are available
netstat -tlnp | grep :3000

# Rebuild from scratch
docker compose down
docker system prune -f
docker compose up -d --build
```

#### 3. Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
chmod +x deploy-production.sh validate-production.sh

# Check Docker permissions
sudo usermod -aG docker $USER
newgrp docker
```

#### 4. Database Authentication Errors

**PostgreSQL:**
```bash
# Verify connection string format
postgresql://username:password@host:port/database

# Test connection
docker compose exec app npx prisma db push
```

**MongoDB:**
```bash
# Verify MongoDB connection string
mongodb://user:pass@host:port/db?authSource=db
# OR for Atlas:
mongodb+srv://user:pass@cluster.mongodb.net/db?retryWrites=true&w=majority

# Test MongoDB connection
docker compose exec app node -e "
const { MongoClient } = require('mongodb');
new MongoClient(process.env.MONGO_DATABASE_LINK).connect()
  .then(() => console.log('MongoDB OK'))
  .catch(console.error);
"
```

### Performance Optimization

```bash
# Monitor resource usage
docker stats

# Optimize Docker daemon
# Add to /etc/docker/daemon.json:
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

---

## 🔐 Security Best Practices

### Environment Variables
- Never commit `.env` files to version control
- Use strong passwords (20+ characters)
- Rotate secrets regularly
- Use different secrets for different environments

### Database Security
- Enable SSL/TLS for all database connections
- Restrict database access by IP address
- Use database-specific users with minimal permissions
- Enable database audit logging

### Container Security
- Regular security updates for base images
- Use official Docker images when possible
- Implement container scanning in CI/CD
- Monitor container vulnerabilities

---

## 📈 Scaling Considerations

### Horizontal Scaling
```bash
# Scale application containers
docker compose up -d --scale app=3

# Use load balancer (nginx, traefik)
# Configure session management for stateless scaling
```

### Production Infrastructure
- Use container orchestration (Kubernetes, Docker Swarm)
- Implement proper CI/CD pipelines
- Set up monitoring (Prometheus, Grafana)
- Configure centralized logging (ELK stack)

---

## 📞 Support & Resources

### Documentation
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

### Helpful Commands
```bash
# Clean up Docker system
docker system prune -f

# Remove all containers and images
docker compose down -v --rmi all

# Export/Import database data
docker compose exec postgres pg_dump -U myuser mydatabase > backup.sql
docker compose exec -T postgres psql -U myuser mydatabase < backup.sql
```

### Getting Help
1. Check application logs: `docker compose logs app`
2. Verify environment configuration
3. Test database connectivity
4. Review this documentation
5. Check the main README.md for additional guidance

---

## 🎯 Deployment Checklist

### Development Deployment
- [ ] Docker and Docker Compose installed
- [ ] Repository cloned
- [ ] `.env` file configured for local development
- [ ] `docker compose up -d --build` executed successfully
- [ ] Application accessible at http://localhost:3000
- [ ] Database connections verified in logs
- [ ] API endpoints tested

### Production Deployment
- [ ] Cloud databases set up and accessible
- [ ] Production `.env` file configured with cloud credentials
- [ ] JWT secret generated (32+ characters minimum)
- [ ] Database users created with proper permissions
- [ ] IP addresses whitelisted for database access
- [ ] SSL/TLS enabled for database connections
- [ ] `./validate-production.sh` passes all checks
- [ ] `./deploy-production.sh` executed successfully
- [ ] Application health check returns 200 OK
- [ ] All API endpoints functional with cloud databases
- [ ] Monitoring and logging configured
- [ ] Backup strategy implemented
- [ ] Security review completed

---

**🚀 You're ready to deploy! Choose your deployment method and follow the corresponding section above.**
