import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { TypeORMEntity } from '../../types/typeorm-entity';

@Injectable()
export class DataSourceRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  // ***** TypeORM data source manager SAVE *****
  ///TypeORMEntity
  async save(entity: TypeORMEntity): Promise<TypeORMEntity> {
    return this.dataSource.manager.save(entity);
  }
}
