import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BlogDocument } from '../domain/blogs.entity';
import { isValidObjectId } from 'mongoose';
import { BlogViewDto } from '../api/view-dto/blogs.view-dto';
import {
  BadRequestDomainException,
  NotFoundDomainException,
} from '../../../core/exceptions/domain-exceptions';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UpdateBlogDto } from '../dto/create-blog.dto';

@Injectable()
export class BlogsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createBlog(dto: BlogViewDto): Promise<void> {
    try {
      await this.dataSource.query(`INSERT INTO public."Blogs"(
        id, name, description, "websiteUrl", "createdAt", "isMembership")
      VALUES ('${dto.id}', '${dto.name}', '${dto.description}', '${dto.websiteUrl}', '${dto.createdAt}', '${dto.isMembership}')`);
    } catch (error: any) {
      throw BadRequestDomainException.create(error);
    }
  }

  async findBlogById(id: string): Promise<BlogDocument> {
    const result = await this.dataSource.query(
      `SELECT * FROM public."Blogs"
             WHERE "id" = $1`,
      [id],
    );
    if (result[0]) {
      return result[0];
    } else {
      throw NotFoundDomainException.create('blog not found');
    }
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
    await this.findBlogById(blogId);
    try {
      const query = `
      UPDATE public."Blogs"
      SET "name" = $1, "description"=$2,"websiteUrl"=$3
      WHERE "id" = $4
    `;
      const values = [dto.name, dto.description, dto.websiteUrl, blogId];
      return await this.dataSource.query(query, values);
    } catch (error) {
      throw NotFoundDomainException.create(error);
    }
  }
  async deleteBlog(id: string): Promise<any> {
    await this.findBlogById(id);
    debugger;
    try {
      await this.dataSource.query(
        `DELETE FROM public."Posts"
      WHERE "blogId"= $1;`,
        [id],
      );
      const result = await this.dataSource.query(
        `DELETE FROM public."Blogs"
      WHERE "id"= $1;`,
        [id],
      );
      debugger;
      return result[1] === 1;
    } catch (error) {
      throw NotFoundDomainException.create(error);
    }
  }
}
