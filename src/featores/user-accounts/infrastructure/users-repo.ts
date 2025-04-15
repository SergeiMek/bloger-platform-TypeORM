import { Injectable, NotFoundException } from '@nestjs/common';
import { UserDocument, UserEntity } from '../domain/user.entity';
import { NotFoundDomainException } from '../../../core/exceptions/domain-exceptions';
import { DeepPartial, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersRepo {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async findById(id: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return user;
  }

  async deleteUser(id: string): Promise<any> {
    const result = await this.usersRepository.delete(id);
    return result.affected !== 0;
  }

  async createUser(dto: DeepPartial<UserEntity>): Promise<UserDocument> {
    return await this.usersRepository.save(dto);
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | any> {
    return await this.usersRepository.findOne({
      where: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
  }

  async updateConfirmationCode(
    code: string,
    userId: string,
    data: string,
  ): Promise<void> {
    const result = await this.usersRepository.update(userId, {
      confirmationCode: code,
      expirationData: data,
    });
    if (result.affected === 0) {
      throw NotFoundDomainException.create('error update confirmation code');
    }
  }

  async updatePasswordRecoveryData(
    expirationDateCode: string,
    recoveryCode: string,
    userId: string,
  ): Promise<void> {
    try {
      const result = await this.usersRepository.update(
        { id: userId },
        {
          recoveryCode,
          expirationDateCode,
        },
      );
      if (result.affected === 0) {
        throw NotFoundDomainException.create('error update password data');
      }
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
      await this.usersRepository.update(
        { id: userId },
        {
          passwordSalt,
          passwordHash,
        },
      );
    } catch (error) {
      throw NotFoundDomainException.create(error);
    }
  }

  async findUserByPasswordRecoveryCode(
    code: string,
  ): Promise<UserDocument | null> {
    try {
      return await this.usersRepository.findOne({
        where: { recoveryCode: code },
      });
    } catch (error) {
      throw NotFoundDomainException.create(error);
    }
  }

  async findUserByConfirmCode(code: string): Promise<UserDocument | null> {
    try {
      return await this.usersRepository.findOne({
        where: { confirmationCode: code },
      });
    } catch (error) {
      throw NotFoundDomainException.create(error);
    }
  }

  async updateConfirmationStatus(userId: string): Promise<void> {
    try {
      await this.usersRepository.update(
        { id: userId },
        {
          isConfirmed: true,
        },
      );
    } catch (error) {
      throw NotFoundDomainException.create(error);
    }
  }
}
