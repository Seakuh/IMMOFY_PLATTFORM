import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from 'src/message/entities/message.entity';
import { MessageThread } from 'src/message/entities/message-thread.entity';
import { User } from 'src/users/entities/user.entity';
import { VectorListingsModule } from 'src/vector-listings/vector-listings.module';
import { ChatbotModule } from 'src/chatbot/chatbot.module';
import { ImagesModule } from 'src/images/images.module';
import { UsersModule } from 'src/users/users.module';
import { Listing } from './entities/listing.entity';
import { ListingController } from './listings.controller';
import { ListingsService } from './listings.service';
import { ListingRepository } from './repositories/listing.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Listing, Message, MessageThread, User]), 
    forwardRef(() => VectorListingsModule),
    forwardRef(() => ChatbotModule),
    forwardRef(() => ImagesModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [ListingController],
  providers: [ListingsService, ListingRepository],
  exports: [ListingsService, ListingRepository],
})
export class ListingsModule {}
