import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        //host: 'smtp.example.com', // Замените на ваш SMTP-сервер
        service: 'Mail.ru',
        //port: 587, // Обычно 587 для TLS
        //secure: false, // true для 465, false для других портов
        auth: {
          user: process.env.EMAIL, // Ваш email
          pass: process.env.PASSWORD, // Ваш пароль
        },
      },
      defaults: {
        from: '"Your Name" gromoj956@mail.ru',
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class NotificationsModule {}
