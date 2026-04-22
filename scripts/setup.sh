#!/bin/bash

set -e

echo "Setting up MiniTask..."

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "Docker not found. Please install Docker first: https://get.docker.com"
    exit 1
fi

# Check Docker Compose
if ! docker compose version &> /dev/null && ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose not found. Please install Docker Compose first."
    exit 1
fi

# Copy environment file
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "Edit .env with your configuration before proceeding."
    echo "  nano .env"
    echo ""
fi

# Start services
echo "Starting Docker services..."
docker compose up -d

# Wait for database
echo "Waiting for database to be ready..."
until docker compose exec -T db pg_isready -U postgres &> /dev/null; do
    sleep 1
done

# Run migrations
echo "Running database migrations..."
docker compose exec app npx prisma migrate deploy

# Seed database
echo "Seeding database (superadmin account)..."
docker compose exec app npx prisma db seed

echo ""
echo "Setup complete!"
echo ""
echo "  Open:  http://localhost:3000"
echo "  Login: see SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD in .env"
echo ""
echo "Commands:"
echo "  make dev      - Start development environment"
echo "  make test     - Run tests"
echo "  make help     - Show all available commands"
