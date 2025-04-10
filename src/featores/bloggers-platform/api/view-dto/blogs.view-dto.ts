import { BlogDocument } from '../../domain/blogs.entity';

export class BlogViewDto {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;

  static mapToView(blog: BlogDocument): BlogViewDto {
    const dto = new BlogViewDto();
    dto.id = blog.id;
    dto.name = blog.name;
    dto.description = blog.description;
    dto.websiteUrl = blog.websiteUrl;
    dto.createdAt = new Date(blog.createdAt).toISOString();
    dto.isMembership = blog.isMembership;
    return dto;
  }
}
