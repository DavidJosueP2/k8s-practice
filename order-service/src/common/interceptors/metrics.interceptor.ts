import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { MetricsService } from '../../services/metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const request = context.switchToHttp().getRequest<
      Request & { route?: { path?: string } }
    >();

    return next.handle().pipe(
      finalize(() => {
        this.metricsService.increment(
          this.resolveRouteLabel(request),
          request.method,
        );
      }),
    );
  }

  private resolveRouteLabel(
    request: Request & { route?: { path?: string } },
  ): string {
    const routePath = request.route?.path;

    if (typeof routePath === 'string' && routePath.length > 0) {
      const baseUrl = request.baseUrl ?? '';
      return `${baseUrl}/${routePath}`.replace(/\/{2,}/g, '/');
    }

    return request.path ?? request.url;
  }
}
