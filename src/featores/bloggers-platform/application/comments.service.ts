import { Injectable } from '@nestjs/common';
import { Comment } from '../domain/comments.entity';
import { CommentsRepository } from '../infrastructure/comments.repository';
import {
  CreateCommentDto,
  UpdateCommentDto,
  UpdateLikeStatusDto,
} from '../dto/create-comment.dto';
import { PostsRepository } from '../infrastructure/posts.repository';
import { UsersRepo } from '../../user-accounts/infrastructure/users-repo';
import { CommentsQueryRepository } from '../infrastructure/query/comments.query-repository';
import { CommentViewDto } from '../api/view-dto/comments.view-dto';
import {
  ForbiddenDomainException,
  NotFoundDomainException,
} from '../../../core/exceptions/domain-exceptions';
import { LikesForComment } from '../domain/commentsLike.entity';

@Injectable()
export class CommentsService {
  constructor(
    private commentsRepository: CommentsRepository,
    private postsRepository: PostsRepository,
    private usersRepository: UsersRepo,
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}

  async createComment(dto: CreateCommentDto): Promise<CommentViewDto> {
    await this.postsRepository.findPostById(dto.postId);
    const user = await this.usersRepository.findById(dto.userId);
    const post = await this.postsRepository.findPostById(dto.postId);
    const comment = new Comment();
    comment.content = dto.content;
    comment.userId = dto.userId;
    comment.userLogin = user.login;
    comment.post = post;

    const createdComment = await this.commentsRepository.createComment(comment);
    return await this.commentsQueryRepository.findCommentById(
      createdComment.id,
      dto.userId,
    );
  }
  async updateComment(dto: UpdateCommentDto): Promise<void> {
    const comment = await this.commentsRepository.findCommentById(
      dto.commentId,
    );
    if (!comment) {
      throw NotFoundDomainException.create('comment not found');
    }
    debugger;
    if (comment.userId !== dto.userId) {
      throw ForbiddenDomainException.create(
        'the comment does not belong to you',
      );
    }
    await this.commentsRepository.updateComment(dto.commentId, dto.content);
  }
  async updateLikeStatus(dto: UpdateLikeStatusDto) {
    const comment = await this.commentsRepository.findCommentById(
      dto.commentId,
    );
    const foundUserLikeIfo = await this.commentsRepository.findUserInLikeInfo(
      dto.commentId,
      dto.userId,
    );
    const user = await this.usersRepository.findById(dto.userId);
    debugger;
    if (!foundUserLikeIfo) {
      debugger;
      const newLike = new LikesForComment();
      newLike.userId = dto.userId;
      newLike.userLogin = user.login;
      newLike.likeStatus = 'None';
      newLike.createdAt = new Date().toISOString();
      newLike.comment = comment;
      await this.commentsRepository.pushUserInLikesInfo(newLike);
    }
    await this.commentsRepository.updateLikesStatus(
      dto.commentId,
      dto.userId,
      dto.likeStatus,
    );
  }

  async deleteComment(id: string, userId: string) {
    const comment = await this.commentsRepository.findCommentById(id);
    if (!comment) {
      throw NotFoundDomainException.create('comment not found');
    }
    if (comment.userId !== userId) {
      throw ForbiddenDomainException.create(
        'the comment does not belong to you',
      );
    }
    await this.commentsRepository.deleteCommentById(id);
  }
}
