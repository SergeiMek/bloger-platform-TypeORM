import { SuperAdminController } from './api/superAdmin.controller';
import { BlogsService } from '../bloggers-platform/application/blogs.service';
import { BlogsQueryRepository } from '../bloggers-platform/infrastructure/query/blogs.query-repository';
import { BlogsRepository } from '../bloggers-platform/infrastructure/blogs.repository';
import { Module } from '@nestjs/common';
import { UsersQueryRepository } from '../user-accounts/infrastructure/query/users.query-repository';
import { UsersRepo } from '../user-accounts/infrastructure/users-repo';
import { UsersService } from '../user-accounts/application/users.service';
import { EmailService } from '../notifications/email.service';
import { PostsRepository } from '../bloggers-platform/infrastructure/posts.repository';
import { PostsQueryRepository } from '../bloggers-platform/infrastructure/query/posts.query-repository';
import { PostsService } from '../bloggers-platform/application/posts.service';
import { UserEntity } from '../user-accounts/domain/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from '../bloggers-platform/domain/blogs.entity';
import { Post } from '../bloggers-platform/domain/posts.entity';
import { LikesForPost } from '../bloggers-platform/domain/postsLike.entity';
import { SuperAdminQuizController } from './api/superAdminQiuiz.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { QuestionCreateUseCase } from './aplication/question-create.use-case';
import { Question } from '../quiz-game/domain/question.entity';
import { Answer } from '../quiz-game/domain/answer.entity';
import { DataSourceRepository } from '../../core/repositories/data-source.repository';
import { QuestionsQuizQueryRepository } from '../quiz-game/infrastructure/query/questionsQuiz.query-repository';
import { QuestionsRepository } from '../quiz-game/infrastructure/questions.repository';
import { QuestionDeleteUseCase } from './aplication/question-delete.use-case';
import { QuestionUpdateUseCase } from './aplication/question-update.use-case';
import { QuestionPublishUseCase } from './aplication/question-publish.use-case';

const useCases = [
  QuestionCreateUseCase,
  QuestionDeleteUseCase,
  QuestionUpdateUseCase,
  QuestionPublishUseCase,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      Blog,
      Post,
      LikesForPost,
      Question,
      Answer,
    ]),
    CqrsModule,
  ],
  controllers: [SuperAdminController, SuperAdminQuizController],
  providers: [
    BlogsService,
    BlogsQueryRepository,
    BlogsRepository,
    UsersQueryRepository,
    UsersRepo,
    BlogsService,
    BlogsQueryRepository,
    UsersService,
    UsersQueryRepository,
    EmailService,
    PostsRepository,
    PostsQueryRepository,
    PostsService,
    ...useCases,
    DataSourceRepository,
    QuestionsQuizQueryRepository,
    QuestionsRepository,
  ],
  exports: [TypeOrmModule],
})
export class SuperAdminAccountsModule {}
