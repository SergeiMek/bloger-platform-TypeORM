import { Injectable, NotFoundException } from '@nestjs/common';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { getAllPostsDto } from '../../dto/create-post.dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { BlogsRepository } from '../blogs.repository';
import { PostsRepository } from '../posts.repository';
import { Post } from '../../domain/posts.entity';
import { LikesForPost } from '../../domain/postsLike.entity';
import { Blog } from '../../domain/blogs.entity';
import { skip } from 'rxjs';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    private postsRepo: PostsRepository,
    private blogsRepo: BlogsRepository,
  ) {}

  async getAll(dto: getAllPostsDto): Promise<PaginatedViewDto<PostViewDto[]>> {
    const query = this.postsRepository.createQueryBuilder('p');
    if (dto.blogId) {
      query.where('p.blogId = :id', { id: dto.blogId });
    }
    const sortDirection = dto.query.sortDirection === 'desc' ? 'DESC' : 'ASC';
    debugger;
    const sortBy = ['name', 'description', 'blogName'].includes(
      dto.query.sortBy,
    )
      ? dto.query.sortBy
      : 'createdAt';
    debugger;
    const offset = dto.query.calculateSkip();
    const pageSize = dto.query.pageSize;
    /*const posts = await query
      .addSelect(
        (qb) =>
          qb
            .select(`COUNT(*)`)
            .from(LikesForPost, 'pl')
            .where('pl.postId = p.id')
            .andWhere(`pl.likeStatus = 'Like'`),
        'likesCount',
      )
      .addSelect(
        (qb) =>
          qb
            .select(`COUNT(*)`)
            .from(LikesForPost, 'pl')
            .where('pl.postId = p.id')
            .andWhere(`pl.likeStatus = 'Dislike'`),
        'dislikesCount',
      )
      .leftJoinAndSelect('p.blog', 'b')
      .groupBy(`p.id,b.id`)
      .orderBy(`p.${sortBy}`, sortDirection)
      //.skip(offset) // не работает
      // .take(pageSize)   не работает
      .getRawMany();*/
    query
      .addSelect(
        (qb) =>
          qb
            .select(`COUNT(*)`)
            .from(LikesForPost, 'pl')
            .where('pl.postId = p.id')
            .andWhere(`pl.likeStatus = 'Like'`),
        'likesCount',
      )
      .addSelect(
        (qb) =>
          qb
            .select(`COUNT(*)`)
            .from(LikesForPost, 'pl')
            .where('pl.postId = p.id')
            .andWhere(`pl.likeStatus = 'Dislike'`),
        'dislikesCount',
      )
      .leftJoinAndSelect('p.blog', 'b')
      .groupBy(`p.id,b.id`);

    let posts;
    if (sortBy === 'blogName') {
      debugger;
      posts = await query.orderBy(`b.name`, sortDirection).getRawMany();
      debugger;
    } else {
      posts = await query.orderBy(`p.${sortBy}`, sortDirection).getRawMany();
    }

    const paginationPosts = posts.slice(offset, offset + pageSize);

    const totalCount = await query.getCount();

    const items: PostViewDto[] = await Promise.all(
      paginationPosts.map(async (post): Promise<PostViewDto> => {
        let status;
        //const newestLikes = await this.postsRepository.getNewestLike(post.id);
        if (dto.userId) {
          // @ts-ignore
          status = await this.postsRepository.findUserLikeStatus(
            post.p_id,
            dto.userId,
          );
        }

        return PostViewDto.mapToView(post, [], status);
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
    const post = await this.postsRepository
      .createQueryBuilder('p')
      .addSelect(
        (qb) =>
          qb
            .select(`COUNT(*)`)
            .from(LikesForPost, 'pl')
            .where('pl.postId = p.id')
            .andWhere(`pl.likeStatus = 'Like'`),
        'likesCount',
      )
      .addSelect(
        (qb) =>
          qb
            .select(`COUNT(*)`)
            .from(LikesForPost, 'pl')
            .where('pl.postId = p.id')
            .andWhere(`pl.likeStatus = 'Dislike'`),
        'dislikesCount',
      )
      .leftJoinAndSelect('p.blog', 'b')
      .where('p.id = :id', { id })
      .groupBy(`p.id,b.id`)
      .getRawOne();
    debugger;
    if (!post) {
      throw new NotFoundException('post not found');
    }
    let status;
    // const newestLikes = await this.postsRepository.getNewestLike(id);
    if (userId) {
      // status = await this.postsRepo.findUserLikeStatus(id, userId);
    }

    return PostViewDto.mapToView(post, [], status);
  }
}
