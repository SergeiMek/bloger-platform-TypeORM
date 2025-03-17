import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';
import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { getAllPostsDto } from '../../dto/create-post.dto';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getAll(
    query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const filterConditions: any = [];
    if (query.searchNameTerm) {
      filterConditions.push(`"name" ILIKE '%${query.searchNameTerm}%'`);
    }

    const whereClause =
      filterConditions.length > 0
        ? `WHERE "name" ILIKE '%${query.searchNameTerm}%'`
        : '';
    const sortDirection = query.sortDirection === 'desc' ? 'DESC' : 'ASC';
    let sortBy = '';
    if (query.sortBy === 'name') {
      sortBy = query.sortBy;
    } else {
      sortBy = 'createdAt';
    }
    const offset = query.calculateSkip();
    debugger;
    const blogs = await this.dataSource.query(`
      SELECT * FROM public."Blogs"
      ${whereClause}
       ORDER BY "${sortBy}" ${sortDirection}
  LIMIT ${query.pageSize} OFFSET ${offset}
    `);
    const totalCountArray = await this.dataSource.query(
      `
      SELECT COUNT(*) FROM public."Blogs"
      ${whereClause}
    `,
    );
    const totalCount = parseInt(totalCountArray[0].count, 10);

    const items = blogs.map(BlogViewDto.mapToView);
    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async getPostsForBlog(
    dto: getAllPostsDto,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    /*    const post = await this.PostModel.find(filter)
      .sort({ [dto.query.sortBy]: dto.query.sortDirection })
      .skip(dto.query.calculateSkip())
      .limit(dto.query.pageSize);
    const totalCount = await this.PostModel.countDocuments(filter);*/
    const sortDirection = dto.query.sortDirection === 'desc' ? 'DESC' : 'ASC';
    const offset = dto.query.calculateSkip();
    const posts = await this.dataSource.query(
      `
      SELECT * FROM public."Posts"
       WHERE "blogId"= $1
       ORDER BY "createdAt" ${sortDirection}
  LIMIT ${dto.query.pageSize} OFFSET ${offset}
    `,
      [dto.blogId],
    );
    const totalCountArray = await this.dataSource.query(
      `
      SELECT COUNT(*) FROM public."Posts"
       WHERE "blogId"= $1
    `,
      [dto.blogId],
    );
    const totalCount = parseInt(totalCountArray[0].count, 10);

    /*const items: PostViewDto[] = await Promise.all(
      post.map(async (post) => {
        let status;
        if (dto.userId) {
          status = await this.postsRepository.findUserLikeStatus(
            post._id.toString(),
            dto.userId,
          );
        }
        const newestLikes = post.likesInfo.users
          .filter((p) => p.likeStatus === 'Like')
          .sort((a, b) => -a.addedAt.localeCompare(b.addedAt))
          .map((p) => {
            return {
              addedAt: p.addedAt,
              userId: p.userId,
              login: p.userLogin,
            };
          })
          .splice(0, 3);
        return PostViewDto.mapToView(post, newestLikes, status);
      }),
    );*/
    const items = posts.map(PostViewDto.mapToView);
    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: dto.query.pageNumber,
      size: dto.query.pageSize,
    });
  }

  async findBlogById(id: string): Promise<BlogViewDto> {
    const blog = await this.dataSource.query(
      `SELECT * FROM public."Blogs"
             WHERE "id" = $1`,
      [id],
    );
    if (blog.length === 0) {
      throw new NotFoundException('user not found');
    }
    return BlogViewDto.mapToView(blog[0]);
  }
}
