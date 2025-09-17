import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  Put,
  ValidationPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BillboardService } from './billboard.service';
import { HousingRequestsService } from '../housing-requests/housing-requests.service';
import { CreateBillboardDto } from './dto/create-billboard.dto';
import { UpdateBillboardDto } from './dto/update-billboard.dto';
import { BillboardFilterDto } from './dto/billboard-filter.dto';
import { BillboardSearchDto } from './dto/billboard-search.dto';
import { CreateBillboardFromAiDto } from './dto/create-billboard-from-ai.dto';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationStatusDto } from './dto/update-invitation-status.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ApplicationStatus } from './entities/billboard-application.entity';
import { InvitationStatus } from './entities/billboard-invitation.entity';
import { CreateBulletinListingDto, BulletinListing } from './dto/create-bulletin-listing.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadedFiles, UseInterceptors } from '@nestjs/common';

@Controller('billboard')
export class BillboardController {
  constructor(
    private readonly billboardService: BillboardService,
    private readonly housingRequestsService: HousingRequestsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createBillboardDto: CreateBillboardDto, @Req() req: any) {
    const userId = req.user.id;
    const billboard = await this.billboardService.create(createBillboardDto, userId);
    return {
      success: true,
      message: 'Billboard created successfully',
      billboard,
    };
  }

  @Post('bulletin')
  @UseInterceptors(FilesInterceptor('images', 20)) // Max 20 images
  async createBulletinListing(
    @Body() bulletinDto: CreateBulletinListingDto,
    @UploadedFiles() images: Express.Multer.File[],
    @Req() req?: any,
  ): Promise<BulletinListing> {
    // Use userId from request if authenticated, otherwise from body
    const userId = req?.user?.id || bulletinDto.userId;

    return this.billboardService.createBulletinListing(
      bulletinDto,
      images,
      userId,
    );
  }

  @Get()
  async findAll(@Query(new ValidationPipe({ transform: true })) filters: BillboardFilterDto) {
    const result = await this.billboardService.findAll(filters);
    return {
      success: true,
      ...result,
    };
  }

  @Get('search')
  async search(@Query(new ValidationPipe({ transform: true })) searchDto: BillboardSearchDto) {
    const result = await this.billboardService.search(searchDto);
    return {
      success: true,
      ...result,
    };
  }

  @Get('search/similar')
  async searchSimilar(
    @Query('q') query: string,
    @Query('limit') limit: string = '10',
  ) {
    if (!query) {
      return {
        success: false,
        message: 'Query parameter is required',
        billboards: [],
      };
    }

    const limitNum = parseInt(limit);
    const billboards = await this.billboardService.searchSimilarBillboards(query, limitNum);

    return {
      success: true,
      message: 'Similar billboards found',
      billboards,
      total: billboards.length,
    };
  }

  @Get(':id/recommend-applicants')
  async recommendApplicants(
    @Param('id') billboardId: string,
    @Query('limit') limit: string = '5',
  ) {
    const billboard = await this.billboardService.findOne(billboardId);
    const queryText = [billboard.title, billboard.description, billboard.content]
      .filter(Boolean)
      .join('\n');

    const result = await this.housingRequestsService.searchSimilarByDescription(
      queryText,
      undefined,
      billboard.location || billboard.city,
      undefined,
      parseInt(limit, 10) || 5,
    );

    return {
      success: true,
      applicants: result.results,
      total: result.results.length,
    };
  }

  @Get('my-listings')
  @UseGuards(JwtAuthGuard)
  async getMyListings(
    @Req() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const userId = req.user.id;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    const result = await this.billboardService.findUserBillboards(userId, pageNum, limitNum);
    return {
      success: true,
      ...result,
    };
  }

