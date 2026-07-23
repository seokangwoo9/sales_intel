/**
 * Test file to verify shared library imports work correctly
 * This file demonstrates how to import from the shared library
 */

// Test imports
import { Role, EntityType, NotificationType } from '@shared/types/enums';
import { ApiResponse, Paginated } from '@shared/types/api';
import { User, Contact, Company } from '@shared/types/entities';
import { DEFAULT_PAGE_SIZE, PERMISSIONS } from '@shared/constants';
import { utils } from '@shared';

// Test enum usage
const adminRole: Role = Role.ADMIN;
const contactEntity: EntityType = EntityType.CONTACT;

// Test API response type
const response: ApiResponse<User> = {
  success: true,
  data: {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

// Test pagination
const paginatedContacts: Paginated<Contact> = {
  items: [],
  pagination: {
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
  },
};

// Test utilities
const slug = utils.slugify('Test Company Name');
const isValidEmail = utils.isEmail('test@example.com');
const initials = utils.getInitials('John Doe');

console.log('Shared library imports working correctly!');
console.log({ adminRole, slug, isValidEmail, initials });

export {};
