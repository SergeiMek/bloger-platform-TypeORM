import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../../domain/game.entity';
import { AnswerViewDto, GameViewDto } from '../../dto/game.view.dto';
import { Answer } from '../../domain/answer.entity';
import { GameStatus } from '../../../../enums/game-status.enum';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exceptions';

@Injectable()
export class GamesQueryRepository {
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
  ) {}

  async findGameById(gameId: string): Promise<GameViewDto | null> {
    try {
      const games = await this.gamesRepository
        .createQueryBuilder('game')
        .leftJoinAndSelect('game.questions', 'gq')
        .leftJoinAndSelect('game.playerOne', 'po')
        .leftJoinAndSelect('po.user', 'pou')
        .leftJoinAndSelect('po.answers', 'poa')
        .leftJoinAndSelect('poa.question', 'poaq')
        .leftJoinAndSelect('game.playerTwo', 'pt')
        .leftJoinAndSelect('pt.user', 'ptu')
        .leftJoinAndSelect('pt.answers', 'pta')
        .leftJoinAndSelect('pta.question', 'ptaq')
        .where(`game.id = :gameId`, {
          gameId,
        })
        .orderBy('gq.createdAt', 'DESC')
        .addOrderBy('poa.addedAt')
        .addOrderBy('pta.addedAt')
        .getMany();

      if (games.length === 0) {
        return null;
      }
      const mappedGames = await this.gamesMapping(games);
      return mappedGames[0];
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException('error found game');
    }
  }
  async findAnswerInGame(
    gameId: string,
    userId: string,
  ): Promise<AnswerViewDto | null> {
    const games = await this.gamesRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.questions', 'gq')
      .leftJoinAndSelect('game.playerOne', 'po')
      .leftJoinAndSelect('po.user', 'pou')
      .leftJoinAndSelect('po.answers', 'poa')
      .leftJoinAndSelect('poa.question', 'poaq')
      .leftJoinAndSelect('game.playerTwo', 'pt')
      .leftJoinAndSelect('pt.user', 'ptu')
      .leftJoinAndSelect('pt.answers', 'pta')
      .leftJoinAndSelect('pta.question', 'ptaq')
      .where(`game.id = :gameId`, {
        gameId: gameId,
      })
      .andWhere(`(pou.id = :userId or ptu.id = :userId)`, {
        userId: userId,
      })
      .orderBy('gq.createdAt', 'DESC')
      .addOrderBy('poa.addedAt')
      .addOrderBy('pta.addedAt')
      .getMany();

    if (games.length === 0) {
      return null;
    }

    let answers = games[0].playerOne.answers;
    if (games[0].playerTwo.user.id === userId) {
      answers = games[0].playerTwo.answers;
    }

    const mappedAnswers = await this.answersMapping(answers);
    return mappedAnswers[mappedAnswers.length - 1];
  }

  async findCurrentGame(userId: string): Promise<GameViewDto | null> {
    const games = await this.gamesRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.questions', 'gq')
      .leftJoinAndSelect('game.playerOne', 'po')
      .leftJoinAndSelect('po.user', 'pou')
      .leftJoinAndSelect('po.answers', 'poa')
      .leftJoinAndSelect('poa.question', 'poaq')
      .leftJoinAndSelect('game.playerTwo', 'pt')
      .leftJoinAndSelect('pt.user', 'ptu')
      .leftJoinAndSelect('pt.answers', 'pta')
      .leftJoinAndSelect('pta.question', 'ptaq')
      .where(`game.status = :pending or game.status = :active`, {
        pending: GameStatus.PendingSecondPlayer,
        active: GameStatus.Active,
      })
      .andWhere('(pou.id = :userId or ptu.id = :userId)', { userId: userId })
      .orderBy('gq.createdAt', 'DESC')
      .addOrderBy('poa.addedAt')
      .addOrderBy('pta.addedAt')
      .getMany();

    if (games.length === 0) {
      throw NotFoundDomainException.create('game not found');
    }

    const mappedGames = await this.gamesMapping(games);
    return mappedGames[0];
  }
  private async gamesMapping(games: Game[]): Promise<GameViewDto[]> {
    let playersCount = 1;
    if (games[0].playerTwo) {
      playersCount = 2;
    }

    let secondPlayerProgress: any = null;
    let questions: null | { id: string; body: string }[] = null;

    return games.map((g) => {
      if (playersCount === 2) {
        secondPlayerProgress = {
          answers: g.playerTwo.answers.map((a) => {
            return {
              questionId: a.question.id.toString(),
              answerStatus: a.answerStatus,
              addedAt: a.addedAt,
            };
          }),
          player: {
            id: g.playerTwo.user.id.toString(),
            login: g.playerTwo.user.login,
          },
          score: g.playerTwo.score,
        };
        questions = g.questions.map((q) => {
          return {
            id: q.id.toString(),
            body: q.body,
          };
        });
      }

      return {
        id: g.id.toString(),
        firstPlayerProgress: {
          answers: g.playerOne.answers.map((a) => {
            return {
              questionId: a.question.id.toString(),
              answerStatus: a.answerStatus,
              addedAt: a.addedAt,
            };
          }),
          player: {
            id: g.playerOne.user.id.toString(),
            login: g.playerOne.user.login,
          },
          score: g.playerOne.score,
        },
        secondPlayerProgress: secondPlayerProgress,
        questions: questions,
        status: g.status,
        pairCreatedDate: g.pairCreatedDate,
        startGameDate: g.startGameDate,
        finishGameDate: g.finishGameDate,
      };
    });
  }

  private async answersMapping(array: Answer[]): Promise<AnswerViewDto[]> {
    return array.map((a) => {
      return {
        questionId: a.question.id.toString(),
        answerStatus: a.answerStatus,
        addedAt: a.addedAt,
      };
    });
  }
}
