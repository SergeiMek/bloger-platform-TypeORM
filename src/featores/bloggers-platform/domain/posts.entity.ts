import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blog } from './blogs.entity';
import { LikesForPost } from './postsLike.entity';
import { Comment } from './comments.entity';

export type PostDocument = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  //blogId: string;
  //blogName: string;
  createdAt: Date;
};

export class newerLike {
  addedAt: string;
  login: string;
  // id: string;
  //likeStatus: string;
  userId: string;
}

export type PostDocumentSQL = {
  p_id: string;
  p_title: string;
  p_shortDescription: string;
  p_content: string;
  b_id: string;
  b_name: string;
  p_created_at: string;
  likesCount: string;
  dislikesCount: string;
};

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', width: 30 })
  title: string;

  @Column({ type: 'varchar', width: 100 })
  shortDescription: string;

  @Column({ type: 'varchar', width: 1000 })
  content: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @ManyToOne(() => Blog, (blog) => blog.post, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  blog: Blog;

  @OneToMany(() => Comment, (comment) => comment.post, { cascade: true })
  comment: Comment[];

  @OneToMany(() => LikesForPost, (likesForPost) => likesForPost.post, {
    cascade: true,
  })
  postLike: LikesForPost[];
}
