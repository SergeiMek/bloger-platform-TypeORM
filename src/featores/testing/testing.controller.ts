import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { UserEntity } from '../user-accounts/domain/user.entity';
import { DeviceEntity } from '../user-accounts/domain/device.entity';
import { Blog } from '../bloggers-platform/domain/blogs.entity';
import { Post } from '../bloggers-platform/domain/posts.entity';
import { LikesForPost } from '../bloggers-platform/domain/postsLike.entity';
import { Comment } from '../bloggers-platform/domain/comments.entity';

@Controller('testing')
export class AllDeleteController {
  constructor(
    /* @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(DeviceEntity)
    private readonly deviceRepository: Repository<DeviceEntity>,
    @InjectRepository(Blog)
    private readonly blogsRepository: Repository<Blog>,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(LikesForPost)
    private readonly likeForPostsRepository: Repository<LikesForPost>,
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,*/
    private readonly entityManager: EntityManager,
  ) {}
  @Delete('/all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async dropDB(): Promise<void> {
    try {
      /*   await this.usersRepository.clear();
      await this.deviceRepository.clear();
      await this.likeForPostsRepository.clear();
      await this.commentsRepository.clear();
      await this.postsRepository.clear();
      await this.blogsRepository.clear();*/
      await this.entityManager.delete(UserEntity, {});
      await this.entityManager.delete(DeviceEntity, {});
      await this.entityManager.delete(LikesForPost, {});
      await this.entityManager.delete(Comment, {});
      await this.entityManager.delete(Post, {});
      await this.entityManager.delete(Blog, {});
    } catch (error) {
      console.log(error);
    }
  }
}
