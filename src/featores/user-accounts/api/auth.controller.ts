import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../application/users.service';
import { AuthService } from '../application/auth.service';
import {
  ConfirmationCodeInputDto,
  CreateUserInputDto,
  EmailResendingInputDto,
  NewPasswordInputDto,
  RecoveryPasswordInputDto,
} from './input-dto/users.input-dto';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { ExtractUserFromRequest } from '../guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import { MeViewDto } from './view-dto/users.view-dto';
import { AuthQueryRepository } from '../infrastructure/query/auth.query-repository';
import { Response, Request } from 'express';
import { RefreshTokenGuard } from '../guards/refresh-token.guard';
import { LoginUseCase, LoginUseCommand } from '../use-cases/loginUseCase';
import { CommandBus } from '@nestjs/cqrs';
import { ChangePasswordCommand } from '../use-cases/changePasswordUseCase';
import { ConfirmEmailCommand } from '../use-cases/confirmEmailUseCase';
import { LogoutUseCommand } from '../use-cases/logoutUseCase';
import { SendPasswordRecoveryCodeCommand } from '../use-cases/sendPasswordRecoveryCode';
import { ResendConfirmationCodeCommand } from '../use-cases/resendConfirmationUseCase';
import { RefreshTokenCommand } from '../use-cases/refreshTokenUseCase';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private authQueryRepository: AuthQueryRepository,
    private loginUseCase: LoginUseCase,
    private commandBus: CommandBus,
  ) {}
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration')
  registration(@Body() body: CreateUserInputDto): Promise<void> {
    return this.usersService.registerUser(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(
    @ExtractUserFromRequest() user: UserContextDto,
    @Res() response: Response,
    @Req() request: Request,
  ): Promise<void> {
    const ip = request.ip!;
    const userAgent = request.headers['user-agent'] || 'unknown';
    const loginDto = {
      userId: user.id,
      ip,
      userAgent,
    };
    const tokens = await this.commandBus.execute(new LoginUseCommand(loginDto));
    response
      .cookie('refreshToken', tokens.refreshToken, {
        secure: true,
        httpOnly: true,
      })
      .json({ accessToken: tokens.accessToken });
  }

  @Post('logout')
  @UseGuards(RefreshTokenGuard)
  async logout(
    @Res() response: Response,
    @Req() request: Request,
  ): Promise<void> {
    await this.commandBus.execute(
      new LogoutUseCommand(request.cookies.refreshToken),
    );
    response.clearCookie('refreshToken').sendStatus(204);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@ExtractUserFromRequest() user: UserContextDto): Promise<MeViewDto> {
    return this.authQueryRepository.me(user.id);
  }
  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  passwordRecovery(
    /*@Request() req: any*/
    @Body() body: RecoveryPasswordInputDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new SendPasswordRecoveryCodeCommand(body.email),
    );
  }
  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  newPassword(
    /*@Request() req: any*/
    @Body() body: NewPasswordInputDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new ChangePasswordCommand(body.recoveryCode, body.newPassword),
    );
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  registrationConfirmation(
    /*@Request() req: any*/
    @Body() body: ConfirmationCodeInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new ConfirmEmailCommand(body.code));
  }
  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  registrationEmailResending(
    /*@Request() req: any*/
    @Body() body: EmailResendingInputDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new ResendConfirmationCodeCommand(body.email),
    );
  }
  @HttpCode(200)
  @Post('refresh-token')
  @UseGuards(RefreshTokenGuard)
  async refreshToken(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const ip = request.ip!;
    const cookieRefreshToken = request.cookies.refreshToken;
    const newTokens = await this.commandBus.execute(
      new RefreshTokenCommand(ip, cookieRefreshToken),
    );
    response
      .cookie('refreshToken', newTokens.refreshToken, {
        secure: true,
        httpOnly: true,
      })
      .json({ accessToken: newTokens.accessToken });
  }
}
