import { Role } from '../types/enums';

/**
 * Default pagination size for list endpoints
 */
export const DEFAULT_PAGE_SIZE = 20;

/**
 * Maximum pagination size
 */
export const MAX_PAGE_SIZE = 100;

/**
 * Role hierarchy for permission checks
 * Higher index = more permissions
 */
export const ROLE_HIERARCHY: Role[] = [
  Role.VIEWER,
  Role.SALES_REP,
  Role.MANAGER,
  Role.ADMIN,
];

/**
 * Permission keys for fine-grained access control
 */
export const PERMISSIONS = {
  // Contact permissions
  CONTACT_CREATE: 'contact:create',
  CONTACT_READ: 'contact:read',
  CONTACT_UPDATE: 'contact:update',
  CONTACT_DELETE: 'contact:delete',
  CONTACT_TRANSFER: 'contact:transfer',

  // Company permissions
  COMPANY_CREATE: 'company:create',
  COMPANY_READ: 'company:read',
  COMPANY_UPDATE: 'company:update',
  COMPANY_DELETE: 'company:delete',
  COMPANY_TRANSFER: 'company:transfer',

  // Organization permissions
  ORG_SETTINGS_UPDATE: 'org:settings:update',
  ORG_MEMBER_INVITE: 'org:member:invite',
  ORG_MEMBER_REMOVE: 'org:member:remove',
  ORG_ROLE_ASSIGN: 'org:role:assign',

  // Email permissions
  EMAIL_SEND: 'email:send',
  EMAIL_READ: 'email:read',

  // Activity permissions
  POST_CREATE: 'post:create',
  POST_READ: 'post:read',
  POST_UPDATE: 'post:update',
  POST_DELETE: 'post:delete',

  // Analytics permissions
  ANALYTICS_VIEW: 'analytics:view',
  ANALYTICS_EXPORT: 'analytics:export',
} as const;

/**
 * API version prefix
 */
export const API_VERSION = 'v1';

/**
 * JWT token expiration times
 */
export const TOKEN_EXPIRATION = {
  ACCESS_TOKEN: '15m',
  REFRESH_TOKEN: '7d',
} as const;

/**
 * Rate limiting defaults
 */
export const RATE_LIMITS = {
  DEFAULT: 100, // requests per minute
  AUTH: 5, // login attempts per minute
  AI: 20, // AI requests per minute
} as const;

/**
 * File upload limits
 */
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB in bytes
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ],
} as const;
