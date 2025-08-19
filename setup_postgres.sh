#!/bin/bash
# Script to create PostgreSQL user and database, then test connection

sudo systemctl start postgresql
sudo systemctl enable postgresql   # start on boot
sudo systemctl status postgresql   # check status

set -e

DB_USER="myuser"
DB_PASS="mypassword"
DB_NAME="mydatabase"
DB_PORT="5432"   # change to 5435 if your cluster runs on that port

echo "🔄 Creating PostgreSQL user and database..."

# Run SQL commands as the postgres superuser
sudo -u postgres psql -p $DB_PORT -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" || true
sudo -u postgres psql -p $DB_PORT -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" || true
sudo -u postgres psql -p $DB_PORT -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" || true

echo "✅ User and database setup complete."

# Test connection
echo "🔎 Testing connection..."
PGPASSWORD=$DB_PASS psql "postgresql://$DB_USER:$DB_PASS@localhost:$DB_PORT/$DB_NAME" -c "\conninfo"

echo "🎉 PostgreSQL setup successful!"