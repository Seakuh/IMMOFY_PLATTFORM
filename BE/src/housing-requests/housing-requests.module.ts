import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatbotModule } from '../chatbot/chatbot.module';
import { ImagesModule } from '../images/images.module';
import { UsersModule } from '../users/users.module';
import { VectorListingsModule } from '../vector-listings/vector-listings.module';
import { HousingRequest } from './entities/housing-request.entity';
import { HousingRequestsController } from './housing-requests.controller';
import { HousingRequestsService } from './housing-requests.service';
import { HousingRequestRepository } from './repositories/housing-request.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([HousingRequest]),
    ImagesModule,
    forwardRef(() => ChatbotModule),
    forwardRef(() => UsersModule),
    forwardRef(() => VectorListingsModule),
  ],
  controllers: [HousingRequestsController],
  providers: [HousingRequestsService, HousingRequestRepository],
  exports: [HousingRequestsService, HousingRequestRepository],
})
export class HousingRequestsModule {}