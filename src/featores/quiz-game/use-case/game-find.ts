import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../user-accounts/infrastructure/users-repo';
import {
  ForbiddenDomainException,
  NotFoundDomainException,
} from '../../../core/exceptions/domain-exceptions';
import { GamesQueryRepository } from '../infrastructure/query/gamesQuery.repository';
import { GameViewDto } from '../dto/game.view.dto';

export class GameFindQuery {
  constructor(
    public userId: string,
    public gameId: string,
  ) {}
}

@CommandHandler(GameFindQuery)
export class GameFindUseCase implements ICommandHandler<GameFindQuery> {
  constructor(
    protected readonly usersRepository: UsersRepo,
    protected readonly gamesQueryRepository: GamesQueryRepository,
  ) {}
  async execute(command: GameFindQuery): Promise<GameViewDto | null> {
    const user = await this.usersRepository.findById(command.userId);
    if (!user) {
      throw NotFoundDomainException.create('user not found');
    }
    const currentGame = await this.gamesQueryRepository.findGameById(
      command.gameId,
    );
    if (!currentGame) {
      throw NotFoundDomainException.create('game not found');
    }
    const playerOneProgress = currentGame.firstPlayerProgress;
    const playerTwoProgress = currentGame.secondPlayerProgress;

    if (playerOneProgress && !playerTwoProgress) {
      if (playerOneProgress.player.id !== command.userId) {
        throw ForbiddenDomainException.create('game not found ');
      }
    }
    if (
      playerOneProgress.player.id !== command.userId &&
      playerTwoProgress?.player.id !== command.userId
    ) {
      throw ForbiddenDomainException.create('game not found ');
    }
    return currentGame;
  }
}
