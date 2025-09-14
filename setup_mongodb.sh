#!/usr/bin/env bash
# Ubuntu & Debian 12 (bookworm): Install and start MongoDB, enable auth,
# create users, and verify the URI.
# Requires: sudo privileges and internet access.

set -euo pipefail

# ========= CONFIGURE THESE VALUES =========
MONGO_VERSION="7.0"            # MongoDB series: 7.0 or 6.0
DB_NAME="database_name"
DB_USER="username"
DB_PASS="password"
ADMIN_USER="admin"
ADMIN_PASS="StrongAdminP@ssw0rd"
BIND_IP="127.0.0.1"            # Keep localhost-only for security
PORT="27017"
# =========================================

if [ ! -f /etc/os-release ]; then
  echo "[ERROR] This script requires Ubuntu or Debian (os-release missing)."
  exit 1
fi

. /etc/os-release
ID="${ID:-}"
VERSION_CODENAME="${VERSION_CODENAME:-}"
PRETTY="${PRETTY_NAME:-$ID}"

if [ "$ID" != "ubuntu" ] && [ "$ID" != "debian" ]; then
  echo "[ERROR] Detected ${PRETTY}. This script supports Ubuntu or Debian 12 (bookworm) only."
  exit 1
fi

# On Debian, ensure we're on bookworm (12)
if [ "$ID" = "debian" ] && [ "$VERSION_CODENAME" != "bookworm" ]; then
  echo "[ERROR] Detected Debian '${VERSION_CODENAME}'. This script targets Debian 12 (bookworm)."
  echo "Please adjust the repo line for your Debian release."
  exit 1
fi

echo "[INFO] Detected OS: ${PRETTY}"

install_mongodb() {
  echo "[INFO] Installing MongoDB ${MONGO_VERSION} on ${PRETTY}..."

  if ! command -v apt-get >/dev/null 2>&1; then
    echo "[ERROR] apt-get not found. This script requires apt-based systems."
    exit 1
  fi

  sudo apt-get update -y
  sudo apt-get install -y curl gnupg lsb-release

  # Import MongoDB public key for the selected series
  KEYRING="/usr/share/keyrings/mongodb-server-${MONGO_VERSION}.gpg"
  curl -fsSL "https://pgp.mongodb.com/server-${MONGO_VERSION}.asc" \
    | sudo gpg --dearmor -o "$KEYRING"

  ARCH="$(dpkg --print-architecture)"

  # Build repo line depending on distro
  if [ "$ID" = "ubuntu" ]; then
    if [ -z "${VERSION_CODENAME:-}" ]; then
      echo "[ERROR] Could not determine Ubuntu codename."
      exit 1
    fi
    # Example codename: jammy, noble, focal (ensure series supports your codename)
    REPO_LINE="deb [ signed-by=${KEYRING} arch=${ARCH} ] https://repo.mongodb.org/apt/ubuntu ${VERSION_CODENAME}/mongodb-org/${MONGO_VERSION} multiverse"
    LIST_FILE="/etc/apt/sources.list.d/mongodb-org-${MONGO_VERSION}.list"
  else
    # Debian 12 (bookworm)
    REPO_LINE="deb [ signed-by=${KEYRING} arch=${ARCH} ] https://repo.mongodb.org/apt/debian bookworm/mongodb-org/${MONGO_VERSION} main"
    LIST_FILE="/etc/apt/sources.list.d/mongodb-org-${MONGO_VERSION}.list"
  fi

  echo "$REPO_LINE" | sudo tee "$LIST_FILE" >/dev/null

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
  echo "[INFO] Enabling and restarting mongod..."
  sudo systemctl daemon-reload || true
  sudo systemctl enable mongod
  # Use restart to ensure new config (auth) is applied reliably
  sudo systemctl restart mongod
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
  APP_URI="mongodb://${DB_USER}:${DB_PASS}@localhost:${PORT}/${DB_NAME}?authSource=admin"
  echo "[INFO] Testing app URI: ${APP_URI}"
  if ! mongosh "${APP_URI}" --eval 'db.runCommand({ ping: 1 })'; then
    echo "[WARN] App user ping failed. Trying admin to diagnose..."
    ADMIN_URI="mongodb://${ADMIN_USER}:${ADMIN_PASS}@localhost:${PORT}/admin?authSource=admin"
    if mongosh "${ADMIN_URI}" --eval 'db.runCommand({ ping: 1 })'; then
      echo "[INFO] Admin ping succeeded. App user may be incorrect."
      echo "[HINT] Check DB_USER/DB_PASS/DB_NAME, or recreate the app user."
      echo "       Username: ${DB_USER}"
      echo "       Database: ${DB_NAME}"
      echo "       authSource=admin"
      exit 1
    else
      echo "[ERROR] Admin ping failed too. Authentication or config issue."
      echo "[DEBUG] Tail of mongod logs:"
      sudo journalctl -u mongod -n 50 --no-pager || true
      exit 1
    fi
  fi
  echo "[INFO] Ping successful. MongoDB is ready."
}

main() {
  if ! command -v mongod >/dev/null 2>&1; then
    install_mongodb
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
