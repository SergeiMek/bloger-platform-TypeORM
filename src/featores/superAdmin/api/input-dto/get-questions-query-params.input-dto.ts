import { BaseSortablePaginationParams } from '../../../../core/dto/base.query-params.input-dto';
import { QuestionsSortBy } from './questions-sort-by';
import { Transform } from 'class-transformer';
import { Question } from '../../../quiz-game/domain/question.entity';
import { IsOptional } from 'class-validator';
import { PublishedStatus } from '../../../enums/published-status.enum';

export class GetQuestionsQueryParams extends BaseSortablePaginationParams<QuestionsSortBy> {
  @Transform(({ value }) => {
    if (Question.checkSortingField(value)) {
      return value;
    } else {
      return 'createdAt';
    }
  })
  sortBy = QuestionsSortBy.CreatedAt;
  @IsOptional()
  @Transform(({ value }) => {
    debugger;
    if (value === PublishedStatus.Published) {
      return true;
    }
    if (value === PublishedStatus.NotPublished) {
      return false;
    }
  })
  publishedStatus: boolean | string;
  @IsOptional()
  bodySearchTerm: string;
}
