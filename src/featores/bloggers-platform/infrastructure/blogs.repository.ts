import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument } from '../domain/blogs.entity';
import { NotFoundDomainException } from '../../../core/exceptions/domain-exceptions';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, DeepPartial, Repository } from 'typeorm';
import { UpdateBlogDto } from '../dto/create-blog.dto';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Blog)
    private readonly blogsRepository: Repository<Blog>,
  ) {}

  async createBlog(dto: DeepPartial<Blog>): Promise<BlogDocument> {
    return await this.blogsRepository.save(dto);
  }

  async findBlogById(id: string): Promise<Blog> {
    const result = await this.blogsRepository.findOne({ where: { id } });
    if (!result) {
      throw NotFoundDomainException.create('blog not found');
    }
    return result;
  }
  async findBlogOfValidation(blogId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `SELECT * FROM public."Blogs"
             WHERE "id" = $1`,
      [blogId],
    );
    return !!result;
  }
  async updateBlog(blogId: string, dto: UpdateBlogDto): Promise<void> {
    /*try {
      const query = `
      UPDATE public."Blogs"
      SET "name" = $1, "description"=$2,"websiteUrl"=$3
      WHERE "id" = $4
    `;
      const values = [dto.name, dto.description, dto.websiteUrl, blogId];
      return await this.dataSource.query(query, values);
    } catch (error) {
      throw NotFoundDomainException.create(error);
    }*/
    const result = await this.blogsRepository.update(
      { id: blogId },
      {
        name: dto.name,
        description: dto.description,
        websiteUrl: dto.websiteUrl,
      },
    );
    if (result.affected === 0) {
      throw NotFoundDomainException.create('error update ,blog not found');
    }
  }
  async deleteBlog(id: string): Promise<any> {
    await this.findBlogById(id);
    const result = await this.blogsRepository.delete(id);
    return result.affected !== 0;
  }
}
