import { Body, Controller, Get, NotFoundException, Param, Post, Query, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { ListingsService } from './listings.service';
import { CreateMessageDto } from 'src/message/dto/create-message.dto';
import { UploadListingDto, UploadListingResponse } from './dto/upload-listing.dto';

@Controller('listings')
// @UseGuards(AuthGuard('jwt')) // Aktiviert JWT-Authentifizierung
export class ListingController {
  constructor(private readonly listingService: ListingsService) {}

  // @Post('process')
  // @UseGuards(AuthGuard('jwt'))
  // @UsePipes(new ValidationPipe()) // Validierung der DTO-Daten
  // async processListing(
  //   @Body() createListingDto: CreateListingDto,
  //   @Req() req: any, // Zugriff auf den authentifizierten Benutzer
  // ) {
  //   // Authentifizierter Benutzer
  //   const userId = req.user.id;

  //   // Endpunkt-Service aufrufen
  //   const listing = await this.listingService.processListingLink(
  //     userId,
  //     createListingDto.link,
  //     createListingDto.prompt,
  //   );

  //   return { success: true, listing };
  // }

  // @Post('contact/:contactId')
  // @UseGuards(AuthGuard('jwt'))
  // async contactUser(
  //   @Param('contactId') contactId: string,
  //   @Body() messageDto: CreateMessageDto,
  //   @Req() req: any,
  // ) {
  //   const senderId = req.user.id;
  //   const recipient = await this.listingService.(contactId);
  
  //   if (!recipient) {
  //     throw new NotFoundException('Recipient not found');
  //   }
  
  //   const message = await this.messageService.sendMessage(senderId, recipient.id, messageDto.content);
  //   return { success: true, message };
  // }

  @Post('upload')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('images', 10)) // Max 10 images
  async uploadListing(
    @Body() uploadListingDto: UploadListingDto,
    @UploadedFiles() images: Express.Multer.File[],
    @Req() req: any,
  ): Promise<UploadListingResponse> {
    const userId = req.user.id;
    return this.listingService.uploadListing(uploadListingDto, userId, images);
  }
  
  @Get()
  async getAllListings(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const listings = await this.listingService.getAllListings(page, limit);
    return { success: true, listings };
  }

  @Get('published')
  async getPublishedListings(@Query('limit') limit = 20) {
    const listings = await this.listingService.getPublishedListings(limit);
    return { success: true, listings };
  }

  @Get('featured')
  async getFeaturedListings(@Query('limit') limit = 6) {
    const listings = await this.listingService.getFeaturedListings(limit);
    return { success: true, listings };
  }

  @Get('user/:userId')
  async getUserListings(@Param('userId') userId: string) {
    const listings = await this.listingService.getUserListings(userId);
    console.log(listings)
    return { success: true, listings };
  }

  @Get('user')
  @UseGuards(AuthGuard('jwt'))
  async getUserListingsWithLimit(
    @Req() req: any, // req enthält die Daten aus dem AuthGuard
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const userId = req.user.id; // Extrahiere die Benutzer-ID aus req.user

    const listings = await this.listingService.getUserListingsWithLimit(
      userId,
      page,
      limit,
    );
    return { success: true, listings };
  }
}
