import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule, options } from '../../../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import supertest, { SuperAgentTest } from 'supertest';
import { useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from '../../../src/core/exceptions/exeption.filter';
import { customExceptionFactory } from './exception.factory';
import { AllExceptionsFilter } from '../../../src/core/exceptions/filters/all-exceptions-filter';
import { DomainExceptionsFilter } from '../../../src/core/exceptions/filters/domain-exceptions-filter';
export const getAppAndClearDb = async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [TypeOrmModule.forRoot(options), AppModule],
  }).compile();

  const app: INestApplication = moduleRef.createNestApplication();
  // @ts-ignore
  const agent: SuperAgentTest = supertest.agent(app.getHttpServer());

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: customExceptionFactory,
    }),
  );
  ///app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new DomainExceptionsFilter(),
    new HttpExceptionFilter(),
  );

  await app.init();
  await agent.delete('/testing/all-data/');

  return {
    app: app,
    agent: agent,
  };
};
