import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  CreateHousingRequestDto,
  OnboardingResponse,
} from './dto/create-housing-request.dto';
import { UpdateHousingRequestDto } from './dto/update-housing-request.dto';
import { HousingRequestsService } from './housing-requests.service';

@Controller('housing-requests')
export class HousingRequestsController {
  constructor(
    private readonly housingRequestsService: HousingRequestsService,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images', 10)) // Max 10 images
  async create(
    @Body() createHousingRequestDto: CreateHousingRequestDto,
    @UploadedFiles() images: Express.Multer.File[],
  ): Promise<OnboardingResponse> {
    return this.housingRequestsService.create(createHousingRequestDto, images);
  }

  @Get()
  async findAll() {
    return this.housingRequestsService.findAll();
  }

  @Get('homepage')
  async getHomepage() {
    return this.housingRequestsService.getHomepageData();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.housingRequestsService.findOne(id);
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return this.housingRequestsService.findByUser(userId);
  }

  @Get('email/:email')
  async findByEmail(@Param('email') email: string) {
    return this.housingRequestsService.findByEmail(email);
  }

  @Get(':id/similar')
  async findSimilar(@Param('id') id: string, @Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit, 10) : 5;
    return this.housingRequestsService.findSimilarWithVectors(id, limitNumber);
  }

  @Get(':id/recommend-billboards')
  async recommendBillboards(
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ) {
    const limitNumber = limit ? parseInt(limit, 10) : 6;
    return this.housingRequestsService.recommendBillboardsForRequest(id, limitNumber);
  }

  @Post('search-similar')
  async searchSimilar(
    @Body() searchParams: {
      description: string;
      priceRange?: { min: number; max: number };
      location?: string;
      propertyType?: string;
      limit?: number;
    }
  ) {
    const limit = searchParams.limit || 10;
    return this.housingRequestsService.searchSimilarByDescription(
      searchParams.description,
      searchParams.priceRange,
      searchParams.location,
      searchParams.propertyType,
      limit
    );
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images', 10)) // Allow new image uploads
  async update(
    @Param('id') id: string,
    @Body() updateHousingRequestDto: UpdateHousingRequestDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    return this.housingRequestsService.update(
      id,
      updateHousingRequestDto,
      images,
    );
  }
}
