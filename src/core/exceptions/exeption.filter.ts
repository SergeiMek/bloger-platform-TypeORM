import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import any = jasmine.any;

/*@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    /!*response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });*!/

    const errorResponse: {
      errorsMessages: Array<{ message: string; field: string }>;
    } = {
      //errors: [],
      errorsMessages: [],
    };
    const responseBody: any = exception.getResponse();
    responseBody.message.forEach((m) => errorResponse.errorsMessages.push(m));
    response.status(status).json(errorResponse);
  }
}*/

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (status === HttpStatus.BAD_REQUEST || status === HttpStatus.NOT_FOUND) {
      const errorsResponse: any = {
        errorsMessages: [],
      };
      const responseBody: any = exception.getResponse();

      if (typeof responseBody.message !== 'string') {
        responseBody.message.forEach((m) =>
          errorsResponse.errorsMessages.push(m),
        );
        response.status(status).json(errorsResponse);
      } else {
        response.status(status).json(responseBody.message);
      }
    } else {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
