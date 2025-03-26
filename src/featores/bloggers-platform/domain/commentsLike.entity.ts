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
import { Comment } from './comments.entity';

export type CommentDocument = {
  id: string;
  userId: string;
  userLogin: string;
  createdAt: string;
  postId: string;
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

export class CommentsBDTypeClass {
  constructor(
    public id: string,
    public content: string,
    public createdAt: string,
    public postId: string,
    public userId: string,
    public userLogin: string,
  ) {}
}

export type likeCountType = {
  likesCount: number;
  dislikesCount: number;
};

enum Like {
  NONE = 'None',
  LIKE = 'Like',
  DISLIKE = 'Dislike',
}

@Entity('comments')
export class LikesForComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  userId: string;
  @Column({ nullable: false })
  userLogin: string;

  @Column({ type: 'varchar', width: 300 })
  content: string;

  @CreateDateColumn({ type: 'enum', enum: Like, default: Like.NONE })
  likeStatus: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Comment, (comment) => comment.commentLike, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  comment: Comment;
}
