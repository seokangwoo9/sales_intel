const config = {
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://salesintel:salesintel_dev_password@localhost:5432/salesintel_dev',
  },
};

module.exports = config;
