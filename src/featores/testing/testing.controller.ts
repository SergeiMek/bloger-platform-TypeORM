import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('testing')
export class AllDeleteController {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  @Delete('/all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async dropDB(): Promise<void> {
    /*await this.dataSource.query(`TRUNCATE TABLE  "Users"`);
    await this.dataSource.query(`TRUNCATE TABLE  "Devise"`);
    await this.dataSource.query(
      `DELETE FROM "Posts" WHERE "blogId" IN (SELECT "id" FROM "Blogs")`,
    );
    await this.dataSource.query(`DELETE FROM "Blogs"`);*/
    await this.dataSource.query(` DELETE FROM public."LikesForPosts"`);
    await this.dataSource.query(` DELETE FROM public."LikesForComments"`);
    await this.dataSource.query(` DELETE FROM public."Devise"`);
    await this.dataSource.query(` DELETE FROM public."Comments"`);
    await this.dataSource.query(` DELETE FROM public."Posts"`);
    await this.dataSource.query(` DELETE FROM public."Blogs"`);
    await this.dataSource.query(` DELETE FROM public."Users"`);
  }
}
