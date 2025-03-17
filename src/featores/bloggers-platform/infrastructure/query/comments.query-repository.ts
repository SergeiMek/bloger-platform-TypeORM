import { Injectable } from '@nestjs/common';
import { CommentViewDto } from '../../api/view-dto/comments.view-dto';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exceptions';
import { CommentsRepository } from '../comments.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { GetCommentsQueryParams } from '../../api/input-dto/get-comment-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { PostsRepository } from '../posts.repository';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private postsRepository: PostsRepository,
    private commentsRepository: CommentsRepository,
  ) {}

  async getAll(
    query: GetCommentsQueryParams,
    postId?: string,
    userId?: string,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const filterConditions: any = [];
    const filterConditionsParams: any = [];
    if (postId) {
      await this.postsRepository.findPostById(postId);
      filterConditions.push(`"postId" = $1`);
      filterConditionsParams.push(postId);
    }

    const whereClause =
      filterConditions.length > 0 ? `WHERE ${filterConditions[0]}` : '';
    const sortDirection = query.sortDirection === 'desc' ? 'DESC' : 'ASC';
    /*let sortBy = '';
    if (dto.query.sortBy === 'title' || dto.query.sortBy === 'blogName') {
      sortBy = dto.query.sortBy;
    } else {
      sortBy = 'createdAt';
    }*/
    const offset = query.calculateSkip();
    const comments = await this.dataSource.query(
      `
      SELECT c.* , ( SELECT COUNT(*) FROM public."LikesForComments"
      WHERE "commentId" = c."id" AND "likeStatus" = 'Like') as "likesCount" ,
  ( SELECT COUNT(*) FROM public."LikesForComments"
      WHERE "commentId" = c."id" AND "likeStatus" = 'Dislike') as "dislikesCount"  FROM public."Comments" c
      ${whereClause}
       ORDER BY "createdAt" ${sortDirection}
  LIMIT ${query.pageSize} OFFSET ${offset}
    `,
      filterConditionsParams,
    );
    const totalCountArray = await this.dataSource.query(
      `
      SELECT COUNT(*) FROM public."Comments"
      ${whereClause}
    `,
      filterConditionsParams,
    );
    const totalCount = parseInt(totalCountArray[0].count, 10);
    debugger;
    const items: CommentViewDto[] = await Promise.all(
      comments.map(async (comment) => {
        let status;
        if (userId) {
          status = await this.commentsRepository.findUserLikeStatus(
            comment.id,
            userId,
          );
        }
        return CommentViewDto.mapToView(comment, status);
      }),
    );
    debugger;
    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
  async findCommentById(id: string, userId?: string): Promise<CommentViewDto> {
    let likeStatus;
    if (userId) {
      likeStatus = await this.commentsRepository.findUserLikeStatus(id, userId);
    }

    const comment = await this.dataSource.query(
      `SELECT * FROM public."Comments"
             WHERE "id" = $1`,
      [id],
    );
    if (comment.length === 0) {
      throw NotFoundDomainException.create('comment not found', 'commentId');
    }
    const likesCount = await this.dataSource.query(
      `
      SELECT COUNT(*) FROM public."LikesForComments"
      WHERE "commentId" = '${id}' AND "likeStatus" = 'Like'
  `,
    );
    const dislikesCount = await this.dataSource.query(
      `
      SELECT COUNT(*) FROM public."LikesForComments"
   WHERE "commentId" = '${id}' AND "likeStatus" = 'Dislike'
    `,
    );
    const commentLike = {
      ...comment[0],
      likesCount: parseInt(likesCount[0].count, 10),
      dislikesCount: parseInt(dislikesCount[0].count, 10),
    };
    return CommentViewDto.mapToView(commentLike, likeStatus);
  }
}
