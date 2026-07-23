import { Role } from './enums';

/**
 * User DTO - minimal fields for cross-service transport
 * Full model will be defined in Prisma schema
 */
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Organization DTO - minimal fields for cross-service transport
 */
export interface Organization {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Organization member with role
 */
export interface OrganizationMember {
  userId: string;
  organizationId: string;
  role: Role;
  joinedAt: Date;
}

/**
 * Contact DTO - minimal fields for cross-service transport
 */
export interface Contact {
  id: string;
  organizationId: string;
  ownerId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Company DTO - minimal fields for cross-service transport
 */
export interface Company {
  id: string;
  organizationId: string;
  ownerId: string;
  name: string;
  website?: string;
  industry?: string;
  parentCompanyId?: string;
  createdAt: Date;
  updatedAt: Date;
}
