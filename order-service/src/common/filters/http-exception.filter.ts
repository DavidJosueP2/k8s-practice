import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === 'string') {
      response.status(statusCode).json({
        statusCode,
        message: exceptionResponse,
        path: request.url,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const payload =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (exceptionResponse as Record<string, unknown>)
        : {};

    response.status(statusCode).json({
      ...payload,
      statusCode: Number(payload.statusCode ?? statusCode),
      path: String(payload.path ?? request.url),
      timestamp:
        typeof payload.timestamp === 'string'
          ? payload.timestamp
          : new Date().toISOString(),
    });
  }
}