  @Get('stats')
  async getStats() {
    const stats = await this.billboardService.getStats();
    return {
      success: true,
      stats,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const billboard = await this.billboardService.findOne(id);
    return {
      success: true,
      billboard,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateBillboardDto: UpdateBillboardDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    const billboard = await this.billboardService.update(id, updateBillboardDto, userId);
    return {
      success: true,
      message: 'Billboard updated successfully',
      billboard,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    const result = await this.billboardService.remove(id, userId);
    return {
      success: true,
      ...result,
    };
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async toggleLike(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    const result = await this.billboardService.toggleLike(id, userId);
    return {
      success: true,
      message: result.liked ? 'Billboard liked' : 'Billboard unliked',
      ...result,
    };
  }

  @Post(':id/view')
  @HttpCode(HttpStatus.OK)
  async incrementView(@Param('id') id: string) {
    const result = await this.billboardService.incrementView(id);
    return {
      success: true,
      message: 'View count incremented',
      ...result,
    };
  }

  // Additional utility endpoints

  @Post('deactivate-expired')
  @UseGuards(JwtAuthGuard) // You might want to restrict this to admin users
  async deactivateExpired() {
    const count = await this.billboardService.deactivateExpiredBillboards();
    return {
      success: true,
      message: `${count} expired billboards deactivated`,
      count,
    };
  }

  @Get(':id/similar')
  async findSimilar(@Param('id') id: string, @Query('limit') limit: string = '10') {
    // This is a placeholder for similar billboard functionality
    // You might want to implement this based on location, category, price range, etc.
    const billboard = await this.billboardService.findOne(id);
    const filters = new BillboardFilterDto();
    filters.category = billboard.category;
    filters.city = billboard.city;
    filters.limit = parseInt(limit);
    
    const result = await this.billboardService.findAll(filters);
    // Filter out the current billboard
    result.billboards = result.billboards.filter(b => b.id !== id);
    
    return {
      success: true,
      message: 'Similar billboards found',
      ...result,
    };
  }

  @Post('from-ai')
  @UseGuards(JwtAuthGuard)
  async createFromAiAnalysis(
    @Body() createBillboardFromAiDto: CreateBillboardFromAiDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    const billboard = await this.billboardService.createFromAiAnalysis(createBillboardFromAiDto, userId);
    return {
      success: true,
      message: 'Billboard created from AI analysis successfully',
      billboard,
    };
  }

  @Get('drafts')
  @UseGuards(JwtAuthGuard)
  async getDrafts(
    @Req() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const userId = req.user.id;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    const result = await this.billboardService.findUserDrafts(userId, pageNum, limitNum);
    return {
      success: true,
      ...result,
    };
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async publishDraft(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    const billboard = await this.billboardService.publishDraft(id, userId);
    return {
      success: true,
      message: 'Billboard published successfully',
      billboard,
    };
  }

  // Application Endpoints

  @Post(':id/apply')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async applyToBillboard(
    @Param('id') billboardId: string,
    @Body() applicationDto: CreateApplicationDto,
    @Req() req: any,
  ) {
    const applicantId = req.user.id;
    const application = await this.billboardService.applyToBillboard(billboardId, applicantId, applicationDto);
    return {
      success: true,
      message: 'Application submitted successfully',
      application,
    };
  }

  @Get(':id/applications')
  @UseGuards(JwtAuthGuard)
  async getBillboardApplications(
    @Param('id') billboardId: string,
    @Query('status') status: ApplicationStatus,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    const applications = await this.billboardService.getBillboardApplications(billboardId, userId, status);
    return {
      success: true,
      applications,
    };
  }

  @Get('applications/my')
  @UseGuards(JwtAuthGuard)
  async getMyApplications(
    @Query('status') status: ApplicationStatus,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    const applications = await this.billboardService.getUserApplications(userId, status);
    return {
      success: true,
      applications,
    };
  }

  @Put('applications/:applicationId/status')
  @UseGuards(JwtAuthGuard)
  async updateApplicationStatus(
    @Param('applicationId') applicationId: string,
    @Body() statusDto: UpdateApplicationStatusDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    const application = await this.billboardService.updateApplicationStatus(applicationId, statusDto.status, userId);
    return {
      success: true,
      message: 'Application status updated successfully',
      application,
    };
  }

  // Invitation Endpoints

  @Post(':id/invite')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async sendInvitation(
    @Param('id') billboardId: string,
    @Body() invitationDto: CreateInvitationDto,
    @Req() req: any,
  ) {
    const inviterId = req.user.id;
    const invitation = await this.billboardService.sendInvitation(billboardId, inviterId, invitationDto);
    return {
      success: true,
      message: 'Invitation sent successfully',
      invitation,
    };
  }

  @Get('invitations/my')
  @UseGuards(JwtAuthGuard)
  async getMyInvitations(
    @Query('status') status: InvitationStatus,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    const invitations = await this.billboardService.getUserInvitations(userId, status);
    return {
      success: true,
      invitations,
    };
  }

  @Put('invitations/:invitationId/status')
  @UseGuards(JwtAuthGuard)
  async updateInvitationStatus(
    @Param('invitationId') invitationId: string,
    @Body() statusDto: UpdateInvitationStatusDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    const invitation = await this.billboardService.updateInvitationStatus(invitationId, statusDto.status, userId);
    return {
      success: true,
      message: 'Invitation status updated successfully',
      invitation,
    };
  }

  // Comment Endpoints

  @Post(':id/comment')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async addComment(
    @Param('id') billboardId: string,
    @Body() commentDto: CreateCommentDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    const comment = await this.billboardService.addComment(billboardId, userId, commentDto);
    return {
      success: true,
      message: 'Comment added successfully',
      comment,
    };
  }

  @Get(':id/comments')
  async getBillboardComments(
    @Param('id') billboardId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const result = await this.billboardService.getBillboardComments(billboardId, pageNum, limitNum);
    return {
      success: true,
      ...result,
    };
  }

  @Delete('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Param('commentId') commentId: string,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    await this.billboardService.deleteComment(commentId, userId);
    return {
      success: true,
      message: 'Comment deleted successfully',
    };
  }

  // Maintenance Endpoints

  @Post('maintenance/expire-invitations')
  @UseGuards(JwtAuthGuard) // You might want to restrict this to admin users
  async expireInvitations() {
    const count = await this.billboardService.markExpiredInvitations();
    return {
      success: true,
      message: `${count} expired invitations marked`,
      count,
    };
  }

  @Post('maintenance/deadline-reminders')
  @UseGuards(JwtAuthGuard) // You might want to restrict this to admin users
  async sendDeadlineReminders() {
    await this.billboardService.sendDeadlineReminders();
    return {
      success: true,
      message: 'Deadline reminders sent',
    };
  }
}
