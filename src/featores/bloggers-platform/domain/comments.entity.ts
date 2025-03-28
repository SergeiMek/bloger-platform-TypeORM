import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from './posts.entity';
import { LikesForComment } from './commentsLike.entity';

export type CommentDocument = {
  id: string;
  userId: string;
  userLogin: string;
  createdAt: Date;
  //postId: string;
  content: string;
};

export type CommentDocumentSQL = {
  id: string;
  userId: string;
  userLogin: string;
  createdAt: string;
  postId: string;
  content: string;
  likesCount: string;
  dislikesCount: string;
};

export class pushLike {}

export type likeCountType = {
  likesCount: number;
  dislikesCount: number;
};

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  userId: string;
  @Column({ nullable: false })
  userLogin: string;

  @Column({ type: 'varchar', width: 300 })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Post, (post) => post.comment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  post: Post;

  @OneToMany(
    () => LikesForComment,
    (likesForComment) => likesForComment.comment,
    { cascade: true },
  )
  commentLike: LikesForComment[];
}
