import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserContextController } from './controllers/user-context.controller';
import { UserContext } from './entities/user-context.entity';
import { UserContextService } from './services/user-context.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserContext])],
  controllers: [UserContextController],
  providers: [UserContextService],
  exports: [UserContextService],
})
export class UserContextModule {}
