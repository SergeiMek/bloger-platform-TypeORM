import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { CreateBlogDto, UpdateBlogDto } from '../dto/create-blog.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BlogsService {
  constructor(private blogsRepository: BlogsRepository) {}

  async createBlog(dto: CreateBlogDto): Promise<string> {
    const blog = {
      id: uuidv4(),
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
    };
    await this.blogsRepository.createBlog(blog);
    return blog.id;
  }
  async updateBlog(id: string, body: UpdateBlogDto): Promise<void> {
    await this.blogsRepository.updateBlog(id, body);
  }
  async deleteBlog(id: string) {
    await this.blogsRepository.deleteBlog(id);
  }
}
