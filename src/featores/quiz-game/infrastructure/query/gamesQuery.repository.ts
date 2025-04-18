import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Game } from '../../domain/game.entity';
import { AnswerViewDto, GameViewDto } from '../../dto/game.view.dto';
import { Answer } from '../../domain/answer.entity';
import { GameStatus } from '../../../../enums/game-status.enum';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exceptions';
import { StatsViewDto } from '../../dto/stats.view.dto';
import { Player } from '../../domain/player.entity';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { Question } from '../../domain/question.entity';
import { GetTopQueryParams } from '../../input-dto/get-top-query-params.input-dto';
import { TopViewDto } from '../../dto/top.view.dto';

@Injectable()
export class GamesQueryRepository {
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
    @InjectRepository(Player)
    private readonly playersRepository: Repository<Player>,
  ) {}

  async getTop(query: GetTopQueryParams) {
    const top = await this.playersRepository
      .createQueryBuilder('pl')
      .select('pl.user', 'u_id')
      .addSelect('u.login', 'u_login')
      .addSelect((qb) => {
        return qb
          .select('sum(p.score)')
          .from(Player, 'p')
          .where(`p.userId = pl.user`);
      }, 'sumScore')
      .addSelect((qb) => {
        return (
          qb
            .select(
              'case when avg("p"."score") % 1 = 0 then cast(avg("p"."score") as integer) else round(avg("p"."score"), 2) end',
            )
            // .select('round(avg("p"."score"), 2)')
            .from(Player, 'p')
            .where(`p.userId = pl.user`)
        );
      }, 'avgScores')
      .addSelect((qb) => {
        return qb
          .select('count(*)')
          .from(Game, 'g')
          .leftJoin('g.playerOne', 'po')
          .leftJoin('g.playerTwo', 'pt')
          .where(`po.userId = pl.user or pt.userId = pl.user`);
      }, 'gamesCount')
      .addSelect((qb) => {
        return qb
          .select('count(*)')
          .from(Game, 'g')
          .leftJoin('g.playerOne', 'po')
          .leftJoin('g.playerTwo', 'pt')
          .where(`(po.userId = pl.user or pt.userId = pl.user)`)
          .andWhere(
            `(po.userId = pl.user and po.score > pt.score or pt.userId = pl.user and pt.score > po.score)`,
          );
      }, 'winsCount')
      .addSelect((qb) => {
        return qb
          .select('count(*)')
          .from(Game, 'g')
          .leftJoin('g.playerOne', 'po')
          .leftJoin('g.playerTwo', 'pt')
          .where(`(po.userId = pl.user or pt.userId = pl.user)`)
          .andWhere(
            `(po.userId = pl.user and po.score < pt.score or pt.userId = pl.user and pt.score < po.score)`,
          );
      }, 'lossesCount')
      .addSelect((qb) => {
        return qb
          .select('count(*)')
          .from(Game, 'g')
          .leftJoin('g.playerOne', 'po')
          .leftJoin('g.playerTwo', 'pt')
          .where(`(po.userId = pl.user or pt.userId = pl.user)`)
          .andWhere(
            `(po.userId = pl.user and po.score = pt.score or pt.userId = pl.user and pt.score = po.score)`,
          );
      }, 'drawsCount')
      .leftJoin('pl.user', 'u')
      .groupBy('u_id, u_login');

    const topResult = await this.addOrderByAndGet(top, query);

    const totalCount = await this.playersRepository
      .createQueryBuilder('pl')
      .select('count(distinct "userId")', 'pl_count')
      .getRawOne();

    return PaginatedViewDto.mapToView({
      page: query.pageNumber,
      size: query.pageSize,
      totalCount: Number(totalCount.pl_count),
      items: await this.topMapping(topResult),
    });
  }

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
  async getStatistic(userId: string): Promise<StatsViewDto> {
    const stats = await this.playersRepository
      .createQueryBuilder('p')
      .select('p.id', 'p_id')
      .addSelect('p.user', 'u_id')
      .addSelect((qb) => {
        return qb
          .select('sum(p.score)')
          .from(Player, 'p')
          .where(`(p.userId = :userId)`, {
            userId,
          });
      }, 'scores_sum')
      .addSelect((qb) => {
        return (
          qb
            .select(
              'case when avg("p"."score") % 1 = 0 then cast(avg("p"."score") as integer) else round(avg("p"."score"), 2) end',
            )
            // .select('round(avg("p"."score"), 2)')
            .from(Player, 'p')
            .where(`(p.userId = :userId)`, {
              userId: userId,
            })
        );
      }, 'scores_avg')
      .addSelect((qb) => {
        return qb
          .select('count(*)')
          .from(Game, 'g')
          .leftJoin('g.playerOne', 'po')
          .leftJoin('g.playerTwo', 'pt')
          .where(`(po.userId = :userId or pt.userId = :userId)`, {
            userId: userId,
          });
      }, 'total_games')
      .addSelect((qb) => {
        return qb
          .select('count(*)')
          .from(Game, 'g')
          .leftJoin('g.playerOne', 'po')
          .leftJoin('g.playerTwo', 'pt')
          .where(`(po.userId = :userId or pt.userId = :userId)`, {
            userId: userId,
          })
          .andWhere(
            `(po.userId = :userId and po.score > pt.score or pt.userId = :userId and pt.score > po.score)`,
            {
              userId: userId,
            },
          );
      }, 'wins')
      .addSelect((qb) => {
        return qb
          .select('count(*)')
          .from(Game, 'g')
          .leftJoin('g.playerOne', 'po')
          .leftJoin('g.playerTwo', 'pt')
          .where(`(po.userId = :userId or pt.userId = :userId)`, {
            userId: userId,
          })
          .andWhere(
            `(po.userId = :userId and po.score < pt.score or pt.userId = :userId and pt.score < po.score)`,
            {
              userId: userId,
            },
          );
      }, 'losses')
      .addSelect((qb) => {
        return qb
          .select('count(*)')
          .from(Game, 'g')
          .leftJoin('g.playerOne', 'po')
          .leftJoin('g.playerTwo', 'pt')
          .where(`(po.userId = :userId or pt.userId = :userId)`, {
            userId: userId,
          })
          .andWhere(
            `(po.userId = :userId and po.score = pt.score or pt.userId = :userId and pt.score = po.score)`,
            {
              userId: userId,
            },
          );
      }, 'draws')
      .leftJoin('p.user', 'u')
      .where(`u.id = :userId`, {
        userId: userId,
      })
      .limit(1)
      .getRawMany();

    const mappedStats = await this.statsMapping(stats);
    return mappedStats[0];
  }
  async findMyGames(
    userId: string,
    query: any,
  ): Promise<PaginatedViewDto<GameViewDto[]>> {
    /*Promise<PaginatedViewDto<GameViewDto[]>>*/
    const games = await this.gamesRepository
      // Creating game object
      .createQueryBuilder('game')

      // Adding player 01
      .addSelect(
        (qb) =>
          // Aggregating results
          qb
            .select(
              `jsonb_agg(json_build_object('po_score', pos, 'po_user_id', pouid, 'po_user_login', poul, 'po_answers', p_one_answers)
                       )`,
            )
            .from((qb) => {
              // Getting player 01 info
              return (
                qb
                  .select(`pou.id`, 'pouid')
                  .addSelect(`pou.login`, 'poul')
                  .addSelect(`po.score`, 'pos')

                  // Getting player 01 answers
                  .addSelect(
                    (qb) =>
                      qb
                        .select(
                          `jsonb_agg(json_build_object('q_id', poaqid, 'a_status', poaas, 'a_added_at', to_char(
            poaaa::timestamp at time zone 'UTC-6',
            'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'))
                         )`,
                        )
                        .from((qb) => {
                          return qb
                            .select(`a.questionId`, 'poaqid')
                            .addSelect(`a.playerId`, 'poapid')
                            .addSelect(`a.answerStatus`, 'poaas')
                            .addSelect(`a.addedAt`, 'poaaa')
                            .from(Answer, 'a')
                            .where('a.playerId = po.id')
                            .orderBy('poaaa');
                        }, 'poa_agg'),

                    'p_one_answers',
                  )
                  .from(Game, 'g')

                  // Joining player 01 info tables
                  .leftJoin('g.playerOne', 'po')
                  .leftJoin('po.user', 'pou')
                  .leftJoin('po.answers', 'poa')
                  .leftJoin('poa.question', 'poaq')
                  .where('g.id = game.id')
                  .limit(1)
              );
            }, 'p_one_agg'),

        'p_one',
      )

      // Adding player 02
      .addSelect(
        (qb) =>
          // Aggregating results
          qb
            .select(
              `jsonb_agg(json_build_object('pt_score', pts, 'pt_user_id', ptuid, 'pt_user_login', ptul, 'pt_answers', p_two_answers)
                       )`,
            )
            // Getting player 02 info
            .from((qb) => {
              return (
                qb
                  .select(`ptu.id`, 'ptuid')
                  .addSelect(`ptu.login`, 'ptul')
                  .addSelect(`pt.score`, 'pts')

                  // Getting player 02 answers
                  .addSelect(
                    (qb) =>
                      qb
                        .select(
                          `jsonb_agg(json_build_object('q_id', ptaqid, 'a_status', ptaas, 'a_added_at', to_char(
            ptaaa::timestamp at time zone 'UTC-6',
            'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'))
                         )`,
                        )
                        .from((qb) => {
                          return qb
                            .select(`a.questionId`, 'ptaqid')
                            .addSelect(`a.playerId`, 'ptapid')
                            .addSelect(`a.answerStatus`, 'ptaas')
                            .addSelect(`a.addedAt`, 'ptaaa')
                            .from(Answer, 'a')
                            .where('a.playerId = pt.id')
                            .orderBy('ptaaa');
                        }, 'pta_agg'),

                    'p_two_answers',
                  )
                  .from(Game, 'g')

                  // Joining player 02 info tables
                  .leftJoin('g.playerTwo', 'pt')
                  .leftJoin('pt.user', 'ptu')
                  .leftJoin('pt.answers', 'pta')
                  .leftJoin('pta.question', 'ptaq')
                  .where('g.id = game.id')
                  .limit(1)
              );
            }, 'p_two_agg'),

        'p_two',
      )

      // Adding game questions
      .addSelect(
        (qb) =>
          qb
            .select(
              `jsonb_agg(json_build_object('q_id', qid, 'q_body', qbody)
                       )`,
            )
            .from((qb) => {
              return qb
                .select(`q.id`, 'qid')
                .addSelect(`q.body`, 'qbody')
                .addSelect(`q.createdAt`, 'qca')
                .from(Question, 'q')
                .leftJoin('q.games', 'qg')
                .where('qg.id = game.id')
                .orderBy('qca', 'DESC');
            }, 'q_agg'),

        'questions',
      )

      // Joining players
      .leftJoin('game.playerOne', 'po')
      .leftJoin('po.user', 'pou')
      .leftJoin('game.playerTwo', 'pt')
      .leftJoin('pt.user', 'ptu')
      .where('pou.id = :userId or ptu.id = :userId', {
        userId: userId,
      })

      // Sorting
      .orderBy(
        `game.${query.sortBy}`,
        query.sortDirection === 'desc' ? 'DESC' : 'ASC',
      )
      .addOrderBy(`game.pairCreatedDate`, 'DESC')

      // Pagination
      .limit(query.pageSize)
      .offset((query.pageNumber - 1) * query.pageSize)

      // Getting result
      .getRawMany();
    const totalCount = await this.gamesRepository
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
      .where('(pou.id = :userId or ptu.id = :userId)', { userId: userId })
      .getCount();
    return PaginatedViewDto.mapToView({
      page: query.pageNumber,
      size: query.pageSize,
      totalCount: totalCount,
      items: await this.gamesRawMapping(games),
    });
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
  private async statsMapping(array: any[]): Promise<StatsViewDto[]> {
    return array.map((a) => {
      return {
        sumScore: +a.scores_sum,
        avgScores: +a.scores_avg,
        gamesCount: +a.total_games,
        winsCount: +a.wins,
        lossesCount: +a.losses,
        drawsCount: +a.draws,
      };
    });
  }
  private async addOrderByAndGet(
    builder: SelectQueryBuilder<Player>,
    query: GetTopQueryParams,
  ): Promise<any[]> {
    if (query.sort.length === 1) {
      return builder
        .orderBy(`"${query.sort[0][0]}"`, query.sort[0][1])
        .limit(query.pageSize)
        .offset((query.pageNumber - 1) * query.pageSize)
        .getRawMany();
    }

    if (query.sort.length === 2) {
      return builder
        .orderBy(`"${query.sort[0][0]}"`, query.sort[0][1])
        .addOrderBy(`"${query.sort[1][0]}"`, query.sort[1][1])
        .limit(query.pageSize)
        .offset((query.pageNumber - 1) * query.pageSize)
        .getRawMany();
    }

    if (query.sort.length === 3) {
      return builder
        .orderBy(`"${query.sort[0][0]}"`, query.sort[0][1])
        .addOrderBy(`"${query.sort[1][0]}"`, query.sort[1][1])
        .addOrderBy(`"${query.sort[2][0]}"`, query.sort[2][1])
        .limit(query.pageSize)
        .offset((query.pageNumber - 1) * query.pageSize)
        .getRawMany();
    }

    if (query.sort.length === 4) {
      return builder
        .orderBy(`"${query.sort[0][0]}"`, query.sort[0][1])
        .addOrderBy(`"${query.sort[1][0]}"`, query.sort[1][1])
        .addOrderBy(`"${query.sort[2][0]}"`, query.sort[2][1])
        .addOrderBy(`"${query.sort[3][0]}"`, query.sort[3][1])
        .limit(query.pageSize)
        .offset((query.pageNumber - 1) * query.pageSize)
        .getRawMany();
    }

    if (query.sort.length === 5) {
      return builder
        .orderBy(`"${query.sort[0][0]}"`, query.sort[0][1])
        .addOrderBy(`"${query.sort[1][0]}"`, query.sort[1][1])
        .addOrderBy(`"${query.sort[2][0]}"`, query.sort[2][1])
        .addOrderBy(`"${query.sort[3][0]}"`, query.sort[3][1])
        .addOrderBy(`"${query.sort[4][0]}"`, query.sort[4][1])
        .limit(query.pageSize)
        .offset((query.pageNumber - 1) * query.pageSize)
        .getRawMany();
    }

    if (query.sort.length === 6) {
      return builder
        .orderBy(`"${query.sort[0][0]}"`, query.sort[0][1])
        .addOrderBy(`"${query.sort[1][0]}"`, query.sort[1][1])
        .addOrderBy(`"${query.sort[2][0]}"`, query.sort[2][1])
        .addOrderBy(`"${query.sort[3][0]}"`, query.sort[3][1])
        .addOrderBy(`"${query.sort[4][0]}"`, query.sort[4][1])
        .addOrderBy(`"${query.sort[5][0]}"`, query.sort[5][1])
        .limit(query.pageSize)
        .offset((query.pageNumber - 1) * query.pageSize)
        .getRawMany();
    }

    return builder
      .orderBy(`"avgScores"`, 'DESC')
      .addOrderBy(`"sumScore"`, 'DESC')
      .limit(query.pageSize)
      .offset((query.pageNumber - 1) * query.pageSize)
      .getRawMany();
  }
  private async gamesRawMapping(games: any[]): Promise<GameViewDto[]> {
    let secondPlayerProgress: any = null;
    let questions = null;
    let playerOneAnswers = [];
    let playerTwoAnswers = [];

    return games.map((g) => {
      let playersCount = 1;
      if (g.p_two) {
        playersCount = 2;
      }

      if (g.p_one[0].po_answers) {
        playerOneAnswers = g.p_one[0].po_answers.map((a) => {
          return {
            addedAt: a.a_added_at,
            answerStatus: a.a_status,
            questionId: a.q_id.toString(),
          };
        });
      }

      if (playersCount === 2) {
        if (g.p_two[0].pt_answers) {
          playerTwoAnswers = g.p_two[0].pt_answers.map((a) => {
            return {
              addedAt: a.a_added_at,
              answerStatus: a.a_status,
              questionId: a.q_id.toString(),
            };
          });
        }
        secondPlayerProgress = {
          answers: playerTwoAnswers,
          player: {
            id: g.p_two[0].pt_user_id.toString(),
            login: g.p_two[0].pt_user_login,
          },
          score: g.p_two[0].pt_score,
        };
        questions = g.questions.map((q) => {
          return {
            id: q.q_id.toString(),
            body: q.q_body,
          };
        });
      }

      return {
        id: g.game_id.toString(),
        firstPlayerProgress: {
          answers: playerOneAnswers,
          player: {
            id: g.p_one[0].po_user_id.toString(),
            login: g.p_one[0].po_user_login,
          },
          score: g.p_one[0].po_score,
        },
        secondPlayerProgress: secondPlayerProgress,
        questions: questions,
        status: g.game_status,
        pairCreatedDate: g.game_pair_created_date,
        startGameDate: g.game_start_game_date,
        finishGameDate: g.game_finish_game_date,
      };
    });
  }
  private async topMapping(array: any[]): Promise<TopViewDto[]> {
    return array.map((a) => {
      return {
        sumScore: +a.sumScore,
        avgScores: +a.avgScores,
        gamesCount: +a.gamesCount,
        winsCount: +a.winsCount,
        lossesCount: +a.lossesCount,
        drawsCount: +a.drawsCount,
        player: {
          id: a.u_id,
          login: a.u_login,
        },
      };
    });
  }
}
