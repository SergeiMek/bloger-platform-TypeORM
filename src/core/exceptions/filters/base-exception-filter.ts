import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainException, ErrorExtension } from '../domain-exceptions';

export type HttpResponseBody = {
  errorsMessages: ErrorExtension[];
};

export abstract class BaseExceptionFilter implements ExceptionFilter {
  abstract onCatch(exception: any, response: Response, request: Request): void;

  catch(exception: any, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    this.onCatch(exception, response, request);
  }

  getDefaultHttpBody(exception: unknown): HttpResponseBody | void {
    // @ts-ignore
    if (!exception.errorsMessages) {
      return;
    }
    return {
      errorsMessages:
        exception instanceof DomainException ? exception.errorsMessages : [],
    };
  }
}
