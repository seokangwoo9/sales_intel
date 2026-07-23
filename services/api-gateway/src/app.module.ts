import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

import { AppController } from './app.controller';
import { ProxyController } from './controllers/proxy.controller';
import { HealthController } from './controllers/health.controller';

import { ProxyService } from './services/proxy.service';
import { HealthService } from './services/health.service';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ThrottlerBehindProxyGuard } from './guards/throttler.guard';

import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'your-jwt-secret-key-here',
      signOptions: { expiresIn: '1h' },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: parseInt(process.env.RATE_LIMIT_PER_MINUTE || '60', 10),
      },
    ]),
  ],
  controllers: [AppController, ProxyController, HealthController],
  providers: [
    ProxyService,
    HealthService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
