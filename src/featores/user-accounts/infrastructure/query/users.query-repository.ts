import { Injectable, NotFoundException } from '@nestjs/common';
import { UserViewDto } from '../../api/view-dto/users.view-dto';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';

import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async getUserById(id: string): Promise<UserViewDto> {
    const user = await this.dataSource.query(
      `SELECT * FROM public."Users"
             WHERE "id" = $1`,
      [id],
    );
    if (user.length === 0) {
      throw new NotFoundException('user not found');
    }
    return UserViewDto.mapToView(user[0]);
  }
  async getAll(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const filterConditions: any = [];
    if (query.searchEmailTerm) {
      filterConditions.push(`"email" ILIKE '%${query.searchEmailTerm}'`);
    }
    if (query.searchLoginTerm) {
      filterConditions.push(`"login" ILIKE '%${query.searchLoginTerm}%'`);
    }

    const whereClause =
      filterConditions.length > 0
        ? `WHERE ${filterConditions.join(' OR ')}`
        : '';
    const sortDirection = query.sortDirection === 'desc' ? 'DESC' : 'ASC';
    let sortBy = '';
    if (
      query.sortBy === 'createdAt' ||
      query.sortBy === 'login' ||
      query.sortBy === 'email' ||
      query.sortBy === 'id'
    ) {
      sortBy = query.sortBy;
    } else {
      sortBy = 'createdAt';
    }
    const offset = query.calculateSkip();
    const users = await this.dataSource.query(`
      SELECT * FROM public."Users"
      ${whereClause}
       ORDER BY "${sortBy}" ${sortDirection}
  LIMIT ${query.pageSize} OFFSET ${offset}
    `);
    const totalCountArray = await this.dataSource.query(
      `
      SELECT COUNT(*) FROM public."Users"
      ${whereClause}
    `,
    );
    const totalCount = parseInt(totalCountArray[0].count, 10);
    const items = users.map(UserViewDto.mapToView);
    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
