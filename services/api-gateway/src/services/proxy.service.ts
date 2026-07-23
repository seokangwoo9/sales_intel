import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createProxyMiddleware, RequestHandler } from 'http-proxy-middleware';
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';

export type ServiceName =
  | 'auth'
  | 'organization'
  | 'contact'
  | 'company'
  | 'activity'
  | 'email'
  | 'ai'
  | 'analytics'
  | 'notification'
  | 'file'
  | 'history';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);
  private readonly serviceMap: Map<string, string>;
  private readonly proxyHandlers: Map<string, any>;

  constructor(private configService: ConfigService) {
    // Build service registry from config
    this.serviceMap = new Map<string, string>([
      ['auth', this.configService.get<string>('services.auth')!],
      ['organization', this.configService.get<string>('services.organization')!],
      ['contact', this.configService.get<string>('services.contact')!],
      ['company', this.configService.get<string>('services.company')!],
      ['activity', this.configService.get<string>('services.activity')!],
      ['email', this.configService.get<string>('services.email')!],
      ['ai', this.configService.get<string>('services.ai')!],
      ['analytics', this.configService.get<string>('services.analytics')!],
      ['notification', this.configService.get<string>('services.notification')!],
      ['file', this.configService.get<string>('services.file')!],
      ['history', this.configService.get<string>('services.history')!],
    ]);

    // Create proxy handlers for each service
    this.proxyHandlers = new Map<string, any>();
    this.serviceMap.forEach((target, service) => {
      this.proxyHandlers.set(
        service,
        createProxyMiddleware({
          target,
          changeOrigin: true,
          pathRewrite: (path: string) => {
            // Remove /api/{service} prefix before forwarding
            return path.replace(`/api/${service}`, '');
          },
          on: {
            proxyReq: (proxyReq: any, req: any) => {
              // Forward trusted headers
              const headers = req.headers;
              if (headers['x-request-id']) {
                proxyReq.setHeader('x-request-id', headers['x-request-id']);
              }
              if (headers['x-user-id']) {
                proxyReq.setHeader('x-user-id', headers['x-user-id']);
              }
              if (headers['x-organization-id']) {
                proxyReq.setHeader('x-organization-id', headers['x-organization-id']);
              }
              if (headers['x-user-email']) {
                proxyReq.setHeader('x-user-email', headers['x-user-email']);
              }
              if (headers['x-user-role']) {
                proxyReq.setHeader('x-user-role', headers['x-user-role']);
              }

              this.logger.debug(
                `Proxying ${req.method} ${req.url} to ${target}${proxyReq.path}`,
              );
            },
            error: (err: Error, req: any, res: any) => {
              this.logger.error(
                `Proxy error for ${service}: ${err.message}`,
                err.stack,
              );

              if (res.writeHead && !res.headersSent) {
                res.writeHead(503, { 'Content-Type': 'application/json' });
                res.end(
                  JSON.stringify({
                    success: false,
                    error: 'SERVICE_UNAVAILABLE',
                    message: `${service} service is currently unavailable`,
                  }),
                );
              }
            },
          },
        }),
      );
    });

    this.logger.log('Proxy service initialized with service registry:');
    this.serviceMap.forEach((url, service) => {
      this.logger.log(`  ${service} -> ${url}`);
    });
  }

  getProxyHandler(service: ServiceName): any {
    const handler = this.proxyHandlers.get(service);
    if (!handler) {
      throw new ServiceUnavailableException(
        `No proxy handler found for service: ${service}`,
      );
    }
    return handler;
  }

  getServiceUrl(service: ServiceName): string {
    const url = this.serviceMap.get(service);
    if (!url) {
      throw new ServiceUnavailableException(
        `Service not configured: ${service}`,
      );
    }
    return url;
  }

  getAllServices(): Map<string, string> {
    return new Map(this.serviceMap);
  }
}
