import { Controller, All, Req, Res, Next } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ProxyService, ServiceName } from '../services/proxy.service';
import { Public } from '../decorators/public.decorator';

@Controller('api')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  // Auth service routes (public for login/register)
  @All('auth/*')
  @Public()
  proxyAuth(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const handler = this.proxyService.getProxyHandler('auth');
    return handler(req, res, next);
  }

  // Organization service routes
  @All('organizations/*')
  proxyOrganization(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const handler = this.proxyService.getProxyHandler('organization');
    return handler(req, res, next);
  }

  // Contact service routes
  @All('contacts/*')
  proxyContact(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const handler = this.proxyService.getProxyHandler('contact');
    return handler(req, res, next);
  }

  // Company service routes
  @All('companies/*')
  proxyCompany(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const handler = this.proxyService.getProxyHandler('company');
    return handler(req, res, next);
  }

  // Activity service routes
  @All('activity/*')
  proxyActivity(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const handler = this.proxyService.getProxyHandler('activity');
    return handler(req, res, next);
  }

  // Email service routes
  @All('email/*')
  proxyEmail(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const handler = this.proxyService.getProxyHandler('email');
    return handler(req, res, next);
  }

  // AI service routes
  @All('ai/*')
  proxyAi(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const handler = this.proxyService.getProxyHandler('ai');
    return handler(req, res, next);
  }

  // Analytics service routes
  @All('analytics/*')
  proxyAnalytics(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const handler = this.proxyService.getProxyHandler('analytics');
    return handler(req, res, next);
  }

  // Notification service routes
  @All('notifications/*')
  proxyNotification(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const handler = this.proxyService.getProxyHandler('notification');
    return handler(req, res, next);
  }

  // File service routes
  @All('files/*')
  proxyFile(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const handler = this.proxyService.getProxyHandler('file');
    return handler(req, res, next);
  }

  // History service routes
  @All('history/*')
  proxyHistory(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const handler = this.proxyService.getProxyHandler('history');
    return handler(req, res, next);
  }
}
