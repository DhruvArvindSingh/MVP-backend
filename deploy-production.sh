#!/bin/bash

# Production Deployment Script for MVP Backend
# This script deploys the application using cloud databases

set -e  # Exit on any error

echo "🚀 Starting Production Deployment..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_error ".env file not found!"
    print_warning "Please create a .env file using the template:"
    print_warning "cp env.production.template .env"
    print_warning "Then update the .env file with your cloud database credentials."
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker compose is available
if ! docker compose version > /dev/null 2>&1; then
    print_error "docker compose is not available. Please install Docker Compose v2 and try again."
    exit 1
fi

print_status "Validating environment variables..."

# Check for required environment variables
required_vars=("POSTGRES_DATABASE_LINK" "MONGO_DATABASE_LINK" "JWT_SECRET")
missing_vars=()

for var in "${required_vars[@]}"; do
    if ! grep -q "^$var=" .env || grep -q "^$var=.*your-.*" .env; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    print_error "Missing or template values found for required environment variables:"
    for var in "${missing_vars[@]}"; do
        print_error "  - $var"
    done
    print_warning "Please update your .env file with actual values."
    exit 1
fi

print_success "Environment validation passed!"

# Stop any existing containers
print_status "Stopping existing containers..."
docker compose -f docker-compose.prod.yml down 2>/dev/null || true

# Build and start the production container
print_status "Building production image..."
docker compose -f docker-compose.prod.yml build --no-cache

print_status "Starting production container..."
docker compose -f docker-compose.prod.yml up -d

# Wait for the application to start
print_status "Waiting for application to start..."
sleep 10

# Check if the container is running
if docker compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    print_success "✅ Production deployment successful!"
    print_success "🌐 Application is running at: http://localhost:3000"
    print_success "📋 Available endpoints:"
    print_success "   - Health Check: http://localhost:3000/api/v1/verify"
    print_success "   - Home Page: http://localhost:3000"
    print_success "   - API Documentation: Check API_ENDPOINTS.md"
    
    echo ""
    print_status "📊 Container Status:"
    docker compose -f docker-compose.prod.yml ps
    
    echo ""
    print_status "📋 To view logs:"
    print_status "   docker compose -f docker-compose.prod.yml logs -f"
    
    echo ""
    print_status "🛑 To stop the application:"
    print_status "   docker compose -f docker-compose.prod.yml down"
    
else
    print_error "❌ Deployment failed!"
    print_error "📋 Check logs for details:"
    docker compose -f docker-compose.prod.yml logs
    exit 1
fi
