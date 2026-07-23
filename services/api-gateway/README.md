# API Gateway

API Gateway service for SalesIntel CRM - the single public entry point for all backend requests.

## Overview

The API Gateway is a NestJS application that serves as the entry point for all frontend traffic. It handles:

- **Routing/Proxying**: Routes requests to appropriate downstream microservices
- **Authentication**: Validates JWT tokens and attaches user context to requests
- **CORS**: Configures cross-origin resource sharing for frontend origins
- **Rate Limiting**: Protects services from abuse with configurable rate limits
- **Request Logging**: Structured logging with request IDs for tracing
- **Health Checks**: Monitors gateway and downstream service availability

## Architecture

```
Frontend → API Gateway → Downstream Services
                ↓
            Auth, CORS, Rate Limit, Logging
```

### Route Mapping

All routes are prefixed with `/api/<service>/` and forwarded to the corresponding service:

| Route Prefix              | Downstream Service      | Port | Public |
|---------------------------|-------------------------|------|--------|
| `/api/auth/*`             | auth-service            | 4001 | Yes    |
| `/api/organizations/*`    | organization-service    | 4002 | No     |
| `/api/contacts/*`         | contact-service         | 4003 | No     |
| `/api/companies/*`        | company-service         | 4004 | No     |
| `/api/activity/*`         | activity-service        | 4005 | No     |
| `/api/email/*`            | email-service           | 4006 | No     |
| `/api/ai/*`               | ai-service              | 4007 | No     |
| `/api/analytics/*`        | analytics-service       | 4008 | No     |
| `/api/notifications/*`    | notification-service    | 4009 | No     |
| `/api/files/*`            | file-service            | 4010 | No     |
| `/api/history/*`          | history-service         | 4011 | No     |

### Special Routes

- `GET /` - Gateway info
- `GET /health` - Health check (returns gateway status + downstream service health)

## Features

### JWT Authentication

- Validates JWT tokens on all non-public routes
- Public routes: `/api/auth/*` and `/health`
- Attaches user context to request: `userId`, `organizationId`, `email`, `role`
- Forwards identity to downstream services via trusted headers:
  - `x-user-id`
  - `x-organization-id`
  - `x-user-email`
  - `x-user-role`
  - `x-request-id`

### Rate Limiting

- Global rate limiter per IP/user
- Default: 60 requests per minute (configurable via `RATE_LIMIT_PER_MINUTE`)
- Handles requests behind proxies via `X-Forwarded-For` header

### CORS

- Configurable allowed origins via `CORS_ORIGINS` environment variable
- Credentials support for cookies/sessions
- Exposes `X-Request-ID` header to frontend

### Logging

- Structured request/response logging
- Includes request ID, user ID, status code, response time
- Logs proxy errors with full context

### Error Handling

- Global exception filter
- Standard `ApiResponse` error envelope:
  ```json
  {
    "success": false,
    "error": "ERROR_CODE",
    "message": "Human-readable error message",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/api/contacts/123"
  }
  ```

### Health Checks

`GET /health` returns:

```json
{
  "status": "healthy" | "degraded" | "unhealthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "gateway": {
    "uptime": 123456,
    "memory": {
      "used": 50000000,
      "total": 100000000,
      "percentage": 50
    }
  },
  "services": [
    {
      "service": "auth",
      "url": "http://localhost:4001",
      "status": "healthy",
      "responseTime": 25
    }
  ]
}
```

## Development

### Setup

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
NODE_ENV=development
API_GATEWAY_PORT=4000
JWT_SECRET=your-secret-here
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
RATE_LIMIT_PER_MINUTE=60
LOG_LEVEL=info

# Downstream service URLs
AUTH_SERVICE_URL=http://localhost:4001
ORGANIZATION_SERVICE_URL=http://localhost:4002
# ... etc
```

### Build

```bash
npm run build
```

### Run

```bash
# Development mode
npm run start:dev

# Production mode
npm run start
```

## Docker

### Build

```bash
docker build -t salesintel-api-gateway .
```

### Run

```bash
docker run -p 4000:4000 --env-file .env salesintel-api-gateway
```

### Docker Compose

The service is configured in `docker-compose.dev.yml` at the root level:

```bash
docker-compose -f docker-compose.dev.yml up api-gateway
```

## Testing

### Manual Testing

```bash
# Health check (public)
curl http://localhost:4000/health

# Gateway info (public)
curl http://localhost:4000

# Protected route (requires JWT)
curl -H "Authorization: Bearer <token>" http://localhost:4000/api/contacts
```

### Testing with Unavailable Services

The gateway gracefully handles unavailable downstream services:

```bash
# If contact-service is down, returns:
{
  "success": false,
  "error": "SERVICE_UNAVAILABLE",
  "message": "contact service is currently unavailable"
}
```

## Project Structure

```
src/
├── config/
│   └── configuration.ts        # Centralized config
├── controllers/
│   ├── proxy.controller.ts     # Route handlers for proxying
│   └── health.controller.ts    # Health check endpoint
├── services/
│   ├── proxy.service.ts        # Proxy middleware management
│   └── health.service.ts       # Health check logic
├── guards/
│   ├── jwt-auth.guard.ts       # JWT validation
│   └── throttler.guard.ts      # Rate limiting
├── filters/
│   └── global-exception.filter.ts  # Error handling
├── interceptors/
│   └── logging.interceptor.ts  # Request/response logging
├── decorators/
│   ├── public.decorator.ts     # Mark routes as public
│   └── user.decorator.ts       # Extract user from request
├── app.module.ts               # Root module
├── app.controller.ts           # Root controller
└── main.ts                     # Application entry point
```

## Key Dependencies

- `@nestjs/core` - NestJS framework
- `@nestjs/jwt` - JWT validation
- `@nestjs/throttler` - Rate limiting
- `http-proxy-middleware` - HTTP proxying
- `uuid` - Request ID generation

## Security

- JWT validation on all protected routes
- Rate limiting to prevent abuse
- CORS configured for trusted origins only
- Downstream services trust gateway headers implicitly
- No business logic in gateway - only routing and authentication

