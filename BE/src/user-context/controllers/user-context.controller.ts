import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserContextService } from '../services/user-context.service';

@Controller('user-context')
export class UserContextController {
  constructor(private readonly userContextService: UserContextService) {}

  @Post()
  async saveContext(
    @Body() body: { userId: string; contextData: Record<string, any> },
  ) {
    const result = await this.userContextService.saveContext(
      body.userId,
      body.contextData,
    );
    return { success: true, data: result };
  }

  @Get(':userId')
  async getContext(@Param('userId') userId: string) {
    const context = await this.userContextService.getContext(userId);
    return { context };
  }

  @Get(':userId')
  async getUserContext(@Param('userId') userId: string) {
    const context = await this.userContextService.getContext(userId);
    return { success: true, data: context };
  }

  @Patch(':userId')
  @UseGuards(AuthGuard('jwt'))
  async updateField(
    @Param('userId') userId: string,
    @Body() body: { field: string; value: any },
  ) {
    console.log('Updating field:', body.field, 'with value:', body.value);

    const updatedContext = await this.userContextService.updateField(
      userId,
      body.field,
      body.value,
    );
    return { success: true, data: updatedContext };
  }

  @Get(':userId/history')
  async getContextHistory(@Param('userId') userId: string) {
    const contexts = await this.userContextService.getContextHistory(userId);
    return { success: true, history: contexts };
  }
}
