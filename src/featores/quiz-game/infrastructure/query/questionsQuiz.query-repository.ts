import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../../domain/question.entity';
import { QuestionViewDto } from '../../dto/viewQuizDto';
import { GetQuestionsQueryParams } from '../../../superAdmin/api/input-dto/get-questions-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';

@Injectable()
export class QuestionsQuizQueryRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
  ) {}
  async findQuestion(questionsId: string): Promise<QuestionViewDto> {
    debugger;
    const questions = await this.questionsRepository
      .createQueryBuilder('q')
      .where(`q.id = :questionsId`, {
        questionsId,
      })
      .getMany();
    const mappedQuestions = await this.questionsMapping(questions);
    return mappedQuestions[0];
  }
  async getAllQuestions(query: GetQuestionsQueryParams) {
    const sortDirection = query.sortDirection === 'desc' ? 'DESC' : 'ASC';
    const questions = await this.questionsRepository
      .createQueryBuilder('q')
      .where(
        `${
          query.publishedStatus === true || query.publishedStatus === false
            ? 'q.published = :publishedStatus'
            : 'q.published is not null'
        }`,
        { publishedStatus: query.publishedStatus },
      )
      .andWhere(
        `${
          query.bodySearchTerm ? `q.body ilike :bodyTerm` : 'q.body is not null'
        }`,
        {
          bodyTerm: `%${query.bodySearchTerm}%`,
        },
      )
      .orderBy(`q.${query.sortBy}`, sortDirection)
      .skip(query.calculateSkip())
      .take(query.pageSize)
      .getMany();

    const totalCount = await this.questionsRepository
      .createQueryBuilder('q')
      .where(
        `${
          query.publishedStatus === true || query.publishedStatus === false
            ? 'q.published = :publishedStatus'
            : 'q.published is not null'
        }`,
        { publishedStatus: query.publishedStatus },
      )
      .andWhere(
        `${
          query.bodySearchTerm ? `q.body ilike :bodyTerm` : 'q.body is not null'
        }`,
        {
          bodyTerm: `%${query.bodySearchTerm}%`,
        },
      )
      .getCount();

    return PaginatedViewDto.mapToView({
      page: query.pageNumber,
      size: query.pageSize,
      totalCount: totalCount,
      items: await this.questionsMapping(questions),
    });
  }
  private async questionsMapping(
    array: Question[],
  ): Promise<QuestionViewDto[]> {
    return array.map((q) => {
      return {
        id: q.id.toString(),
        body: q.body,
        correctAnswers: q.correctAnswers,
        published: q.published,
        createdAt: q.createdAt,
        updatedAt: q.updatedAt,
      };
    });
  }
}
