import { Controller, Get } from '@nestjs/common';
import { HealthService, HealthResponse } from '../services/health.service';
import { Public } from '../decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @Public()
  async checkHealth(): Promise<HealthResponse> {
    return this.healthService.checkHealth();
  }
}
