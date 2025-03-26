import { configModule } from './confid';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AllDeleteController } from './featores/testing/testing.controller';
import { UserAccountsModule } from './featores/user-accounts/user-accounts.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuperAdminAccountsModule } from './featores/superAdmin/superAdmin-platform.module';
import { BlogAccountsModule } from './featores/bloggers-platform/bloggers-platform.module';
import { UserEntity } from './featores/user-accounts/domain/user.entity';
import { DeviceEntity } from './featores/user-accounts/domain/device.entity';
import { Blog } from './featores/bloggers-platform/domain/blogs.entity';
import { Post } from './featores/bloggers-platform/domain/posts.entity';
import { Comment } from './featores/bloggers-platform/domain/comments.entity';
import { LikesForComment } from './featores/bloggers-platform/domain/commentsLike.entity';
import { LikesForPost } from './featores/bloggers-platform/domain/postsLike.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'nodejs',
      password: '1972',
      database: 'blog-platform-typeORM',
      entities: [Blog, Post, Comment, LikesForComment, LikesForPost],
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([
      UserEntity,
      DeviceEntity,
      Blog,
      Post,
      LikesForPost,
      Comment,
    ]),
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 5,
      },
    ]),
    configModule,
    UserAccountsModule,
    SuperAdminAccountsModule,
    BlogAccountsModule,
  ],
  controllers: [AppController, AllDeleteController],
  providers: [AppService],
})
export class AppModule {}
