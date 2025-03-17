export class CreateBlogDomainDto {
  name: string;
  description: string;
  websiteUrl: string;
}
export class CreatePostDomainDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
}
