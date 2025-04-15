import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../user-accounts/infrastructure/users-repo';
import {
  ForbiddenDomainException,
  NotFoundDomainException,
} from '../../../core/exceptions/domain-exceptions';
import { GamesRepository } from '../infrastructure/games.repository';
import { Player } from '../domain/player.entity';
import { Game } from '../domain/game.entity';
import { GameStatus } from '../../../enums/game-status.enum';
import { QuestionsRepository } from '../infrastructure/questions.repository';
import { DataSourceRepository } from '../../../core/repositories/data-source.repository';

export class UserConnectCommand {
  constructor(public userId: string) {}
}

@CommandHandler(UserConnectCommand)
export class UserConnect implements ICommandHandler<UserConnectCommand> {
  constructor(
    protected readonly usersRepository: UsersRepo,
    protected readonly gamesRepository: GamesRepository,
    protected readonly questionsRepository: QuestionsRepository,
    private readonly dataSourceRepository: DataSourceRepository,
  ) {}
  async execute(command: UserConnectCommand) {
    const user = await this.usersRepository.findById(command.userId);
    if (!user) {
      throw NotFoundDomainException.create('user not found');
    }
    let game = await this.gamesRepository.findGameForConnection(command.userId);
    const player = new Player();
    player.user = user;
    player.score = 0;
    if (!game) {
      game = new Game();
      game.playerOne = player;
      game.status = GameStatus.PendingSecondPlayer;
      game.pairCreatedDate = new Date();
    } else {
      if (
        (game.status === GameStatus.PendingSecondPlayer &&
          game.playerOne.user.id === command.userId) ||
        game.status === GameStatus.Active
      ) {
        throw ForbiddenDomainException.create(
          'the player has already started game ',
        );
      }
      game.playerTwo = player;
      game.status = GameStatus.Active;
      game.startGameDate = new Date();
      game.questions = await this.questionsRepository.findRandomQuestions();
    }

    await this.dataSourceRepository.save(player);
    await this.dataSourceRepository.save(game);
    return game.id;
  }
}
