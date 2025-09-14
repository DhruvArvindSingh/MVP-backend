#!/usr/bin/env bash
# Ubuntu-only: Install and start MongoDB, enable auth, create users, verify URI.
# Requires: sudo privileges and internet access.
# Tested on Ubuntu 20.04/22.04/24.04 families.

set -euo pipefail

# ========= CONFIGURE THESE VALUES =========
MONGO_VERSION="7.0"            # MongoDB series: e.g., 7.0 or 6.0
DB_NAME="database_name"
DB_USER="username"
DB_PASS="password"
ADMIN_USER="admin"
ADMIN_PASS="StrongAdminP@ssw0rd"
BIND_IP="127.0.0.1"            # Keep localhost-only for security
PORT="27017"
# =========================================

if [ ! -f /etc/os-release ]; then
  echo "[ERROR] This script requires Ubuntu (os-release missing)."
  exit 1
fi

. /etc/os-release
if [ "${ID}" != "ubuntu" ]; then
  echo "[ERROR] Detected ${PRETTY_NAME:-$ID}. This script is for Ubuntu only."
  exit 1
fi

echo "[INFO] Ubuntu detected: ${PRETTY_NAME}"

install_mongodb_ubuntu() {
  echo "[INFO] Installing MongoDB ${MONGO_VERSION} on Ubuntu..."

  sudo apt-get update -y
  sudo apt-get install -y curl gnupg lsb-release

  # Import MongoDB public key for the chosen series
  KEYRING="/usr/share/keyrings/mongodb-server-${MONGO_VERSION}.gpg"
  curl -fsSL "https://pgp.mongodb.com/server-${MONGO_VERSION}.asc" \
    | sudo gpg --dearmor -o "$KEYRING"

  CODENAME="${VERSION_CODENAME:-}"
  if [ -z "$CODENAME" ]; then
    echo "[ERROR] Could not determine Ubuntu codename."
    exit 1
  fi

  ARCH="$(dpkg --print-architecture)"
  REPO_LINE="deb [ signed-by=${KEYRING} arch=${ARCH} ] https://repo.mongodb.org/apt/ubuntu ${CODENAME}/mongodb-org/${MONGO_VERSION} multiverse"
  echo "$REPO_LINE" | sudo tee "/etc/apt/sources.list.d/mongodb-org-${MONGO_VERSION}.list" >/dev/null

  sudo apt-get update -y
  sudo apt-get install -y mongodb-org

  # Pin to this series to avoid unintended major upgrades
  sudo tee /etc/apt/preferences.d/mongodb-org >/dev/null <<EOF
Package: mongodb-org*
Pin: version ${MONGO_VERSION}.*
Pin-Priority: 1001
EOF
}

configure_mongod() {
  echo "[INFO] Configuring mongod bindIp=${BIND_IP}, port=${PORT}, auth=enabled..."
  CONF="/etc/mongod.conf"
  if [ ! -f "$CONF" ]; then
    echo "[ERROR] mongod.conf not found at $CONF"
    exit 1
  fi

  # Prefer yq if available for robust YAML edits
  if command -v yq >/dev/null 2>&1; then
    sudo yq -i ".net.bindIp = \"${BIND_IP}\" | .net.port = ${PORT} | .security.authorization = \"enabled\"" "$CONF"
  else
    # Minimal invasive edits with sed/append
    sudo sed -i -e "s/^\(\s*bindIp:\).*/\1 ${BIND_IP}/" -e "s/^\(\s*port:\).*/\1 ${PORT}/" "$CONF" || true

    # Ensure net section has bindIp/port
    if ! grep -qE '^\s*bindIp:' "$CONF"; then
      sudo sed -i "/^net:/a\  bindIp: ${BIND_IP}" "$CONF"
    fi
    if ! grep -qE '^\s*port:' "$CONF"; then
      sudo sed -i "/^net:/a\  port: ${PORT}" "$CONF"
    fi

    # Enable authorization
    if grep -qE '^security:' "$CONF"; then
      if grep -qE '^\s*authorization:' "$CONF"; then
        sudo sed -i "s/^\s*authorization:.*/  authorization: enabled/" "$CONF"
      else
        sudo sed -i "/^security:/a\  authorization: enabled" "$CONF"
      fi
    else
      sudo tee -a "$CONF" >/dev/null <<EOF

security:
  authorization: enabled
EOF
    fi
  fi
}

start_mongod() {
  echo "[INFO] Enabling and starting mongod..."
  sudo systemctl daemon-reload || true
  sudo systemctl enable mongod
  sudo systemctl start mongod
  sleep 3
  sudo systemctl --no-pager --full status mongod || true
}

create_users() {
  echo "[INFO] Creating admin and application users if missing..."

  export ADMIN_USER ADMIN_PASS DB_NAME DB_USER DB_PASS

  # Check if admin user exists (localhost exception allows first-user creation)
  ADMIN_MISSING=$(mongosh --quiet --eval 'db.getSiblingDB("admin").system.users.findOne({user: "'"$ADMIN_USER"'"}) ? 0 : 1' || echo 1)
  if [ "$ADMIN_MISSING" -ne 0 ]; then
    echo "[INFO] Creating admin user..."
    mongosh --quiet <<'EOF'
const adminUser = process.env.ADMIN_USER;
const adminPass = process.env.ADMIN_PASS;

const adminDb = db.getSiblingDB("admin");
adminDb.createUser({
  user: adminUser,
  pwd: adminPass,
  roles: [{ role: "root", db: "admin" }]
});
EOF
  else
    echo "[INFO] Admin user already exists. Skipping."
  fi

  echo "[INFO] Creating app user if missing..."
  APP_MISSING=$(mongosh --quiet --username "$ADMIN_USER" --password "$ADMIN_PASS" --authenticationDatabase admin --eval 'db.getSiblingDB("'"$DB_NAME"'").system.users.findOne({user: "'"$DB_USER"'"}) ? 0 : 1' || echo 1)
  if [ "$APP_MISSING" -ne 0 ]; then
    mongosh --quiet --username "$ADMIN_USER" --password "$ADMIN_PASS" --authenticationDatabase admin <<'EOF'
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;

const appDb = db.getSiblingDB(dbName);
appDb.createUser({
  user: dbUser,
  pwd: dbPass,
  roles: [{ role: "readWrite", db: dbName }]
});
EOF
  else
    echo "[INFO] App user already exists. Skipping."
  fi
}

verify_connection() {
  echo "[INFO] Verifying connection string..."
  URI="mongodb://${DB_USER}:${DB_PASS}@localhost:${PORT}/${DB_NAME}?authSource=admin"
  echo "[INFO] Testing: $URI"
  mongosh "$URI" --eval 'db.runCommand({ ping: 1 })' || {
    echo "[ERROR] Connection test failed."
    exit 1
  }
  echo "[INFO] Ping successful. MongoDB is ready."
}

main() {
  if ! command -v mongod >/dev/null 2>&1; then
    install_mongodb_ubuntu
  else
    echo "[INFO] mongod already installed. Skipping installation."
  fi

  configure_mongod
  start_mongod
  create_users
  verify_connection

  echo
  echo "[DONE] You can connect using:"
  echo "mongodb://${DB_USER}:${DB_PASS}@localhost:${PORT}/${DB_NAME}?authSource=admin"
}

main "$@"