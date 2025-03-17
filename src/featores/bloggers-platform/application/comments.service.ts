import { Injectable } from '@nestjs/common';
import {
  CommentDocument,
  CommentsBDTypeClass,
} from '../domain/comments.entity';
import { CommentsRepository } from '../infrastructure/comments.repository';
import {
  CreateCommentDto,
  UpdateCommentDto,
  UpdateLikeStatusDto,
} from '../dto/create-comment.dto';
import { PostsRepository } from '../infrastructure/posts.repository';
import { UsersRepository } from '../../user-accounts/infrastructure/users.repository';
import { CommentsQueryRepository } from '../infrastructure/query/comments.query-repository';
import { CommentViewDto } from '../api/view-dto/comments.view-dto';
import { v4 as uuidv4 } from 'uuid';
import {
  ForbiddenDomainException,
  NotFoundDomainException,
} from '../../../core/exceptions/domain-exceptions';

@Injectable()
export class CommentsService {
  constructor(
    private commentsRepository: CommentsRepository,
    private postsRepository: PostsRepository,
    private usersRepository: UsersRepository,
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}

  async createComment(dto: CreateCommentDto): Promise<CommentViewDto> {
    await this.postsRepository.findPostById(dto.postId);
    const user = await this.usersRepository.findById(dto.userId);
    const comment: CommentDocument = new CommentsBDTypeClass(
      uuidv4(),
      dto.content,
      new Date().toISOString(),
      dto.postId,
      dto.userId,
      user.login,
    );
    await this.commentsRepository.createComment(comment);
    return await this.commentsQueryRepository.findCommentById(comment.id);
  }
  async updateComment(dto: UpdateCommentDto): Promise<void> {
    const comment = await this.commentsRepository.findCommentById(
      dto.commentId,
    );
    if (!comment) {
      throw NotFoundDomainException.create('comment not found');
    }
    if (comment.userId !== dto.userId) {
      throw ForbiddenDomainException.create(
        'the comment does not belong to you',
      );
    }
    await this.commentsRepository.updateComment(dto.commentId, dto.content);
  }
  async updateLikeStatus(dto: UpdateLikeStatusDto) {
    await this.commentsRepository.findCommentById(dto.commentId);
    const foundUserLikeIfo = await this.commentsRepository.findUserInLikeInfo(
      dto.commentId,
      dto.userId,
    );
    const user = await this.usersRepository.findById(dto.userId);
    debugger;
    if (!foundUserLikeIfo) {
      await this.commentsRepository.pushUserInLikesInfo(
        dto.commentId,
        dto.userId,
        dto.likeStatus,
        user.login,
      );
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
