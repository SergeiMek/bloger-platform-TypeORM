import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { QuestionsRepository } from '../../quiz-game/infrastructure/questions.repository';
import { NotFoundDomainException } from '../../../core/exceptions/domain-exceptions';

export class QuestionDeleteCommand {
  constructor(public questionId: string) {}
}
@CommandHandler(QuestionDeleteCommand)
export class QuestionDeleteUseCase
  implements ICommandHandler<QuestionDeleteCommand>
{
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  async execute(command: QuestionDeleteCommand): Promise<void> {
    const question = await this.questionsRepository.findQuestion(
      command.questionId,
    );
    if (!question) {
      throw NotFoundDomainException.create('question not found');
    }
    await this.questionsRepository.deleteQuestion(command.questionId);
  }
}
