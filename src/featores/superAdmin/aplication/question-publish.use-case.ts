import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { QuestionsRepository } from '../../quiz-game/infrastructure/questions.repository';
import { QuestionPublishInputDto } from '../dto/quizInoutDto';
import { DataSourceRepository } from '../../../core/repositories/data-source.repository';
import { Question } from '../../quiz-game/domain/question.entity';
import { NotFoundDomainException } from '../../../core/exceptions/domain-exceptions';

export class QuestionPublishCommand {
  constructor(
    public questionPublishInputDto: QuestionPublishInputDto,
    public questionId: string,
  ) {}
}

@CommandHandler(QuestionPublishCommand)
export class QuestionPublishUseCase
  implements ICommandHandler<QuestionPublishCommand>
{
  constructor(
    private readonly questionsRepository: QuestionsRepository,
    private readonly dataSourceRepository: DataSourceRepository,
  ) {}

  async execute(command: QuestionPublishCommand): Promise<Question | null> {
    const question = await this.questionsRepository.findQuestion(
      command.questionId,
    );

    if (!question) {
      throw NotFoundDomainException.create('question not found');
    }

    question.published = command.questionPublishInputDto.published;
    question.updatedAt = new Date();
    await this.dataSourceRepository.save(question);
    return question;
  }
}
