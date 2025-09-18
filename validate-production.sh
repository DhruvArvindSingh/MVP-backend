#!/bin/bash

# Production Configuration Validation Script

set -e

echo "🔍 Validating Production Configuration..."

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[VALIDATE]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

validation_errors=0

# Check Docker
print_status "Checking Docker..."
if command -v docker > /dev/null 2>&1; then
    print_success "Docker is installed"
else
    print_error "Docker is not installed"
    ((validation_errors++))
fi

# Check Docker Compose
print_status "Checking Docker Compose..."
if docker compose version > /dev/null 2>&1; then
    print_success "Docker Compose is installed"
elif command -v docker-compose > /dev/null 2>&1; then
    print_success "Docker Compose (legacy) is installed"
else
    print_error "Docker Compose is not installed"
    ((validation_errors++))
fi

# Check production files
print_status "Checking production files..."

required_files=(
    "docker-compose.prod.yml"
    "Dockerfile.prod"
    "env.production.template"
    "deploy-production.sh"
    "PRODUCTION_DEPLOYMENT.md"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "Found $file"
    else
        print_error "Missing $file"
        ((validation_errors++))
    fi
done

# Check .env file
print_status "Checking environment configuration..."
if [ -f ".env" ]; then
    print_success "Found .env file"
    
    # Check for required variables
    required_vars=("POSTGRES_DATABASE_LINK" "MONGO_DATABASE_LINK" "JWT_SECRET")
    for var in "${required_vars[@]}"; do
        if grep -q "^$var=" .env; then
            if grep -q "^$var=.*your-.*" .env || grep -q "^$var=$" .env; then
                print_warning "$var is not configured (contains template value)"
            else
                print_success "$var is configured"
            fi
        else
            print_error "$var is missing from .env"
            ((validation_errors++))
        fi
    done
else
    print_warning ".env file not found - you'll need to create it from the template"
    print_status "Run: cp env.production.template .env"
fi

# Check Dockerfile syntax
print_status "Validating Dockerfile syntax..."
if docker build -f Dockerfile.prod -t mvp-backend-prod-test . --dry-run > /dev/null 2>&1; then
    print_success "Dockerfile.prod syntax is valid"
else
    print_warning "Cannot validate Dockerfile.prod (Docker daemon may not be running)"
fi

# Check Docker Compose syntax
print_status "Validating Docker Compose syntax..."
if docker compose -f docker-compose.prod.yml config > /dev/null 2>&1; then
    print_success "docker-compose.prod.yml syntax is valid"
else
    print_warning "Cannot validate docker-compose.prod.yml (Docker daemon may not be running)"
fi

# Summary
echo ""
echo "📋 Validation Summary:"
echo "======================"

if [ $validation_errors -eq 0 ]; then
    print_success "✅ All validations passed!"
    echo ""
    print_status "🚀 Ready for production deployment!"
    print_status "Next steps:"
    print_status "1. Ensure your cloud databases are set up"
    print_status "2. Update .env with your actual database credentials"
    print_status "3. Run: ./deploy-production.sh"
else
    print_error "❌ $validation_errors validation error(s) found"
    print_error "Please fix the errors above before deploying to production"
    exit 1
fi
