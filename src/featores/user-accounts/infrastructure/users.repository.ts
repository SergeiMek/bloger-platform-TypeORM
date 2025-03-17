import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserDocument } from '../domain/user.entity';
import {
  BadRequestDomainException,
  NotFoundDomainException,
} from '../../../core/exceptions/domain-exceptions';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class UsersRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async findById(id: string): Promise<UserDocument> {
    const result = await this.dataSource.query(
      `SELECT * FROM public."Users"
             WHERE "id" = $1`,
      [id],
    );
    return result[0];
  }
  async tests(id: string) {
    const result = await this.dataSource.query(
      `SELECT * FROM public."Users"
             WHERE "id" = $1`,
      [id],
    );
    return result;
  }
  async deleteUser(id: string): Promise<any> {
    try {
      const result = await this.dataSource.query(
        `DELETE FROM public."Users"
      WHERE "id"= $1;`,
        [id],
      );
      return result[1] === 1;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async createUser(dto: UserDocument): Promise<void> {
    try {
      await this.dataSource.query(`INSERT INTO public."Users"(
          login, email, "passwordHash", "confirmationCode", "expirationData", "isConfirmed", "recoveryCode", "expirationDateCode", id, "createdAt", "passwordSalt")
      VALUES ('${dto.login}', '${dto.email}', '${dto.passwordHash}', '${dto.confirmationCode}', '${dto.expirationData}', '${dto.isConfirmed}', '${dto.recoveryCode}', '${dto.expirationDateCode}', '${dto.id}', '${dto.createdAt}', '${dto.passwordSalt}')`);
    } catch (error: any) {
      throw BadRequestDomainException.create(error);
    }
  }
  async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | any> {
    try {
      const result = await this.dataSource.query(
        `SELECT * FROM public."Users"
            WHERE "login" LIKE $1 OR "email" LIKE $1; `,
        [`%${loginOrEmail}%`],
      );
      return result[0];
    } catch (error) {
      throw NotFoundDomainException.create(error);
    }
  }
  async updateConfirmationCode(code: string, userId: string): Promise<void> {
    try {
      const query = `
      UPDATE public."Users"
      SET "confirmationCode" = $1
      WHERE "id" = $2
    `;
      const values = [code, userId];
      await this.dataSource.query(query, values);
    } catch (error) {
      throw NotFoundDomainException.create(error);
    }
  }

  async updatePasswordRecoveryData(
    expirationDateCode: string,
    recoveryCode: string,
    userId: string,
  ): Promise<void> {
    try {
      const query = `
      UPDATE public."Users"
      SET "recoveryCode" = $1, "expirationDateCode" = $2
      WHERE "id" = $3
    `;
      const values = [recoveryCode, expirationDateCode, userId];
      await this.dataSource.query(query, values);
    } catch (error) {
      throw NotFoundDomainException.create(error);
    }
  }

  async updatePassword(
    userId: string,
    passwordSalt: string,
    passwordHash: string,
  ): Promise<void> {
    try {
      const query = `
      UPDATE public."Users"
      SET "passwordSalt" = $1, "passwordHash" = $2
      WHERE "id" = $3
    `;
      const values = [passwordSalt, passwordHash, userId];
      await this.dataSource.query(query, values);
    } catch (error) {
      throw NotFoundDomainException.create(error);
    }
  }
  async findUserByPasswordRecoveryCode(
    code: string,
  ): Promise<UserDocument | null> {
    try {
      const result = await this.dataSource.query(
        `SELECT * FROM public."Users"
             WHERE "recoveryCode" = $1`,
        [code],
      );
      return result[0];
    } catch (error) {
      throw NotFoundDomainException.create(error);
    }
  }
  async findUserByConfirmCode(code: string): Promise<UserDocument | null> {
    try {
      const result = await this.dataSource.query(
        `SELECT * FROM public."Users"
             WHERE "confirmationCode" = $1`,
        [code],
      );
      return result[0];
    } catch (error) {
      throw NotFoundDomainException.create(error);
    }
  }
  async updateConfirmationStatus(userId: string): Promise<void> {
    try {
      const query = `
      UPDATE public."Users"
      SET "isConfirmed" = $1
      WHERE "id" = $2
    `;
      const values = [true, userId];
      await this.dataSource.query(query, values);
    } catch (error) {
      throw NotFoundDomainException.create(error);
    }
  }
}
