import { Injectable, NotFoundException } from '@nestjs/common';
import { Post, PostDocument } from '../domain/posts.entity';
import {
  BadRequestDomainException,
  NotFoundDomainException,
} from '../../../core/exceptions/domain-exceptions';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { pushLikeNewLikeDto, UpdatePostDto } from '../dto/create-post.dto';
import { UserDocument } from '../../user-accounts/domain/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { Blog } from '../domain/blogs.entity';
import { LikesForPost } from '../domain/postsLike.entity';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(LikesForPost)
    private readonly likeForPostRepository: Repository<LikesForPost>,
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
  ): Promise<LikesForPost | null> {
    /*try {
      const foundUser = await this.dataSource.query(`SELECT * 
          FROM public."LikesForPosts"
          WHERE "postId" = '${postId}' AND "userId" = '${userId}'`);
      return foundUser[0];
    } catch (error: any) {
      throw BadRequestDomainException.create(error);
    }*/
    try {
      return await this.likeForPostRepository
        .createQueryBuilder('l')
        .where('l.postId = :postId', { postId })
        .andWhere('l.userId = :userId', { userId })
        .getOne();
    } catch (error) {
      throw BadRequestDomainException.create(error);
    }
  }
  async findUserLikeStatus(
    postId: string,
    userId: string,
  ): Promise<string | null> {
    /*try {
      const foundUser = await this.dataSource.query(`SELECT * 
          FROM "LikesForPosts"
          WHERE "postId" = '${postId}' AND "userId" = '${userId}'`);
      return foundUser[0] ? foundUser[0].likeStatus : 'None';
    } catch (error: any) {
      throw BadRequestDomainException.create(error);
    }*/
    try {
      const myLike = await this.likeForPostRepository
        .createQueryBuilder('l')
        .where('l.postId = :id', { id: postId })
        .andWhere('l.userId =:userId', { userId })
        .getOne();
      return myLike ? myLike.likeStatus : 'None';
    } catch (error) {
      throw BadRequestDomainException.create(error);
    }
  }
  async getNewestLike(postId: string) {
    try {
      const result = await this.likeForPostRepository
        .createQueryBuilder('l')
        .where('l.postId = :id', { id: postId })
        .andWhere('l.likeStatus = :likeStatus', { likeStatus: 'Like' })
        .orderBy('l.addedAt', 'DESC')
        .limit(3)
        .getMany();
      return result.map((l) => {
        return {
          addedAt: l.addedAt,
          login: l.userLogin,
          userId: l.userId,
        };
      });
    } catch (error) {
      throw BadRequestDomainException.create(error);
    }
  }
  async pushUserInLikesInfo(dto: pushLikeNewLikeDto): Promise<void> {
    try {
      await this.likeForPostRepository.save(dto);
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
      debugger;
      await this.likeForPostRepository
        .createQueryBuilder()
        .update(LikesForPost)
        .set({ likeStatus })
        .where('"postId" = :postId', { postId })
        .andWhere('"userId" = :userId', { userId })
        .execute();
    } catch (error) {
      throw NotFoundDomainException.create(error);
    }
  }
  async updatePost(postId: string, dto: UpdatePostDto): Promise<boolean> {
    await this.findPostById(postId);
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
