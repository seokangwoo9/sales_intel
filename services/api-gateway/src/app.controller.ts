import { Controller, Get } from '@nestjs/common';
import { Public } from './decorators/public.decorator';

@Controller()
export class AppController {
  @Get()
  @Public()
  getInfo() {
    return {
      service: 'SalesIntel API Gateway',
      version: '1.0.0',
      status: 'running',
    };
  }
}
