import { SuperAdminController } from './api/superAdmin.controller';
import { BlogsService } from '../bloggers-platform/application/blogs.service';
import { BlogsQueryRepository } from '../bloggers-platform/infrastructure/query/blogs.query-repository';
import { BlogsRepository } from '../bloggers-platform/infrastructure/blogs.repository';
import { Module } from '@nestjs/common';
import { UsersQueryRepository } from '../user-accounts/infrastructure/query/users.query-repository';
import { UsersRepository } from '../user-accounts/infrastructure/users.repository';
import { UsersService } from '../user-accounts/application/users.service';
import { EmailService } from '../notifications/email.service';
import { PostsRepository } from '../bloggers-platform/infrastructure/posts.repository';
import { PostsQueryRepository } from '../bloggers-platform/infrastructure/query/posts.query-repository';
import { PostsService } from '../bloggers-platform/application/posts.service';

@Module({
  imports: [],
  controllers: [SuperAdminController],
  providers: [
    BlogsService,
    BlogsQueryRepository,
    BlogsRepository,
    UsersQueryRepository,
    UsersRepository,
    BlogsService,
    BlogsQueryRepository,
    UsersService,
    UsersQueryRepository,
    EmailService,
    PostsRepository,
    PostsQueryRepository,
    PostsService,
  ],
  exports: [],
})
export class SuperAdminAccountsModule {}
