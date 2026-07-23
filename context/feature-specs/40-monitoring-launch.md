Read `AGENTS.md`, `context/architecture-context.md`, and `context/code-standards.md` before starting.

**Monitoring and launch**: observability, alerting, and final launch checklist. This unit ensures
the app is production-ready with monitoring, graceful degradation, and a launch plan.

## Scope of this unit

- Set up application monitoring (metrics, logs, traces).
- Alerting for critical failures (service down, DB errors, job failures).
- Health dashboards (Grafana or similar).
- Final pre-launch checklist (security, performance, backups, docs).
- Launch plan and post-launch monitoring.
- Do not implement advanced APM (New Relic, Datadog) — use open-source for MVP.

## Prerequisite

Specs 04–39 done. The app is deployed to production (spec 39) and functional.

## Implementation

### Metrics (Prometheus)

Add Prometheus metrics to each service:

- Use `@willsoto/nestjs-prometheus` (NestJS) or `prom-client` (Node.js).
- Expose `/metrics` endpoint (Prometheus format) on each service.
- Metrics to track:
  - **Request counters**: total requests, by endpoint, by status code.
  - **Response times**: histogram of request duration.
  - **Database query times**: histogram of Prisma query duration.
  - **Background jobs**: job counts (pending, completed, failed), job duration.
  - **Custom metrics**: contacts created, emails sent, AI messages, etc.

Add a `prometheus` service to `docker-compose.prod.yml`:

- Scrape all services every 15s.
- Persist data in a volume.

Example `prometheus.yml`:
```yaml
scrape_configs:
  - job_name: 'services'
    static_configs:
      - targets:
          - 'api-gateway:4000'
          - 'auth-service:4001'
          - 'contact-service:4002'
          # ... all 12 services
          - 'nextjs:3000'
```

### Logs (Loki + Promtail, optional)

For centralized logging:

- Add `loki` and `promtail` services to `docker-compose.prod.yml`.
- Promtail scrapes Docker logs and forwards to Loki.
- Query logs via Grafana (see below).

For MVP, Docker logs (`docker compose logs -f`) are acceptable; Loki is optional.

### Dashboards (Grafana)

Add a `grafana` service to `docker-compose.prod.yml`:

- Datasource: Prometheus (and Loki if enabled).
- Create dashboards:
  - **Overview**: total requests, error rate, response time (p50, p95, p99).
  - **Services**: per-service request rate, error count.
  - **Background jobs**: job queue depth, job failure rate.
  - **Database**: query times, connection count.
  - **AI**: messages per hour, token usage, embedding queue depth.

Import pre-built dashboards (e.g. Node.js app dashboard from Grafana gallery) and customize.

### Alerting (Prometheus Alertmanager)

Add `alertmanager` service to `docker-compose.prod.yml`:

- Define alert rules in Prometheus (e.g. `alerts.yml`):
  ```yaml
  groups:
    - name: critical
      rules:
        - alert: ServiceDown
          expr: up{job="services"} == 0
          for: 2m
          annotations:
            summary: "Service {{ $labels.instance }} is down"

        - alert: HighErrorRate
          expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
          for: 5m
          annotations:
            summary: "High error rate on {{ $labels.instance }}"

        - alert: JobQueueBacklog
          expr: bull_queue_waiting > 1000
          for: 10m
          annotations:
            summary: "Job queue {{ $labels.queue }} has 1000+ waiting jobs"
  ```

- Configure Alertmanager to send alerts via email, Slack, or webhook.

### Tracing (Jaeger, optional)

For distributed tracing (track requests across microservices):

- Add OpenTelemetry instrumentation to NestJS services (`@opentelemetry/api`, `@opentelemetry/sdk-node`).
- Export traces to Jaeger (add `jaeger` service to Docker Compose).
- View traces in Jaeger UI.

For MVP, tracing is optional; metrics + logs are sufficient.

### Error tracking (Sentry, optional)

Integrate Sentry (or self-hosted alternative) for frontend and backend:

- Frontend: `@sentry/nextjs`. Capture unhandled errors, log to Sentry.
- Backend: `@sentry/node`. Capture exceptions in global exception filters.

For MVP, logs + Prometheus alerts are acceptable; Sentry is a nice-to-have.

### Health checks (comprehensive)

Enhance the `/health` endpoint (spec 07) to check:

- DB connectivity (Prisma `$queryRaw('SELECT 1')`).
- Redis connectivity (`redis.ping()`).
- Downstream services (if gateway; or just return own status).

Return: `{ status: 'ok' | 'degraded' | 'down', checks: { db: 'ok', redis: 'ok' } }`.

### Pre-launch checklist

**Security**:
- [ ] Spec 38 hardening complete (JWT, RBAC, encryption, CORS, rate limiting).
- [ ] `npm audit` clean (no high/critical vulnerabilities).
- [ ] Secrets are in env vars, not code.
- [ ] HTTPS enforced (Nginx redirects HTTP → HTTPS).

**Performance**:
- [ ] Spec 36 optimizations complete (indexes, caching, N+1 fixes).
- [ ] Load test passed (100 concurrent users, <2s page load, <200ms API response).

**Reliability**:
- [ ] Database backups scheduled (daily, tested restore).
- [ ] File upload backups scheduled.
- [ ] Health checks pass on all services.
- [ ] Monitoring and alerting active (Prometheus, Grafana, Alertmanager).

**Testing**:
- [ ] Spec 37 tests pass (unit, integration, E2E).
- [ ] Smoke test in production passes (signup, CRUD, email, AI chat).

**Docs**:
- [ ] README.md documents setup (dev + production).
- [ ] API docs generated (Swagger/OpenAPI for each service; optional for MVP).
- [ ] Runbook for common issues (service restart, DB migration, rollback).

**Business readiness**:
- [ ] Admin user created (or first-user-is-admin logic).
- [ ] Initial org/team set up (if needed).
- [ ] User onboarding flow tested (invitation acceptance, first login).

### Launch plan

1. **T-1 week**: final testing, freeze features, fix critical bugs.
2. **T-1 day**: deploy to staging, full smoke test, backup production DB (if migrating from another system).
3. **T-0 (launch)**: deploy to production (spec 39), monitor closely for 24h.
4. **T+1 day**: review metrics, logs, alerts. Fix any issues.
5. **T+1 week**: gather user feedback, plan post-launch improvements.

### Post-launch monitoring

- Watch Grafana dashboards for anomalies (error spikes, slow queries, job backlog).
- Review Alertmanager alerts daily (or on-call rotation if 24/7 support is needed).
- Check uptime monitor (spec 39) for downtime.
- User feedback: monitor support tickets, in-app feedback (if implemented), or a feedback email.

## Scope Limits

- No advanced APM (New Relic, Datadog) — use open-source (Prometheus, Grafana) for MVP.
- No distributed tracing (Jaeger) — optional for MVP.
- No on-call rotation or PagerDuty — simple email/Slack alerts for MVP.
- No chaos engineering or load shedding — defer to post-MVP.

## Check When Done

- Prometheus scrapes metrics from all services; Grafana displays dashboards.
- Alertmanager sends alerts for service down, high error rate, job backlog.
- Logs are accessible (Docker logs or Loki).
- Health checks pass on all services.
- Pre-launch checklist complete (security, performance, backups, tests, docs).
- Smoke test in production passes. Launch plan is documented. App is live and monitored.
