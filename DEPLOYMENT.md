# Deployment Guide

## VPS Deployment (Docker Compose + Caddy)

### Prerequisites

- VPS with Ubuntu 22.04+ (1 vCPU, 1 GB RAM minimum)
- Docker & Docker Compose installed
- Domain name pointing to server IP (required for HTTPS)
- SSH access

### Step 1: Prepare Server

```bash
ssh user@your-server

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose plugin
sudo apt-get install -y docker-compose-plugin
```

### Step 2: Clone and Configure

```bash
git clone https://github.com/your-org/minitask.git
cd minitask

cp .env.example .env.production
nano .env.production
```

**Required production values in `.env.production`:**

```bash
NODE_ENV=production
DATABASE_URL=postgresql://minitask:STRONG_PASSWORD@db:5432/minitask_prod
SESSION_SECRET=   # openssl rand -hex 32
POSTGRES_USER=minitask
POSTGRES_PASSWORD=STRONG_PASSWORD
POSTGRES_DB=minitask_prod
SEED_ADMIN_EMAIL=admin@your-domain.com
SEED_ADMIN_PASSWORD=STRONG_ADMIN_PASSWORD
DOMAIN=your-domain.com
```

Generate secure secrets:

```bash
openssl rand -hex 32   # for SESSION_SECRET
openssl rand -base64 20  # for passwords
```

### Step 3: Configure Domain (Caddy)

Edit `Caddyfile` to set your domain:

```
your-domain.com {
  reverse_proxy app:3000
}
```

Caddy handles HTTPS automatically via Let's Encrypt — no additional SSL configuration needed.

### Step 4: Deploy

```bash
# Load environment
export $(grep -v '^#' .env.production | xargs)

# Build and start all services
docker compose -f docker-compose.prod.yml up -d --build

# Run database migrations
make prod-migrate

# Seed superadmin account
docker compose -f docker-compose.prod.yml exec app npx prisma db seed

# Verify all services are healthy
docker compose -f docker-compose.prod.yml ps
```

### Step 5: Verify

```bash
# Check application health
curl https://your-domain.com/api/health

# Tail logs
make prod-logs
```

---

## Updating the Application

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
make prod-migrate
```

---

## Maintenance

```bash
# View logs
make prod-logs

# Restart all services
docker compose -f docker-compose.prod.yml restart

# Stop everything
make prod-down

# Backup database
docker compose -f docker-compose.prod.yml exec db \
  pg_dump -U minitask minitask_prod > backup-$(date +%Y%m%d).sql

# Restore database
cat backup-20240101.sql | docker compose -f docker-compose.prod.yml exec -T db \
  psql -U minitask minitask_prod
```

---

## CI/CD via GitHub Actions

The repository includes two workflows:

| Workflow     | Trigger                   | Purpose                              |
| ------------ | ------------------------- | ------------------------------------ |
| `ci.yml`     | Every push / PR to `main` | Lint, typecheck, tests, Docker build |
| `deploy.yml` | Push to `main`            | Build and push image to GHCR         |

### Using the Published Image

After `deploy.yml` runs, pull the image on your server instead of building locally:

```bash
# Login to GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Pull and run
docker pull ghcr.io/your-org/minitask:latest
```

Update `docker-compose.prod.yml` to use the published image:

```yaml
services:
  app:
    image: ghcr.io/your-org/minitask:latest
    # Remove the build: section
```

---

## Environment Variables Reference

| Variable              | Required           | Description                                |
| --------------------- | ------------------ | ------------------------------------------ |
| `DATABASE_URL`        | Yes                | PostgreSQL connection string               |
| `SESSION_SECRET`      | Yes                | iron-session encryption key (min 32 chars) |
| `POSTGRES_USER`       | Yes                | PostgreSQL username                        |
| `POSTGRES_PASSWORD`   | Yes                | PostgreSQL password                        |
| `POSTGRES_DB`         | Yes                | PostgreSQL database name                   |
| `SEED_ADMIN_EMAIL`    | Yes (first deploy) | Superadmin email                           |
| `SEED_ADMIN_PASSWORD` | Yes (first deploy) | Superadmin password                        |
| `DOMAIN`              | Yes (Caddy)        | Domain for HTTPS (e.g. `app.example.com`)  |
| `PORT`                | No                 | App port inside container (default: 3000)  |
| `NODE_ENV`            | No                 | Set to `production`                        |

---

## Monitoring

```bash
# Application health endpoint
GET /api/health  → 200 OK

# Docker health status
docker compose -f docker-compose.prod.yml ps
```

Recommended external monitoring:

- **Uptime**: [UptimeRobot](https://uptimerobot.com) — free tier, pings `/api/health`
- **Logs**: `docker compose logs -f` or forward to Papertrail
