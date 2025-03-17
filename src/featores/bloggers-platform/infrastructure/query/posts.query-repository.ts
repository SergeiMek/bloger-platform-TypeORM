import { Injectable, NotFoundException } from '@nestjs/common';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { getAllPostsDto } from '../../dto/create-post.dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { BlogsRepository } from '../blogs.repository';
import { PostsRepository } from '../posts.repository';
import { BadRequestDomainException } from '../../../../core/exceptions/domain-exceptions';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
  ) {}

  async getAll(dto: getAllPostsDto): Promise<PaginatedViewDto<PostViewDto[]>> {
    const filterConditions: any = [];
    const filterConditionsParams: any = [];
    if (dto.blogId) {
      await this.blogsRepository.findBlogById(dto.blogId);
      filterConditions.push(`"blogId" = $1`);
      filterConditionsParams.push(dto.blogId);
    }

    const whereClause =
      filterConditions.length > 0 ? `WHERE ${filterConditions[0]}` : '';
    const sortDirection = dto.query.sortDirection === 'desc' ? 'DESC' : 'ASC';
    let sortBy = '';
    if (dto.query.sortBy === 'title' || dto.query.sortBy === 'blogName') {
      sortBy = dto.query.sortBy;
    } else {
      sortBy = 'createdAt';
    }
    const offset = dto.query.calculateSkip();
    const posts = await this.dataSource.query(
      `
       SELECT c.* , ( SELECT COUNT(*) FROM public."LikesForPosts"
      WHERE "postId" = c."id" AND "likeStatus" = 'Like') as "likesCount" ,
  ( SELECT COUNT(*) FROM public."LikesForPosts"
      WHERE "postId" = c."id" AND "likeStatus" = 'Dislike') as "dislikesCount"  FROM public."Posts" c
      ${whereClause}
       ORDER BY "${sortBy}" ${sortDirection}
  LIMIT ${dto.query.pageSize} OFFSET ${offset}
    `,
      filterConditionsParams,
    );
    const totalCountArray = await this.dataSource.query(
      `
      SELECT COUNT(*) FROM public."Posts"
      ${whereClause}
    `,
      filterConditionsParams,
    );

    const totalCount = parseInt(totalCountArray[0].count, 10);
    const items: PostViewDto[] = await Promise.all(
      posts.map(async (post) => {
        let status;
        const newestLikes = await this.postsRepository.getNewestLike(post.id);
        if (dto.userId) {
          status = await this.postsRepository.findUserLikeStatus(
            post.id,
            dto.userId,
          );
        }
        /*const newestLikes = post.likesInfo.users
          .filter((p) => p.likeStatus === 'Like')
          .sort((a, b) => -a.addedAt.localeCompare(b.addedAt))
          .map((p) => {
            return {
              addedAt: p.addedAt,
              userId: p.userId,
              login: p.userLogin,
            };
          })
          .splice(0, 3);*/

        return PostViewDto.mapToView(post, newestLikes, status);
      }),
    );

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: dto.query.pageNumber,
      size: dto.query.pageSize,
    });
  }
  async findPostById(id: string, userId?: string): Promise<PostViewDto> {
    try {
      const post = await this.dataSource.query(
        `
  SELECT c.*, 
    (SELECT COUNT(*) FROM public."LikesForPosts" WHERE "postId" = c."id" AND "likeStatus" = 'Like') AS "likesCount",
    (SELECT COUNT(*) FROM public."LikesForPosts" WHERE "postId" = c."id" AND "likeStatus" = 'Dislike') AS "dislikesCount"  
  FROM public."Posts" c
  WHERE "id" = $1
  `,
        [id],
      );
      if (post.length === 0) {
        throw new NotFoundException('user not found');
      }
      let status;
      //let likes;
      const newestLikes = await this.postsRepository.getNewestLike(id);
      if (userId) {
        status = await this.postsRepository.findUserLikeStatus(id, userId);
      }
      return PostViewDto.mapToView(post[0], newestLikes, status);
    } catch (error) {
      //throw BadRequestDomainException.create(error);
      throw new NotFoundException('post not found');
    }
  }
}
