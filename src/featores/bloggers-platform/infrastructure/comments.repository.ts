import { Injectable } from '@nestjs/common';
import { CommentDocument } from '../domain/comments.entity';
import {
  BadRequestDomainException,
  NotFoundDomainException,
} from '../../../core/exceptions/domain-exceptions';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CommentsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createComment(dto: CommentDocument): Promise<void> {
    try {
      await this.dataSource.query(`INSERT INTO public."Comments"(
        id, "userId", "userLogin", "createdAt", "postId","content")
      VALUES ('${dto.id}', '${dto.userId}', '${dto.userLogin}', '${dto.createdAt}', '${dto.postId}','${dto.content}')`);
    } catch (error: any) {
      throw BadRequestDomainException.create(error);
    }
  }

  async findUserLikeStatus(commentId: string, userId: string): Promise<string> {
    try {
      const result = await this.dataSource.query(`SELECT * 
          FROM public."LikesForComments"
          WHERE "commentId" = '${commentId}' AND "userId" = '${userId}'`);
      return result[0] ? result[0].likeStatus : 'None';
    } catch (error: any) {
      throw BadRequestDomainException.create(error);
    }
  }

  /* async findLikeById(id: string): Promise<CommentDocument> {
    const comment = await this.dataSource.query(
      `SELECT * FROM public."Comments"
             WHERE "id" = $1`,
      [id],
    );

    if (!comment) {
      throw NotFoundDomainException.create('comment not found', 'commentId');
    }

    return comment[0];
  }*/

  async findUserInLikeInfo(
    commentId: string,
    userId: string,
  ): Promise<CommentDocument | null> {
    try {
      const foundUser = await this.dataSource.query(`SELECT * 
          FROM public."LikesForComments"
          WHERE "commentId" = '${commentId}' AND "userId" = '${userId}'`);
      return foundUser[0];
    } catch (error: any) {
      throw BadRequestDomainException.create(error);
    }
  }

  async pushUserInLikesInfo(
    commentId: string,
    userId: string,
    likeStatus: string,
    userLogin: string,
  ): Promise<void> {
    try {
      const id = uuidv4();
      const data = new Date().toISOString();
      await this.dataSource.query(`INSERT INTO public."LikesForComments"(
        id, "commentId", "addedAt", "userId", "userLogin", "likeStatus")
      VALUES ('${id}', '${commentId}', '${data}', '${userId}', '${userLogin}','${likeStatus}')`);
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
      const query = `
      UPDATE public."LikesForComments"
      SET "likeStatus" = '${likeStatus}'
       WHERE "commentId" = '${commentId}' AND "userId" = '${userId}'
    `;
      return await this.dataSource.query(query);
    } catch (error) {
      throw NotFoundDomainException.create(error);
    }
  }

  async updateComment(commentId: string, content: string): Promise<void> {
    try {
      const query = `
      UPDATE public."Comments"
      SET "content" = $1
       WHERE "id" = $2
    `;
      return await this.dataSource.query(query, [content, commentId]);
    } catch (error) {
      throw NotFoundDomainException.create(error);
    }
  }
  async findCommentById(id: string): Promise<CommentDocument> {
    const comment = await this.dataSource.query(
      `SELECT * FROM public."Comments"
             WHERE "id" = $1`,
      [id],
    );

    if (comment.length === 0) {
      throw NotFoundDomainException.create('comment not found', 'commentId');
    }

    return comment[0];
  }
  async deleteCommentById(id: string): Promise<any> {
    try {
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
    }
  }
}
