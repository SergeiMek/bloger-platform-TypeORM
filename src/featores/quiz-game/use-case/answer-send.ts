import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../user-accounts/infrastructure/users-repo';
import {
  ForbiddenDomainException,
  NotFoundDomainException,
} from '../../../core/exceptions/domain-exceptions';
import { GamesRepository } from '../infrastructure/games.repository';
import { QuestionsRepository } from '../infrastructure/questions.repository';
import { DataSourceRepository } from '../../../core/repositories/data-source.repository';
import { AnswerInputDto } from '../dto/inputDto';
import { AnswerStatus } from '../../enums/answer-status.enum';
import { Answer } from '../domain/answer.entity';
import { add } from 'date-fns';
import { GameStatus } from '../../../enums/game-status.enum';

export class AnswerSendCommand {
  constructor(
    public userId: string,
    public answerInputDto: AnswerInputDto,
  ) {}
}

@CommandHandler(AnswerSendCommand)
export class AnswerSendUseCase implements ICommandHandler<AnswerSendCommand> {
  constructor(
    protected readonly usersRepository: UsersRepo,
    protected readonly gamesRepository: GamesRepository,
    protected readonly questionsRepository: QuestionsRepository,
    private readonly dataSourceRepository: DataSourceRepository,
  ) {}

  async execute(command: AnswerSendCommand): Promise<any> {
    const user = await this.usersRepository.findById(command.userId);
    if (!user) {
      throw NotFoundDomainException.create('user not found');
    }
    const currentGame = await this.gamesRepository.findGameForAnswer(
      command.userId,
    );
    if (!currentGame) {
      throw ForbiddenDomainException.create('game not found ');
    }

    let currentPlayer = currentGame.playerOne;
    if (
      currentGame.playerTwo &&
      command.userId === currentGame.playerTwo.user.id
    ) {
      currentPlayer = currentGame.playerTwo;
    }
    const questionIndex = currentPlayer.answers.length;
    if (questionIndex >= 5) {
      throw ForbiddenDomainException.create();
    }
    const currentQuestion = currentGame.questions[questionIndex];
    let answerStatus = AnswerStatus.Incorrect;
    const answerCheck = currentQuestion.correctAnswers.includes(
      command.answerInputDto.answer,
    );

    if (answerCheck) {
      answerStatus = AnswerStatus.Correct;
      currentPlayer.score += 1;
      await this.dataSourceRepository.save(currentPlayer);
    }

    const answer = new Answer();
    answer.player = currentPlayer;
    answer.question = currentQuestion;
    answer.answerStatus = answerStatus;
    answer.addedAt = new Date();
    await this.dataSourceRepository.save(answer);

    const playerOneAnswersCount = currentGame.playerOne.answers.length;
    const playerTwoAnswersCount = currentGame.playerTwo.answers.length;

    if (
      (playerOneAnswersCount === 4 &&
        currentGame.playerOne.id === currentPlayer.id) ||
      (playerTwoAnswersCount === 4 &&
        currentGame.playerTwo.id === currentPlayer.id)
    ) {
      currentGame.finishingExpirationDate = add(new Date(), {
        seconds: 9,
      });
      await this.dataSourceRepository.save(currentGame);
    }

    if (
      (playerOneAnswersCount === 5 && playerTwoAnswersCount === 4) ||
      (playerOneAnswersCount === 4 && playerTwoAnswersCount === 5)
    ) {
      let fastPlayer = currentGame.playerOne;
      if (playerTwoAnswersCount === 5) {
        fastPlayer = currentGame.playerTwo;
      }

      if (fastPlayer.score !== 0) {
        fastPlayer.score += 1;
      }
      await this.dataSourceRepository.save(fastPlayer);

      currentGame.status = GameStatus.Finished;
      currentGame.finishGameDate = new Date();
      currentGame.finishingExpirationDate = null;
      await this.dataSourceRepository.save(currentGame);
    }
    return currentGame.id;
  }
}
