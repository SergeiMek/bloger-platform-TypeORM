import { BaseSortablePaginationParams } from '../../../core/dto/base.query-params.input-dto';
import { MyGameSortBy } from './myGame-sort-by';

export class GetMyGamesQueryParams extends BaseSortablePaginationParams<MyGameSortBy> {
  sortBy = MyGameSortBy.PairCreateData;
}
