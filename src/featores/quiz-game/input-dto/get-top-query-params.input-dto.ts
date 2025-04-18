import { BaseSortablePaginationParams } from '../../../core/dto/base.query-params.input-dto';
import { MyGameSortBy } from './myGame-sort-by';
import { Transform } from 'class-transformer';
import { QuizTop } from '../../enums/quiz-top.enum';
import { SortDirection } from '../../../enums/sort-direction.enum';

export class GetTopQueryParams extends BaseSortablePaginationParams<MyGameSortBy> {
  sortBy = MyGameSortBy.PairCreateData;
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      value = [value.split(' ')];
      debugger;
      if (
        Object.values(QuizTop).includes(value[0][0]) &&
        Object.values(SortDirection).includes(value[0][1].toUpperCase())
      ) {
        debugger;
        value[0][1] = value[0][1].toUpperCase();
        return value;
      }

      return [
        [QuizTop.AverageScores, 'DESC'],
        [QuizTop.SumScore, 'DESC'],
      ];
    } else {
      const mappedParams = value.map((el) => {
        el = el.split(' ');
        el[1] = el[1].toUpperCase();
        return el;
      });
      const isValid = (el) =>
        Object.values(QuizTop).includes(el[0]) &&
        Object.values(SortDirection).includes(el[1].toUpperCase());
      const validationCheck = mappedParams.every(isValid);
      if (validationCheck) {
        return mappedParams;
      }

      return [
        [QuizTop.AverageScores, 'DESC'],
        [QuizTop.SumScore, 'DESC'],
      ];
    }
  })
  sort: Array<[string, 'ASC' | 'DESC']> = [
    [QuizTop.AverageScores, 'DESC'],
    [QuizTop.SumScore, 'DESC'],
  ];
}
