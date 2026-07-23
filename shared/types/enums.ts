/**
 * User roles for RBAC (Role-Based Access Control)
 */
export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  SALES_REP = 'SALES_REP',
  VIEWER = 'VIEWER',
}

/**
 * Entity types for activity tracking, history, and email links
 */
export enum EntityType {
  CONTACT = 'CONTACT',
  COMPANY = 'COMPANY',
}

/**
 * Email direction for sent/received tracking
 */
export enum EmailDirection {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
}

/**
 * Notification types
 */
export enum NotificationType {
  MENTION = 'MENTION',
  OWNERSHIP_TRANSFER = 'OWNERSHIP_TRANSFER',
  COMMENT = 'COMMENT',
  EMAIL = 'EMAIL',
  SYSTEM = 'SYSTEM',
}

/**
 * Activity/post types for timeline
 */
export enum ActivityType {
  POST = 'POST',
  EMAIL = 'EMAIL',
  OWNERSHIP_CHANGE = 'OWNERSHIP_CHANGE',
  CONTACT_CREATED = 'CONTACT_CREATED',
  COMPANY_CREATED = 'COMPANY_CREATED',
  CONTACT_UPDATED = 'CONTACT_UPDATED',
  COMPANY_UPDATED = 'COMPANY_UPDATED',
}
