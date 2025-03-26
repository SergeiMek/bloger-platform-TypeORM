import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from './posts.entity';

export class BlogDocument {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;
}

@Entity('blogs')
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'varchar', width: 15, collation: 'C' })
  name: string;
  @Column({ type: 'varchar', width: 500 })
  description: string;
  @Column({ type: 'varchar' })
  websiteUrl: string;
  @Column({ type: 'varchar' })
  createdAt: Date;
  @Column({ type: 'boolean', default: false })
  isMembership: boolean;
  @OneToMany(() => Post, (post) => post.blog, { cascade: true })
  post: Post[];
}
