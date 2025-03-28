import { Injectable } from '@nestjs/common';
import { CommentViewDto } from '../../api/view-dto/comments.view-dto';
import {
  BadRequestDomainException,
  NotFoundDomainException,
} from '../../../../core/exceptions/domain-exceptions';
import { CommentsRepository } from '../comments.repository';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { GetCommentsQueryParams } from '../../api/input-dto/get-comment-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { PostsRepository } from '../posts.repository';
import { Comment } from '../../domain/comments.entity';
import { LikesForPost } from '../../domain/postsLike.entity';
import { LikesForComment } from '../../domain/commentsLike.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private postsRepo: PostsRepository,
    private commentsRepo: CommentsRepository,
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) {}

  async getAll(
    query: GetCommentsQueryParams,
    postId?: string,
    userId?: string,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const qb = this.commentsRepository.createQueryBuilder('c');
    if (postId) {
      await this.postsRepo.findPostById(postId);
      qb.where('c.postId = :id', { id: postId });
    }
    const sortDirection = query.sortDirection === 'desc' ? 'DESC' : 'ASC';
    const offset = query.calculateSkip();
    const pageSize = query.pageSize;
    debugger;
    const comments = await qb
      .addSelect(
        (qb) =>
          qb
            .select(`COUNT(*)`)
            .from(LikesForComment, 'cl')
            .where('cl.commentId = c.id')
            .andWhere(`cl.likeStatus = 'Like'`),
        'likesCount',
      )
      .addSelect(
        (qb) =>
          qb
            .select(`COUNT(*)`)
            .from(LikesForComment, 'cl')
            .where('cl.commentId = c.id')
            .andWhere(`cl.likeStatus = 'Dislike'`),
        'dislikesCount',
      )
      .orderBy('c.createdAt', sortDirection)
      .limit(pageSize)
      .offset(offset)
      .groupBy(`c.id`)
      .getRawMany();
    const items: CommentViewDto[] = await Promise.all(
      comments.map(async (comment) => {
        let status;
        if (userId) {
          status = await this.commentsRepo.findUserLikeStatus(
            comment.c_id,
            userId,
          );
        }
        const commentMap = {
          id: comment.c_id,
          userId: comment.c_userId,
          userLogin: comment.c_userLogin,
          createdAt: comment.c_createdAt,
          postId: comment.c_postId,
          content: comment.c_content,
          likesCount: comment.likesCount,
          dislikesCount: comment.dislikesCount,
        };

        return CommentViewDto.mapToView(commentMap, status);
      }),
    );
    const totalCount = await qb.getCount();
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
      likeStatus = await this.commentsRepo.findUserLikeStatus(id, userId);
    }
    const comment = await this.commentsRepository
      .createQueryBuilder('c')
      .addSelect(
        (qb) =>
          qb
            .select(`COUNT(*)`)
            .from(LikesForComment, 'cl')
            .where('cl.commentId = c.id')
            .andWhere(`cl.likeStatus = 'Like'`),
        'likesCount',
      )
      .addSelect(
        (qb) =>
          qb
            .select(`COUNT(*)`)
            .from(LikesForComment, 'cl')
            .where('cl.commentId = c.id')
            .andWhere(`cl.likeStatus = 'Dislike'`),
        'dislikesCount',
      )
      .where('c.id = :id', { id })
      .groupBy('c.id')
      .getRawOne();
    if (!comment) {
      throw NotFoundDomainException.create('comment not found');
    }
    const commentMap = {
      id: comment.c_id,
      userId: comment.c_userId,
      userLogin: comment.c_userLogin,
      createdAt: comment.c_createdAt,
      postId: comment.c_postId,
      content: comment.c_content,
      likesCount: comment.likesCount,
      dislikesCount: comment.dislikesCount,
    };
    return CommentViewDto.mapToView(commentMap, likeStatus);
  }
}
