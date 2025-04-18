import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GamesRepository } from '../infrastructure/games.repository';
import { DataSourceRepository } from '../../../core/repositories/data-source.repository';
import { GameStatus } from '../../../enums/game-status.enum';
import { Interval } from '@nestjs/schedule';

export class GameFinishCommand {}

@CommandHandler(GameFinishCommand)
export class GameFinishUseCase implements ICommandHandler<GameFinishCommand> {
  constructor(
    private readonly gamesRepository: GamesRepository,
    private readonly dataSourceRepository: DataSourceRepository,
  ) {}
  @Interval(1000)
  async execute(command: GameFinishCommand): Promise<any> {
    const games = await this.gamesRepository.findGamesToFinish();
    for (const game of games!) {
      let fastPlayer = game.playerOne;
      if (game.playerTwo.answers.length === 5) {
        fastPlayer = game.playerTwo;
      }

      if (fastPlayer.score !== 0) {
        fastPlayer.score += 1;
      }

      await this.dataSourceRepository.save(fastPlayer);

      game.status = GameStatus.Finished;
      game.finishGameDate = new Date();
      game.finishingExpirationDate = null;
      await this.dataSourceRepository.save(game);
    }
  }
}
