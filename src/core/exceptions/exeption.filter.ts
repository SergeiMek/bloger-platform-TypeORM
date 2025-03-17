import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import any = jasmine.any;

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    /*response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });*/

    const errorResponse: { errors: Array<{ message: string; field: string }> } =
      {
        errors: [],
      };
    const responseBody: any = exception.getResponse();
    responseBody.message.forEach((m) => errorResponse.errors.push(m));
    response.status(status).json(errorResponse);
  }
}
