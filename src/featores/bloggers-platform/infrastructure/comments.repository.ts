import { Injectable } from '@nestjs/common';
import { Comment, CommentDocument } from '../domain/comments.entity';
import {
  BadRequestDomainException,
  NotFoundDomainException,
} from '../../../core/exceptions/domain-exceptions';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { LikesForComment } from '../domain/commentsLike.entity';
import { pushLikeNewLikeDto } from '../dto/create-comment.dto';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(LikesForComment)
    private readonly likeForCommentsRepository: Repository<LikesForComment>,
  ) {}

  async createComment(dto: CommentDocument): Promise<CommentDocument> {
    return await this.commentRepository.save(dto);
  }

  async findUserLikeStatus(commentId: string, userId: string): Promise<string> {
    try {
      const myLike = await this.likeForCommentsRepository
        .createQueryBuilder('l')
        .where('l.commentId = :id', { id: commentId })
        .andWhere('l.userId =:userId', { userId })
        .getOne();
      debugger;
      return myLike ? myLike.likeStatus : 'None';
    } catch (error) {
      throw BadRequestDomainException.create(error);
    }
  }

  async findUserInLikeInfo(
    commentId: string,
    userId: string,
  ): Promise<LikesForComment | null> {
    try {
      return await this.likeForCommentsRepository
        .createQueryBuilder('l')
        .where('l.commentId = :commentId', { commentId })
        .andWhere('l.userId = :userId', { userId })
        .getOne();
    } catch (error) {
      throw BadRequestDomainException.create(error);
    }
  }

  async pushUserInLikesInfo(dto: pushLikeNewLikeDto): Promise<void> {
    try {
      await this.likeForCommentsRepository.save(dto);
    } catch (error: any) {
      throw BadRequestDomainException.create(error);
    }
  }

  async updateLikesStatus(
    commentId: string,
    userId: string,
    likeStatus: string,
  ): Promise<void> {
    try {
      debugger;
      await this.likeForCommentsRepository
        .createQueryBuilder()
        .update(LikesForComment)
        .set({ likeStatus })
        .where('"commentId" = :commentId', { commentId })
        .andWhere('"userId" = :userId', { userId })
        .execute();
    } catch (error) {
      throw NotFoundDomainException.create(error);
    }
  }

  async updateComment(commentId: string, content: string): Promise<boolean> {
    const result = await this.commentRepository.update(
      { id: commentId },
      {
        content: content,
      },
    );
    if (result.affected === 0) {
      throw NotFoundDomainException.create('error update ,comment not found');
    }
    return true;
  }
  async findCommentById(id: string): Promise<Comment> {
    const result = await this.commentRepository.findOne({ where: { id } });
    if (!result) {
      throw NotFoundDomainException.create('comment not found');
    }
    return result;
  }
  async deleteCommentById(id: string): Promise<any> {
    /*try {
      await this.dataSource.query(
        `DELETE FROM public."LikesForComments"
      WHERE "commentId"= $1;`,
        [id],
      );
      await this.dataSource.query(
        `DELETE FROM public."Comments"
      WHERE "id"= $1;`,
        [id],
      );
    } catch (error) {
      throw NotFoundDomainException.create(error);
    }*/
    try {
      await this.commentRepository.delete({ id });
    } catch (error) {
      throw BadRequestDomainException.create(error);
    }
    /*const result = await this.commentRepository.delete({ id });
    return result.affected !== 0;*/
  }
}
