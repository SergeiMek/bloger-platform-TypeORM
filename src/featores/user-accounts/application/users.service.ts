import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import bcrypt from 'bcrypt';

import { v4 as uuidv4 } from 'uuid';
import { UsersRepository } from '../infrastructure/users.repository';
import { EmailService } from '../../notifications/email.service';
import {
  BadRequestDomainException,
  NotFoundDomainException,
} from '../../../core/exceptions/domain-exceptions';

@Injectable()
export class UsersService {
  constructor(
    // @InjectModel(User.name)
    // private UserModel: UserModelType,
    private usersRepository: UsersRepository,
    private emailService: EmailService,
  ) {}

  async createUser(dto: CreateUserDto) {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, passwordSalt);
    const userLogin = await this.usersRepository.findByLoginOrEmail(dto.login);
    const userEmail = await this.usersRepository.findByLoginOrEmail(dto.email);
    if (userEmail) {
      throw BadRequestDomainException.create(
        'the user already exists',
        'email',
      );
    }
    if (userLogin) {
      throw BadRequestDomainException.create(
        'the user already exists',
        'login',
      );
    }

    const user = {
      id: uuidv4(),
      login: dto.login,
      email: dto.email,
      passwordHash: passwordHash,
      createdAt: new Date().toISOString(),
      confirmationCode: null,
      expirationData: null,
      isConfirmed: false,
      recoveryCode: null,
      expirationDateCode: null,
      passwordSalt,
    };
    await this.usersRepository.createUser(user);
    return user.id;
  }
  async deleteUser(id: string) {
    const result = await this.usersRepository.deleteUser(id);
    if (!result) {
      throw NotFoundDomainException.create('id');
    }
  }
  async registerUser(dto: CreateUserDto): Promise<any> {
    const findUserByLogin = await this.usersRepository.findByLoginOrEmail(
      dto.login,
    );
    const findUserByEmail = await this.usersRepository.findByLoginOrEmail(
      dto.email,
    );
    if (findUserByEmail) {
      throw BadRequestDomainException.create(
        'the user already exists',
        'email',
      );
    }
    if (findUserByLogin) {
      throw BadRequestDomainException.create(
        'the user already exists',
        'login',
      );
    }
    const confirmCode = uuidv4();
    const createdUserId = await this.createUser(dto);
    const user = await this.usersRepository.findById(createdUserId);
    await this.usersRepository.updateConfirmationCode(
      confirmCode,
      createdUserId,
    );
    try {
      await this.emailService.sendRegistrationEmail(dto.email, confirmCode);
    } catch {
      await this.usersRepository.deleteUser(user.id);
      throw BadRequestDomainException.create('letter not sent');
    }
  }
}
