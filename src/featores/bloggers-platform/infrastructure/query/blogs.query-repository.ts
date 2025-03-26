import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';
import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { getAllPostsDto } from '../../dto/create-post.dto';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { Blog } from '../../domain/blogs.entity';
import { Post } from '../../domain/posts.entity';
import { LikesForPost } from '../../domain/postsLike.entity';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Blog)
    private readonly blogsRepository: Repository<Blog>,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async getAll(
    query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const qb = await this.blogsRepository.createQueryBuilder('blog');
    if (query.searchNameTerm) {
      qb.where('blog.name ILIKE :searchNameTerm', {
        searchNameTerm: `%${query.searchNameTerm}%`,
      });
    }

    const sortDirection = query.sortDirection === 'desc' ? 'DESC' : 'ASC';
    const sortBy = ['name', 'description'].includes(query.sortBy)
      ? query.sortBy
      : 'createdAt';
    qb.orderBy(`blog.${sortBy}`, sortDirection);

    const offset = query.calculateSkip();
    const pageSize = query.pageSize;
    qb.skip(offset).take(pageSize);

    const [blogs, totalCount] = await qb.getManyAndCount();

    const items = blogs.map(BlogViewDto.mapToView);
    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async getPostsForBlog(
    dto: getAllPostsDto,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    /*const sortDirection = dto.query.sortDirection === 'desc' ? 'DESC' : 'ASC';
    const offset = dto.query.calculateSkip();
    const posts = await this.dataSource.query(
      `
      SELECT * FROM public."Posts"
       WHERE "blogId"= $1
       ORDER BY "createdAt" ${sortDirection}
  LIMIT ${dto.query.pageSize} OFFSET ${offset}
    `,
      [dto.blogId],
    );
    const totalCountArray = await this.dataSource.query(
      `
      SELECT COUNT(*) FROM public."Posts"
       WHERE "blogId"= $1
    `,
      [dto.blogId],
    );
    const totalCount = parseInt(totalCountArray[0].count, 10);*/
    const sortDirection = dto.query.sortDirection === 'desc' ? 'DESC' : 'ASC';
    const sortBy = ['name', 'description'].includes(dto.query.sortBy)
      ? dto.query.sortBy
      : 'createdAt';
    const posts = await this.postsRepository
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
      //.select(['b.name', 'p', 'likesCount', 'dislikesCount'])
      .where('p.blogId = :id', { id: dto.blogId })
      .groupBy(`p.id,b.id`)
      .orderBy(`p.${sortBy}`, sortDirection)
      .getRawMany();

    const totalCount = await this.postsRepository
      .createQueryBuilder('p')
      .where('p.blogId = :id', { id: dto.blogId })
      .getCount();
    debugger;

    // const items = posts.map(PostViewDto.mapToView());
    const items: PostViewDto[] = await Promise.all(
      posts.map(async (post) => {
        let status;
        if (dto.userId) {
          /* status = await this.postsRepository.findUserLikeStatus(
            post._id.toString(),
            dto.userId,
          );*/
        }
        /* const newestLikes = post.likesInfo.users
          .filter((p) => p.likeStatus === 'Like')
          .sort((a, b) => -a.addedAt.localeCompare(b.addedAt))
          .map((p) => {
            return {
              addedAt: p.addedAt,
              userId: p.userId,
              login: p.userLogin,
            };
          })
          .splice(0, 3);*/
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

  async findBlogById(id: string): Promise<BlogViewDto> {
    /*const blog = await this.dataSource.query(
      `SELECT * FROM public."Blogs"
             WHERE "id" = $1`,
      [id],
    );*/
    const blog = await this.blogsRepository
      .createQueryBuilder('b')
      .where('b.id = :id', { id })
      .getOne();

    if (!blog) {
      throw new NotFoundException('user not found');
    }
    return BlogViewDto.mapToView(blog);
  }
}
