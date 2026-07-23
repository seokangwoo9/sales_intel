export default () => ({
  port: parseInt(process.env.API_GATEWAY_PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  jwt: {
    secret: process.env.JWT_SECRET || 'your-jwt-secret-key-here',
    expiresIn: '1h',
  },

  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    credentials: true,
  },

  rateLimit: {
    ttl: 60000, // 1 minute in milliseconds
    limit: parseInt(process.env.RATE_LIMIT_PER_MINUTE || '60', 10),
  },

  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
    organization: process.env.ORGANIZATION_SERVICE_URL || 'http://localhost:4002',
    contact: process.env.CONTACT_SERVICE_URL || 'http://localhost:4003',
    company: process.env.COMPANY_SERVICE_URL || 'http://localhost:4004',
    activity: process.env.ACTIVITY_SERVICE_URL || 'http://localhost:4005',
    email: process.env.EMAIL_SERVICE_URL || 'http://localhost:4006',
    ai: process.env.AI_SERVICE_URL || 'http://localhost:4007',
    analytics: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:4008',
    notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:4009',
    file: process.env.FILE_SERVICE_URL || 'http://localhost:4010',
    history: process.env.HISTORY_SERVICE_URL || 'http://localhost:4011',
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
});
