import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Answer } from './domain/answer.entity';
import { Question } from './domain/question.entity';
import { CqrsModule } from '@nestjs/cqrs';
import { Player } from './domain/player.entity';
import { Game } from './domain/game.entity';
import { QuizController } from './api/quiz.controller';
import { GamesRepository } from './infrastructure/games.repository';
import { UserConnect } from './use-case/user-connect';
import { QuestionsRepository } from './infrastructure/questions.repository';
import { UsersRepo } from '../user-accounts/infrastructure/users-repo';
import { DataSourceRepository } from '../../core/repositories/data-source.repository';
import { UserEntity } from '../user-accounts/domain/user.entity';
import { GamesQueryRepository } from './infrastructure/query/gamesQuery.repository';
import { AnswerSendUseCase } from './use-case/answer-send';
import { GameFindUseCase } from './use-case/game-find';
import { GameFinishUseCase } from './use-case/finish-game';

const useCases = [
  UserConnect,
  AnswerSendUseCase,
  GameFindUseCase,
  GameFinishUseCase,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([Answer, Question, Player, Game, UserEntity]),
    CqrsModule,
  ],
  controllers: [QuizController],
  providers: [
    ...useCases,
    GamesRepository,
    QuestionsRepository,
    GamesQueryRepository,
    UsersRepo,
    DataSourceRepository,
  ],
  exports: [],
})
export class QuizGameModuleModule {}
