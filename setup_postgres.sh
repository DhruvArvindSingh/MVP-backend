#!/usr/bin/env bash
# Install PostgreSQL, create role and database for:
# postgresql://myuser:mypassword@localhost:5432/mydatabase
# Works on Ubuntu/Debian (apt). Requires sudo privileges.

set -euo pipefail

# ========= CONFIGURE THESE VALUES =========
DB_USER="myuser"
DB_PASS="mypassword"
DB_NAME="mydatabase"
DB_HOST="localhost"
DB_PORT="5432"

# If you're using Prisma migrate with a shadow database in development,
# you may want to allow the app role to create databases:
GRANT_CREATEDB=true   # set to false for production
# =========================================

echo "[INFO] Starting PostgreSQL setup for:"
echo "       postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

detect_apt() {
  if ! command -v apt-get >/dev/null 2>&1; then
    echo "[ERROR] This script supports apt-based systems (Ubuntu/Debian)."
    exit 1
  fi
}

install_postgres() {
  echo "[INFO] Installing PostgreSQL server and client (if missing)..."
  sudo apt-get update -y
  sudo apt-get install -y postgresql postgresql-contrib postgresql-client
  psql --version || true
}

ensure_service_running() {
  echo "[INFO] Enabling and starting postgresql service..."
  sudo systemctl enable postgresql
  sudo systemctl start postgresql
  sleep 2
  sudo systemctl --no-pager --full status postgresql || true
}

configure_port_if_needed() {
  if [ "${DB_PORT}" != "5432" ]; then
    echo "[INFO] Configuring PostgreSQL to listen on port ${DB_PORT}..."
    DATA_DIR=$(sudo -u postgres psql -tAc "SHOW data_directory;" | xargs)
    CONF_FILE="${DATA_DIR}/postgresql.conf"
    if [ -f "$CONF_FILE" ]; then
      sudo sed -i "s/^[#[:space:]]*port[[:space:]]*=.*/port = ${DB_PORT}/" "$CONF_FILE"
      sudo systemctl restart postgresql
      sleep 2
    else
      echo "[WARN] Could not locate postgresql.conf at ${CONF_FILE}; skipping port change."
    fi
  fi
}

ensure_role() {
  echo "[INFO] Ensuring role '${DB_USER}' exists with LOGIN..."
  sudo -u postgres psql -p "$DB_PORT" -v ON_ERROR_STOP=1 <<SQL
DO
\$do\$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASS}';
  ELSE
    -- Ensure LOGIN and update password to desired value
    ALTER ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASS}';
  END IF;
END
\$do\$;
SQL

  if [ "${GRANT_CREATEDB}" = "true" ]; then
    echo "[INFO] Granting CREATEDB to ${DB_USER} (dev convenience)..."
    sudo -u postgres psql -p "$DB_PORT" -c "ALTER ROLE ${DB_USER} CREATEDB;"
  fi
}

ensure_database() {
  echo "[INFO] Ensuring database '${DB_NAME}' exists and is owned by '${DB_USER}'..."

  # 1) Check existence WITHOUT wrapping CREATE DATABASE in a transaction
  DB_EXISTS=$(sudo -u postgres psql -p "$DB_PORT" -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" || true)
  if [ "$DB_EXISTS" != "1" ]; then
    echo "[INFO] Creating database ${DB_NAME} owned by ${DB_USER}..."
    sudo -u postgres createdb -p "$DB_PORT" -O "${DB_USER}" "${DB_NAME}"
  else
    echo "[INFO] Database ${DB_NAME} already exists. Ensuring ownership..."
    sudo -u postgres psql -p "$DB_PORT" -c "ALTER DATABASE ${DB_NAME} OWNER TO ${DB_USER};" >/dev/null
  fi

  # 2) Ensure public schema ownership and default privileges for the owner
  sudo -u postgres psql -p "$DB_PORT" -d "$DB_NAME" -v ON_ERROR_STOP=1 <<SQL
-- Ensure 'public' schema owned by the app user
ALTER SCHEMA public OWNER TO ${DB_USER};

-- Ensure the owner has all rights on future objects they create
ALTER DEFAULT PRIVILEGES FOR USER ${DB_USER} IN SCHEMA public
GRANT ALL ON TABLES TO ${DB_USER};
ALTER DEFAULT PRIVILEGES FOR USER ${DB_USER} IN SCHEMA public
GRANT ALL ON SEQUENCES TO ${DB_USER};
SQL
}

test_connection() {
  echo "[INFO] Testing connection as ${DB_USER}..."
  PGPASSWORD="${DB_PASS}" psql "postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}" -c "\conninfo"
}

print_env_hint() {
  echo
  echo "[DONE] PostgreSQL is ready."
  echo "Use this connection string:"
  echo "postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
  echo
  echo "For Prisma (.env):"
  echo "POSTGRES_URL=postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
  if [ "${GRANT_CREATEDB}" != "true" ]; then
    echo
    echo "[NOTE] If you use Prisma migrations that need a shadow DB, either:"
    echo "- Set GRANT_CREATEDB=true in this script for dev, or"
    echo "- Configure shadowDatabaseUrl with a role that has CREATEDB in prisma/postgres.prisma."
  fi
}

main() {
  detect_apt
  install_postgres
  ensure_service_running
  configure_port_if_needed
  ensure_role
  ensure_database
  test_connection
  print_env_hint
}

main "$@"
