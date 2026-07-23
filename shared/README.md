# Shared Libraries

This directory contains TypeScript types, constants, and utilities shared across all microservices and the frontend application.

## Structure

```
shared/
├── types/           # TypeScript interfaces and types
│   ├── api.ts      # API response envelopes and pagination
│   ├── enums.ts    # Shared enums (Role, EntityType, etc.)
│   ├── entities.ts # Core entity DTOs (User, Contact, Company, etc.)
│   └── index.ts    # Types barrel export
├── constants/       # Shared constants and configuration
│   └── index.ts    # Default values, permissions, rate limits, etc.
├── utils/           # Pure utility functions (frontend + backend safe)
│   └── index.ts    # Helper functions (slugify, isEmail, etc.)
├── index.ts         # Main barrel export
└── README.md        # This file
```

## Usage

### In Frontend (Next.js)

```typescript
import { Role, EntityType } from '@shared/types/enums';
import { ApiResponse, Paginated } from '@shared/types/api';
import { User, Contact } from '@shared/types/entities';
import { DEFAULT_PAGE_SIZE, PERMISSIONS } from '@shared/constants';
import { utils } from '@shared';

// Use enums
const role: Role = Role.ADMIN;

// Use API response type
const response: ApiResponse<User> = {
  success: true,
  data: { /* user data */ },
};

// Use utilities
const slug = utils.slugify('My Company Name');
const isValid = utils.isEmail('test@example.com');
```

### In Backend Services (NestJS)

```typescript
import { Role, EntityType } from '@shared/types/enums';
import { ApiResponse, Paginated } from '@shared/types/api';
import { DEFAULT_PAGE_SIZE } from '@shared/constants';

// Return standardized API responses
return {
  success: true,
  data: results,
} as ApiResponse<Contact[]>;

// Use pagination
const paginated: Paginated<Contact> = {
  items: contacts,
  pagination: {
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: totalCount,
  },
};
```

## Path Aliases

The project uses TypeScript path aliases for clean imports:

- `@shared` → `./shared`
- `@shared/*` → `./shared/*`

These are configured in `tsconfig.json`.

## Types

### API Types (`types/api.ts`)

- `ApiResponse<T>` - Standard response envelope for all API endpoints
- `Pagination` - Pagination metadata
- `Paginated<T>` - Wrapper for paginated list responses

### Enums (`types/enums.ts`)

- `Role` - User roles (ADMIN, MANAGER, SALES_REP, VIEWER)
- `EntityType` - Entity types for linking (CONTACT, COMPANY)
- `EmailDirection` - Email direction (INBOUND, OUTBOUND)
- `NotificationType` - Notification categories
- `ActivityType` - Timeline activity types

### Entity DTOs (`types/entities.ts`)

Minimal transport shapes for core entities:
- `User` - User profile
- `Organization` - Organization/tenant
- `OrganizationMember` - User-org membership with role
- `Contact` - Customer contact
- `Company` - Business entity

**Note:** These are transport DTOs, not Prisma models. Full schemas live in `prisma/schema.prisma`.

## Constants

- `DEFAULT_PAGE_SIZE` - Default pagination size (20)
- `MAX_PAGE_SIZE` - Maximum pagination size (100)
- `ROLE_HIERARCHY` - Role hierarchy for permission checks
- `PERMISSIONS` - Fine-grained permission keys
- `API_VERSION` - API version prefix
- `TOKEN_EXPIRATION` - JWT token expiration times
- `RATE_LIMITS` - Rate limiting defaults
- `FILE_UPLOAD` - File upload constraints

## Utilities

All utilities are pure functions safe for both frontend and backend (no Node-specific or browser-specific APIs):

- `slugify(text)` - Convert string to URL-friendly slug
- `isEmail(email)` - Basic email validation
- `assertNever(value)` - TypeScript exhaustiveness check
- `formatFileSize(bytes)` - Human-readable file size
- `truncate(text, maxLength)` - Truncate text with ellipsis
- `deepClone<T>(obj)` - Deep clone POJO
- `isEmpty(value)` - Check if value is empty
- `randomString(length)` - Generate random string
- `delay(ms)` - Promise-based delay
- `capitalize(text)` - Capitalize first letter
- `getInitials(name)` - Extract initials for avatars

## Guidelines

### DO

✅ Add types that are shared across multiple services
✅ Keep DTOs minimal - expand them as services are built
✅ Use pure functions in `utils/` (no side effects)
✅ Export everything through barrel files (`index.ts`)
✅ Follow TypeScript strict mode
✅ Align types with Prisma schema (but don't duplicate)

### DON'T

❌ Add service-specific logic or endpoints
❌ Include Prisma models or database code
❌ Use Node-specific APIs (fs, path, etc.) in utils
❌ Use browser-specific APIs (window, document) in utils
❌ Add network calls or async operations to utils
❌ Duplicate Prisma-generated types

## Extending

To add new shared types:

1. Create/update files in `types/`, `constants/`, or `utils/`
2. Export from the subdirectory's `index.ts`
3. Main `shared/index.ts` automatically re-exports
4. Verify with `npx tsc --noEmit`
5. Update this README if adding new categories

## Testing

See `shared/test-imports.ts` for import verification examples.

Run TypeScript check:
```bash
npx tsc --noEmit
```

Run build:
```bash
npm run build
```
