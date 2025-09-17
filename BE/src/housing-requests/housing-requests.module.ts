import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatbotModule } from '../chatbot/chatbot.module';
import { ImagesModule } from '../images/images.module';
import { UsersModule } from '../users/users.module';
import { VectorListingsModule } from '../vector-listings/vector-listings.module';
import { HousingRequest } from './entities/housing-request.entity';
import { HousingEmbeddingService } from './services/housing-embedding.service';
import { HousingCogneeIntegrationService } from './services/cognee-integration.service';
import { BillboardModule } from '../billboard/billboard.module';
import { HousingRequestsController } from './housing-requests.controller';
import { HousingRequestsService } from './housing-requests.service';
import { HousingRequestRepository } from './repositories/housing-request.repository';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([HousingRequest]),
    ImagesModule,
    forwardRef(() => ChatbotModule),
    forwardRef(() => UsersModule),
    forwardRef(() => VectorListingsModule),
    forwardRef(() => BillboardModule),
  ],
  controllers: [HousingRequestsController],
  providers: [
    HousingRequestsService,
    HousingRequestRepository,
    HousingEmbeddingService,
    HousingCogneeIntegrationService,
  ],
  exports: [HousingRequestsService, HousingRequestRepository],
})
export class HousingRequestsModule {}
