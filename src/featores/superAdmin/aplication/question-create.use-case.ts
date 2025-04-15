import { QuestionInputDto } from '../dto/quizInoutDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSourceRepository } from '../../../core/repositories/data-source.repository';
import { Question } from '../../quiz-game/domain/question.entity';

export class QuestionCreateCommand {
  constructor(public questionInputDto: QuestionInputDto) {}
}

@CommandHandler(QuestionCreateCommand)
export class QuestionCreateUseCase
  implements ICommandHandler<QuestionCreateCommand>
{
  constructor(private readonly dataSourceRepository: DataSourceRepository) {}

  async execute(command: QuestionCreateCommand): Promise<string> {
    const question = new Question();
    question.body = command.questionInputDto.body;
    question.correctAnswers = command.questionInputDto.correctAnswers;
    question.published = false;
    question.createdAt = new Date();
    const savedQuestion = await this.dataSourceRepository.save(question);
    return savedQuestion.id;
  }
}
