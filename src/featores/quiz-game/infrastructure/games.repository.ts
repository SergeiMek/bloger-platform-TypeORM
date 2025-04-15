import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from '../domain/game.entity';
import { Repository } from 'typeorm';
import { GameStatus } from '../../../enums/game-status.enum';

@Injectable()
export class GamesRepository {
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
  ) {}

  async findGameForConnection(userId: string): Promise<Game | null> {
    try {
      const result = await this.gamesRepository
        .createQueryBuilder('g')
        .leftJoinAndSelect('g.playerOne', 'po')
        .leftJoinAndSelect('g.playerTwo', 'pt')
        .leftJoinAndSelect('po.user', 'pou')
        .leftJoinAndSelect('pt.user', 'ptu')
        .where(`g.status = :pending or g.status = :active`, {
          pending: GameStatus.PendingSecondPlayer,
          active: GameStatus.Active,
        })
        .andWhere(`(pou.id = :userId or ptu.id = :userId)`, {
          userId: userId,
        })
        .getOne();
      return result;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException('error found game');
    }
  }
  async findGameForAnswer(userId: string): Promise<Game | null> {
    return await this.gamesRepository
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
      .where('game.status = :active', {
        active: GameStatus.Active,
      })
      .andWhere('(pou.id = :userId or ptu.id = :userId)', { userId: userId })
      .orderBy('gq.created_at', 'DESC')
      .addOrderBy('poa.added_at')
      .addOrderBy('pta.added_at')
      .getOne();
  }
}
