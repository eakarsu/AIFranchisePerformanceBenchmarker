#!/bin/bash

# AI Franchise Performance Benchmarker - Start Script
# Cleans ports, creates DB, seeds data, starts backend + frontend with hot reload

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${PURPLE}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║   AI Franchise Performance Benchmarker              ║${NC}"
echo -e "${PURPLE}║   Starting Application...                           ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

# Load env vars
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
  echo -e "${GREEN}✓ Environment variables loaded${NC}"
else
  echo -e "${RED}✗ .env file not found! Please create one.${NC}"
  exit 1
fi

BACKEND_PORT=${BACKEND_PORT:-3001}
FRONTEND_PORT=${FRONTEND_PORT:-3000}

# ─── Clean used ports ────────────────────────────────────────
echo -e "\n${YELLOW}Cleaning ports ${BACKEND_PORT} and ${FRONTEND_PORT}...${NC}"

kill_port() {
  local port=$1
  local pids=$(lsof -ti :$port 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo -e "  ${YELLOW}Killing processes on port $port: $pids${NC}"
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 1
  else
    echo -e "  ${GREEN}Port $port is free${NC}"
  fi
}

kill_port $BACKEND_PORT
kill_port $FRONTEND_PORT

# ─── Check PostgreSQL ─────────────────────────────────────────
echo -e "\n${CYAN}Checking PostgreSQL...${NC}"
if command -v pg_isready &> /dev/null; then
  if pg_isready -q 2>/dev/null; then
    echo -e "  ${GREEN}✓ PostgreSQL is running${NC}"
  else
    echo -e "  ${YELLOW}Starting PostgreSQL...${NC}"
    if command -v brew &> /dev/null; then
      brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
    fi
    sleep 2
    if pg_isready -q 2>/dev/null; then
      echo -e "  ${GREEN}✓ PostgreSQL started${NC}"
    else
      echo -e "  ${RED}✗ Could not start PostgreSQL. Please start it manually.${NC}"
      exit 1
    fi
  fi
else
  echo -e "  ${YELLOW}pg_isready not found, assuming PostgreSQL is running${NC}"
fi

# ─── Create database if not exists ────────────────────────────
echo -e "\n${CYAN}Setting up database...${NC}"
DB_NAME=${DB_NAME:-franchise_benchmarker}
DB_USER=${DB_USER:-postgres}

if psql -U "$DB_USER" -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
  echo -e "  ${GREEN}✓ Database '${DB_NAME}' exists${NC}"
else
  echo -e "  ${YELLOW}Creating database '${DB_NAME}'...${NC}"
  createdb -U "$DB_USER" "$DB_NAME" 2>/dev/null || psql -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || true
  echo -e "  ${GREEN}✓ Database created${NC}"
fi

# ─── Install dependencies ─────────────────────────────────────
echo -e "\n${CYAN}Installing dependencies...${NC}"

echo -e "  ${BLUE}Installing server dependencies...${NC}"
cd "$PROJECT_DIR/server"
npm install --silent 2>&1 | tail -1
echo -e "  ${GREEN}✓ Server dependencies installed${NC}"

echo -e "  ${BLUE}Installing client dependencies...${NC}"
cd "$PROJECT_DIR/client"
npm install --silent 2>&1 | tail -1
echo -e "  ${GREEN}✓ Client dependencies installed${NC}"

cd "$PROJECT_DIR"

# ─── Seed database ────────────────────────────────────────────
echo -e "\n${CYAN}Seeding database with sample data...${NC}"
cd "$PROJECT_DIR/server"
node seed.js
echo -e "  ${GREEN}✓ Database seeded successfully${NC}"

cd "$PROJECT_DIR"

# ─── Start backend with hot reload (nodemon) ─────────────────
echo -e "\n${BLUE}Starting backend server on port ${BACKEND_PORT} (with hot reload)...${NC}"
cd "$PROJECT_DIR/server"
npx nodemon --watch . --ext js,json index.js &
BACKEND_PID=$!
echo -e "  ${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"

cd "$PROJECT_DIR"

# Wait for backend to be ready
echo -e "  ${YELLOW}Waiting for backend...${NC}"
for i in {1..30}; do
  if curl -s http://localhost:$BACKEND_PORT/api/dashboard/stats > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓ Backend is ready${NC}"
    break
  fi
  if [ $i -eq 30 ]; then
    echo -e "  ${YELLOW}Backend may still be starting...${NC}"
  fi
  sleep 1
done

# ─── Start frontend with hot reload (Vite) ───────────────────
echo -e "\n${BLUE}Starting frontend on port ${FRONTEND_PORT} (with hot reload)...${NC}"
cd "$PROJECT_DIR/client"
npx vite --port $FRONTEND_PORT &
FRONTEND_PID=$!
echo -e "  ${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"

cd "$PROJECT_DIR"

# ─── Cleanup on exit ─────────────────────────────────────────
cleanup() {
  echo -e "\n${YELLOW}Shutting down...${NC}"
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  kill_port $BACKEND_PORT
  kill_port $FRONTEND_PORT
  echo -e "${GREEN}✓ Shutdown complete${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM

echo ""
echo -e "${PURPLE}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║   Application is running!                           ║${NC}"
echo -e "${PURPLE}║                                                     ║${NC}"
echo -e "${PURPLE}║   Frontend:  ${GREEN}http://localhost:${FRONTEND_PORT}${PURPLE}                  ║${NC}"
echo -e "${PURPLE}║   Backend:   ${GREEN}http://localhost:${BACKEND_PORT}${PURPLE}                  ║${NC}"
echo -e "${PURPLE}║                                                     ║${NC}"
echo -e "${PURPLE}║   Login: admin@franchise.com / password123          ║${NC}"
echo -e "${PURPLE}║                                                     ║${NC}"
echo -e "${PURPLE}║   Press Ctrl+C to stop                              ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

# Keep running
wait
