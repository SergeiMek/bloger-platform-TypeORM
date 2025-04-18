import { configModule } from './confid';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AllDeleteController } from './featores/testing/testing.controller';
import { UserAccountsModule } from './featores/user-accounts/user-accounts.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SuperAdminAccountsModule } from './featores/superAdmin/superAdmin-platform.module';
import { BlogAccountsModule } from './featores/bloggers-platform/bloggers-platform.module';
import { UserEntity } from './featores/user-accounts/domain/user.entity';
import { DeviceEntity } from './featores/user-accounts/domain/device.entity';
import { Blog } from './featores/bloggers-platform/domain/blogs.entity';
import { Post } from './featores/bloggers-platform/domain/posts.entity';
import { Comment } from './featores/bloggers-platform/domain/comments.entity';
import { LikesForComment } from './featores/bloggers-platform/domain/commentsLike.entity';
import { LikesForPost } from './featores/bloggers-platform/domain/postsLike.entity';
import { QuizGameModuleModule } from './featores/quiz-game/quiz-game.module';
import { Player } from './featores/quiz-game/domain/player.entity';
import { Answer } from './featores/quiz-game/domain/answer.entity';
import { Game } from './featores/quiz-game/domain/game.entity';
import { Question } from './featores/quiz-game/domain/question.entity';
import { ScheduleModule } from '@nestjs/schedule';

export const options: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'nodejs',
  password: '1972',
  database: 'blog-platform-typeORM',
  entities: [
    Blog,
    Post,
    Comment,
    LikesForComment,
    LikesForPost,
    Player,
    Answer,
    Game,
    Question,
  ],
  autoLoadEntities: true,
  synchronize: true,
};
@Module({
  imports: [
    TypeOrmModule.forRoot(options),
    ScheduleModule.forRoot(),
    /*TypeOrmModule.forFeature([
      UserEntity,
      DeviceEntity,
      Blog,
      Post,
      LikesForPost,
      Comment,
    ]),*/
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
    QuizGameModuleModule,
  ],
  controllers: [AppController, AllDeleteController],
  providers: [AppService],
})
export class AppModule {}
