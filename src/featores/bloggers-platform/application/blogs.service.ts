import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { CreateBlogDto, UpdateBlogDto } from '../dto/create-blog.dto';
import { Blog } from '../domain/blogs.entity';

@Injectable()
export class BlogsService {
  constructor(private blogsRepository: BlogsRepository) {}

  async createBlog(dto: CreateBlogDto): Promise<string> {
    const blog = new Blog();
    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.createdAt = new Date();

    const savedBlog = await this.blogsRepository.createBlog(blog);
    return savedBlog.id;
  }
  async updateBlog(id: string, body: UpdateBlogDto): Promise<void> {
    await this.blogsRepository.updateBlog(id, body);
  }
  async deleteBlog(id: string) {
    await this.blogsRepository.deleteBlog(id);
  }
}
