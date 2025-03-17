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
