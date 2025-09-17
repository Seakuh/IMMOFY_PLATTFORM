import { forwardRef, Module } from '@nestjs/common';
import { ChatbotModule } from 'src/chatbot/chatbot.module';
import { VectorListingsController } from './vector-listings.controller';
import { VectorListingsService } from './vector-listings.service';

@Module({
  imports: [forwardRef(() => ChatbotModule)],
  providers: [VectorListingsService],
  controllers: [VectorListingsController],
  exports: [VectorListingsService],
})
export class VectorListingsModule {}
