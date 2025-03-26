import { Injectable, NotFoundException } from '@nestjs/common';
import { UserViewDto } from '../../api/view-dto/users.view-dto';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';

import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import { UserEntity } from '../../domain/user.entity';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(UserEntity)
    private readonly usersQueryRepository: Repository<UserEntity>,
  ) {}

  async getUserById(id: string): Promise<UserViewDto> {
    /*const user = await this.dataSource.query(
      `SELECT * FROM public."users"
             WHERE "id" = $1`,
      [id],
    );
    if (user.length === 0) {
      throw new NotFoundException('user not found');
    }*/
    const user = await this.usersQueryRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return UserViewDto.mapToView(user);
  }

  async getAll(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const whereConditions: any[] = [];
    if (query.searchEmailTerm) {
      whereConditions.push({ email: ILike(`%${query.searchEmailTerm}%`) });
    }
    if (query.searchLoginTerm) {
      whereConditions.push({ login: ILike(`%${query.searchLoginTerm}%`) });
    }

    const sortDirection = query.sortDirection === 'desc' ? 'DESC' : 'ASC';
    const sortBy = ['createdAt', 'login', 'email', 'id'].includes(query.sortBy)
      ? query.sortBy
      : 'createdAt';

    const offset = query.calculateSkip();
    const pageSize = query.pageSize;
    debugger;
    const [users, totalCount] = await this.usersQueryRepository.findAndCount({
      where: whereConditions.length > 0 ? whereConditions : undefined,
      order: {
        [sortBy]: sortDirection,
      },
      skip: offset,
      take: pageSize,
    });
    const items = users.map(UserViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: pageSize,
    });
  }
}
