//dto для боди при создании юзера. Сюда могут быть добавлены декораторы swagger
import { IsString, IsUUID, Length, Matches } from 'class-validator';

export class CreateUserInputDto {
  @Matches('^[a-zA-Z0-9_-]*$')
  @Length(3, 10)
  login: string;
  @Length(6, 20)
  password: string;
  @Matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  email: string;
}

export class userIdDto {
  @IsUUID()
  id: string;
}

export class LoginInputDto {
  @IsString()
  loginOrEmail: string;
  @IsString()
  password: string;
}

export class RecoveryPasswordInputDto {
  @Matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  @IsString()
  email: string;
}

export class NewPasswordInputDto {
  @IsString()
  @Length(6, 20)
  newPassword: string;
  @IsString()
  recoveryCode: string;
}

export class ConfirmationCodeInputDto {
  @IsString()
  code: string;
}
export class EmailResendingInputDto {
  @Matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  @IsString()
  email: string;
}
