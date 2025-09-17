import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillboardService } from './billboard.service';
import { BillboardController } from './billboard.controller';
import { Billboard } from './entities/billboard.entity';
import { BillboardApplication } from './entities/billboard-application.entity';
import { BillboardInvitation } from './entities/billboard-invitation.entity';
import { BillboardComment } from './entities/billboard-comment.entity';
import { BillboardApplicationRepository } from './repositories/billboard-application.repository';
import { BillboardInvitationRepository } from './repositories/billboard-invitation.repository';
import { BillboardCommentRepository } from './repositories/billboard-comment.repository';
import { HashtagService } from './services/hashtag.service';
import { BillboardGateway } from './gateways/billboard.gateway';
import { ApplicationRateLimitMiddleware } from './middleware/application-rate-limit.middleware';
import { UsersModule } from '../users/users.module';
import { BillboardEmbeddingService } from './services/billboard-embedding.service';
import { CogneeIntegrationService } from './services/cognee-integration.service';
import { ImagesModule } from '../images/images.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Billboard,
      BillboardApplication,
      BillboardInvitation,
      BillboardComment
    ]),
    ConfigModule,
    UsersModule,
    ImagesModule
  ],
  controllers: [BillboardController],
  providers: [
    BillboardService,
    BillboardApplicationRepository,
    BillboardInvitationRepository,
    BillboardCommentRepository,
    HashtagService,
    BillboardGateway,
    BillboardEmbeddingService,
    CogneeIntegrationService,
  ],
  exports: [BillboardService, BillboardGateway],
})
export class BillboardModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApplicationRateLimitMiddleware)
      .forRoutes({ path: 'billboard/:id/apply', method: RequestMethod.POST });
  }
}