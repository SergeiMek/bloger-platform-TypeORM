import { Injectable, NotFoundException } from '@nestjs/common';
import { Post, PostDocument } from '../domain/posts.entity';
import {
  BadRequestDomainException,
  NotFoundDomainException,
} from '../../../core/exceptions/domain-exceptions';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UpdatePostDto } from '../dto/create-post.dto';
import { UserDocument } from '../../user-accounts/domain/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { Blog } from '../domain/blogs.entity';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async findPostById(id: string): Promise<Post> {
    const result = await this.postsRepository.findOne({ where: { id } });
    if (!result) {
      throw NotFoundDomainException.create('post not found');
    }
    return result;
  }
  async createPost(dto: PostDocument): Promise<PostDocument> {
    /*try {
      await this.dataSource.query(`INSERT INTO public."Posts"(
        id, "blogId", title, "shortDescription", content, "blogName", "createdAt")
      VALUES ('${dto.id}', '${dto.blogId}', '${dto.title}', '${dto.shortDescription}', '${dto.content}', '${dto.blogName}','${dto.createdAt}')`);
    } catch (error: any) {
      throw BadRequestDomainException.create(error);
    }*/
    return await this.postsRepository.save(dto);
  }

  async findUserInLikesInfo(
    postId: string,
    userId: string,
  ): Promise<PostDocument | null> {
    try {
      const foundUser = await this.dataSource.query(`SELECT * 
          FROM public."LikesForPosts"
          WHERE "postId" = '${postId}' AND "userId" = '${userId}'`);
      return foundUser[0];
    } catch (error: any) {
      throw BadRequestDomainException.create(error);
    }
  }
  async findUserLikeStatus(
    postId: string,
    userId: string,
  ): Promise<PostDocument | null> {
    try {
      const foundUser = await this.dataSource.query(`SELECT * 
          FROM "LikesForPosts"
          WHERE "postId" = '${postId}' AND "userId" = '${userId}'`);
      return foundUser[0] ? foundUser[0].likeStatus : 'None';
    } catch (error: any) {
      throw BadRequestDomainException.create(error);
    }
  }
  async getNewestLike(postId: string) {
    try {
      return await this.dataSource
        .query(`SELECT "addedAt", "userId", "userLogin" AS "login"
          FROM public."LikesForPosts"
          WHERE "postId" = '${postId}' AND "likeStatus" = 'Like'
           ORDER BY "addedAt" DESC
           LIMIT 3
          `);
    } catch (error: any) {
      throw BadRequestDomainException.create(error);
    }
  }
  async pushUserInLikesInfo(
    postId: string,
    userId: string,
    likeStatus: string,
    userLogin: string,
  ): Promise<void> {
    try {
      const id = uuidv4();
      const data = new Date().toISOString();
      await this.dataSource.query(`INSERT INTO public."LikesForPosts"(
        id, "postId", "addedAt", "userId", "userLogin", "likeStatus")
      VALUES ('${id}', '${postId}', '${data}', '${userId}', '${userLogin}','${likeStatus}')`);
    } catch (error: any) {
      throw BadRequestDomainException.create(error);
    }
  }

  async updateLikesStatus(
    postId: string,
    userId: string,
    likeStatus: string,
  ): Promise<void> {
    try {
      const query = `
      UPDATE public."LikesForPosts"
      SET "likeStatus" = '${likeStatus}'
       WHERE "postId" = '${postId}' AND "userId" = '${userId}'
    `;
      return await this.dataSource.query(query);
    } catch (error) {
      throw NotFoundDomainException.create(error);
    }
  }
  async updatePost(postId: string, dto: UpdatePostDto): Promise<boolean> {
    await this.findPostById(postId);
    /* try {
      const query = `
      UPDATE public."Posts"
      SET "title" = $1, "shortDescription"=$2,"content"=$3,"blogId"=$4
      WHERE "id" = $5
    `;
      const values = [
        dto.title,
        dto.shortDescription,
        dto.content,
        blogId,
        postId,
      ];
      return await this.dataSource.query(query, values);
    } catch (error) {
      throw NotFoundDomainException.create(error);
    }*/
    const result = await this.postsRepository.update(
      { id: postId },
      {
        title: dto.title,
        shortDescription: dto.shortDescription,
        content: dto.content,
      },
    );
    if (result.affected === 0) {
      throw NotFoundDomainException.create('error update ,blog not found');
    }
    return true;
  }
  async deletePost(postId: string) {
    await this.findPostById(postId);
    /*try {
      const result = await this.dataSource.query(
        `DELETE FROM public."Posts"
      WHERE "id"= $1;`,
        [postId],
      );
      debugger;
      return result[1] === 1;
    } catch (error) {
      throw NotFoundDomainException.create(error);
    }*/
    const result = await this.postsRepository.delete({ id: postId });
    return result.affected !== 0;
  }
}
