#!/data/data/com.termux/files/usr/bin/bash
DB_DIR="$HOME/mongodb-data"
mkdir -p "$DB_DIR"

if ! pgrep -x mongod >/dev/null; then
  echo "Starting MongoDB..."
  OUT=$(mongod --dbpath "$DB_DIR" --bind_ip 127.0.0.1 --fork --logpath "$HOME/mongodb.log" 2>&1)
  sleep 3
  if ! pgrep -x mongod >/dev/null; then
    echo "MongoDB failed to start:"
    echo "$OUT" | tail -5
    exit 1
  fi
fi

echo "MongoDB is running."
cd "$HOME/kasuwa/server" && npm run dev
