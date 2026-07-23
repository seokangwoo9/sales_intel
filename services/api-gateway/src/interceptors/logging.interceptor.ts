import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, ip } = request;

    // Generate request ID
    const requestId = uuidv4();
    request.headers['x-request-id'] = requestId;
    response.setHeader('x-request-id', requestId);

    const now = Date.now();

    this.logger.log(
      `[${requestId}] --> ${method} ${url} - IP: ${ip} - User: ${request.user?.userId || 'anonymous'}`,
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const { statusCode } = response;
          const elapsed = Date.now() - now;
          this.logger.log(
            `[${requestId}] <-- ${method} ${url} - Status: ${statusCode} - ${elapsed}ms`,
          );
        },
        error: (error) => {
          const elapsed = Date.now() - now;
          const statusCode = error?.status || 500;
          this.logger.error(
            `[${requestId}] <-- ${method} ${url} - Status: ${statusCode} - ${elapsed}ms - Error: ${error?.message}`,
          );
        },
      }),
    );
  }
}
