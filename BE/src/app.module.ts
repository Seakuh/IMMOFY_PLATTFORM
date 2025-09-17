import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BillboardModule } from './billboard/billboard.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { HousingRequestsModule } from './housing-requests/housing-requests.module';
import { ImagesModule } from './images/images.module';
import { ListingsModule } from './listings/listings.module';
import { MailModule } from './mail/mail.module';
import { MessagesModule } from './message/messages.module';
import { UserContextModule } from './user-context/user-context.module';
import { UsersModule } from './users/users.module';
import { VectorListingsModule } from './vector-listings/vector-listings.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mongodb',
        url: configService.get<string>('MONGODB_URI'),
        useUnifiedTopology: true,
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    MailerModule.forRoot({
      transport: {
        host: 'w014770a.kasserver.com',
        port: 587, // STARTTLS
        secure: false, // STARTTLS erfordert secure=false
        auth: {
          user: 'home-finder@guruhub-ai.com',
          pass: 'uzi8Xc6JFKEFhsxobSio',
        },
      },
      defaults: {
        from: '"GuruHub" <home-finder@guruhub-ai.com>', // Korrekte Absenderadresse
      },
    }),
    AuthModule,
    UsersModule,
    ChatbotModule,
    MailModule,
    MessagesModule,
    UserContextModule,
    ListingsModule,
    VectorListingsModule,
    ImagesModule,
    HousingRequestsModule,
    BillboardModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
