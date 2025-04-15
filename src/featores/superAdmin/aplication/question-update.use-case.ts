import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { QuestionsRepository } from '../../quiz-game/infrastructure/questions.repository';
import { QuestionInputDto } from '../dto/quizInoutDto';
import { DataSourceRepository } from '../../../core/repositories/data-source.repository';
import { Question } from '../../quiz-game/domain/question.entity';
import { NotFoundDomainException } from '../../../core/exceptions/domain-exceptions';

export class QuestionUpdateCommand {
  constructor(
    public questionInputDto: QuestionInputDto,
    public questionId: string,
  ) {}
}

@CommandHandler(QuestionUpdateCommand)
export class QuestionUpdateUseCase
  implements ICommandHandler<QuestionUpdateCommand>
{
  constructor(
    private readonly questionsRepository: QuestionsRepository,
    private readonly dataSourceRepository: DataSourceRepository,
  ) {}

  async execute(command: QuestionUpdateCommand): Promise<Question | null> {
    const question = await this.questionsRepository.findQuestion(
      command.questionId,
    );

    if (!question) {
      throw NotFoundDomainException.create('question not found');
    }

    question.body = command.questionInputDto.body;
    question.correctAnswers = command.questionInputDto.correctAnswers;
    question.updatedAt = new Date();
    await this.dataSourceRepository.save(question);
    return question;
  }
}
