import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ServiceHealth {
  service: string;
  url: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime?: number;
  error?: string;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  gateway: {
    uptime: number;
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
  };
  services: ServiceHealth[];
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  constructor(private configService: ConfigService) {}

  async checkHealth(): Promise<HealthResponse> {
    const services = this.configService.get<Record<string, string>>('services')!;
    const serviceHealthChecks: ServiceHealth[] = [];

    // Check each downstream service
    for (const [serviceName, serviceUrl] of Object.entries(services)) {
      const health = await this.checkServiceHealth(serviceName, serviceUrl);
      serviceHealthChecks.push(health);
    }

    // Calculate overall status
    const healthyCount = serviceHealthChecks.filter(
      (s) => s.status === 'healthy',
    ).length;
    const totalCount = serviceHealthChecks.length;

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (healthyCount === totalCount) {
      overallStatus = 'healthy';
    } else if (healthyCount > 0) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'unhealthy';
    }

    // Get memory usage
    const memUsage = process.memoryUsage();
    const totalMem = memUsage.heapTotal;
    const usedMem = memUsage.heapUsed;

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      gateway: {
        uptime: Date.now() - this.startTime,
        memory: {
          used: usedMem,
          total: totalMem,
          percentage: Math.round((usedMem / totalMem) * 100),
        },
      },
      services: serviceHealthChecks,
    };
  }

  private async checkServiceHealth(
    serviceName: string,
    serviceUrl: string,
  ): Promise<ServiceHealth> {
    const startTime = Date.now();

    try {
      // Attempt to fetch health endpoint with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(`${serviceUrl}/health`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      if (response.ok) {
        return {
          service: serviceName,
          url: serviceUrl,
          status: 'healthy',
          responseTime,
        };
      } else {
        return {
          service: serviceName,
          url: serviceUrl,
          status: 'unhealthy',
          responseTime,
          error: `HTTP ${response.status}`,
        };
      }
    } catch (error: any) {
      const responseTime = Date.now() - startTime;

      // Service unavailable or timeout
      return {
        service: serviceName,
        url: serviceUrl,
        status: 'unhealthy',
        responseTime,
        error: error.name === 'AbortError' ? 'Timeout' : error.message,
      };
    }
  }
}
