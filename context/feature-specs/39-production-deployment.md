Read `AGENTS.md`, `context/architecture-context.md`, and `context/code-standards.md` before starting.

**Production deployment**: prepare and deploy the app to a self-hosted environment (company's
own server). This unit covers Docker production builds, environment config, reverse proxy (Nginx),
SSL, database migrations, and initial deploy.

## Scope of this unit

- Production Docker Compose (or Dockerfiles for orchestration).
- Nginx reverse proxy with SSL (Let's Encrypt or self-signed).
- Environment variable management (secrets, production URLs).
- Database migration strategy for production.
- Initial deploy and smoke tests.
- Do not implement CI/CD automation (defer to post-MVP) or multi-region (MVP is single-server).

## Prerequisite

Specs 04–38 done. All services and frontend are functional, tested, and hardened.

## Implementation

### Production Docker Compose

Create `docker-compose.prod.yml` at the repo root:

- **Services**: postgres (with pgvector), redis, all 12 NestJS microservices, Next.js frontend,
  nginx (reverse proxy).
- **Networks**: internal network for services; only nginx exposes ports (80, 443).
- **Volumes**: persist Postgres data, Redis data, file uploads, SSL certs.
- **Build**: use multi-stage Dockerfiles for each service (build + slim runtime image). Example:
  ```dockerfile
  FROM node:20-alpine AS builder
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci
  COPY . .
  RUN npm run build

  FROM node:20-alpine
  WORKDIR /app
  COPY --from=builder /app/dist ./dist
  COPY --from=builder /app/node_modules ./node_modules
  CMD ["node", "dist/main.js"]
  ```

- **Restart policies**: `restart: unless-stopped` for all services.

### Nginx reverse proxy

Add an `nginx` service to `docker-compose.prod.yml`:

- Mount `nginx.conf` with upstream blocks for the frontend and API gateway:
  ```nginx
  upstream frontend {
    server nextjs:3000;
  }
  upstream api {
    server api-gateway:4000;
  }

  server {
    listen 80;
    server_name salesintel.company.com;
    return 301 https://$server_name$request_uri;
  }

  server {
    listen 443 ssl http2;
    server_name salesintel.company.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    location / {
      proxy_pass http://frontend;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
      proxy_pass http://api;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }
  }
  ```

- **SSL**: use Let's Encrypt (certbot) or a company-provided cert. Mount the cert/key into the
  nginx container. For Let's Encrypt, use a certbot container or run certbot on the host and
  mount the certs.

### Environment variables

Create a production `.env.prod` (never commit; store securely):

- `NODE_ENV=production`
- `DATABASE_URL=postgresql://user:password@postgres:5432/salesintel_prod?sslmode=require`
- `REDIS_URL=redis://redis:6379`
- `JWT_SECRET=<256-bit secret>`
- `EMAIL_ENCRYPTION_KEY=<32-byte base64>`
- `OPENAI_API_KEY=<key>`
- `OPENAI_BASE_URL=<custom proxy URL>`
- `NEXT_PUBLIC_AUTH_URL=https://salesintel.company.com/api/auth`
- `FRONTEND_URL=https://salesintel.company.com`

Load via `docker-compose --env-file .env.prod up`.

### Database migrations

Before first deploy:

- SSH into the server, navigate to the repo.
- Run migrations: `docker compose -f docker-compose.prod.yml run --rm api-gateway npx prisma migrate deploy`
  (or run from any service container that has Prisma).
- Verify: `docker compose -f docker-compose.prod.yml exec postgres psql -U user -d salesintel_prod -c '\dt'`
  (list tables).

For subsequent deploys, run migrations before restarting services (zero-downtime: apply migrations
first, then deploy new code if migrations are backward-compatible).

### Initial deploy

On the production server:

1. Clone the repo: `git clone <repo-url> /opt/salesintel && cd /opt/salesintel`.
2. Checkout the production branch/tag: `git checkout v1.0.0`.
3. Copy `.env.prod` to the repo root (securely transfer from a secrets manager or secure location).
4. Build images: `docker compose -f docker-compose.prod.yml build`.
5. Start services: `docker compose -f docker-compose.prod.yml up -d`.
6. Run migrations (if first deploy): see above.
7. Check logs: `docker compose -f docker-compose.prod.yml logs -f` (verify no errors).
8. Smoke test: visit `https://salesintel.company.com`, sign up, create a contact, send an email.

### Health checks

Add health check endpoints to each service (if not already; spec 07 has gateway health):

- `GET /health` returns `{ status: 'ok' }` and checks DB/Redis connectivity.
- Nginx can use these for upstream health checks (optional for MVP; single server doesn't need it).

### Backup strategy

Document and set up automated backups:

- **Postgres**: daily pg_dump via cron or a backup container. Store in a secure location (S3 or
  network drive). Retain 30 days.
- **File uploads**: daily rsync or tar the uploads volume.
- **Redis**: optional (cache can be rebuilt; if used for critical data, enable RDB snapshots).

Example cron (on host):
```sh
0 2 * * * docker compose -f /opt/salesintel/docker-compose.prod.yml exec -T postgres pg_dump -U user salesintel_prod | gzip > /backups/salesintel_$(date +\%Y\%m\%d).sql.gz
```

### Rollback plan

- Keep previous Docker images tagged (e.g. `v1.0.0`, `v1.0.1`).
- To rollback: `git checkout v1.0.0`, rebuild/redeploy, or pull the old image tag.
- Database rollback: restore from backup (test this process in staging first).

### Monitoring (basic)

- **Logs**: centralize via Docker logging driver (e.g. `json-file` with rotation, or forward to
  a log aggregator like Loki/Grafana).
- **Uptime**: use a simple uptime monitor (UptimeRobot, or self-hosted like Uptime Kuma) pinging
  `https://salesintel.company.com/health`.
- **Alerts**: email/SMS on downtime (via the uptime monitor).

Defer full observability (Prometheus, Grafana, tracing) to spec 40.

## Scope Limits

- No CI/CD (GitHub Actions, GitLab CI) — manual deploy for MVP; automate post-launch.
- No multi-region or multi-server (single server for MVP).
- No container orchestration (Kubernetes) — Docker Compose is sufficient for MVP.
- No blue-green or canary deployments — simple rolling restart.

## Check When Done

- `docker-compose.prod.yml` builds and starts all services (Postgres, Redis, 12 microservices,
  frontend, nginx).
- Nginx reverse proxy serves the frontend (HTTPS) and API (HTTPS).
- SSL cert is valid (Let's Encrypt or company cert).
- Migrations run successfully; database is seeded (if needed).
- Smoke test passes: signup, login, create contact, send email, AI chat.
- Backups are scheduled (Postgres + file uploads). Rollback plan is documented.
