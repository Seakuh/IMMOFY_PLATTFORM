import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from 'src/mail/mail.module';
import { AuthModule } from '../auth/auth.module';
import { User } from './entities/user.entity';
import { UserManagementService } from './services/user-management.service';
import { UsersController } from './users.controller';
import { UserRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  imports: [
    MailModule,
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, UserRepository, UserManagementService],
  exports: [UsersService, UserRepository, UserManagementService],
})
export class UsersModule {}
