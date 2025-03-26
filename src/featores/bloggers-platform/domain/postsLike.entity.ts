import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from './posts.entity';

enum Like {
  NONE = 'None',
  LIKE = 'Like',
  DISLIKE = 'Dislike',
}

@Entity('likesForPost')
export class LikesForPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  addedAt: Date;

  @Column({ nullable: false, type: 'varchar' })
  userId: string;

  @Column({ type: 'varchar', nullable: false })
  userLogin: string;

  @CreateDateColumn({ type: 'enum', enum: Like, default: Like.NONE })
  likeStatus: string;

  @ManyToOne(() => Post, (post) => post.postLike, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  post: Post;
}
