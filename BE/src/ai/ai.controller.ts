import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService, ImageAnalysisResult } from './ai.service';
import { BillboardService } from '../billboard/billboard.service';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly billboardService: BillboardService,
  ) {}

  @Post('analyze-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/^image\/(jpeg|jpg|png|webp)$/)) {
          return callback(
            new BadRequestException('Only image files are allowed (JPEG, PNG, WebP)'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async analyzeImage(
    @UploadedFile() file: any,
    @Req() req: any,
  ): Promise<{
    success: boolean;
    message: string;
    analysis: ImageAnalysisResult;
    userId: string;
  }> {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const userId = req.user.id;

    try {
      const analysis = await this.aiService.analyzeImage(file.buffer, file.originalname);

      return {
        success: true,
        message: 'Image analyzed successfully',
        analysis,
        userId,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to analyze image: ${error.message}`);
    }
  }

  @Post('analyze-and-create-draft')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/^image\/(jpeg|jpg|png|webp)$/)) {
          return callback(
            new BadRequestException('Only image files are allowed (JPEG, PNG, WebP)'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async analyzeImageAndCreateDraft(
    @UploadedFile() file: any,
    @Req() req: any,
  ): Promise<{
    success: boolean;
    message: string;
    analysis: ImageAnalysisResult;
    draft: any;
  }> {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const userId = req.user.id;

    try {
      // Analyze the image
      const analysis = await this.aiService.analyzeImage(file.buffer, file.originalname);

      // Create draft billboard from analysis
      const draft = await this.billboardService.createFromAiAnalysis(analysis, userId);

      return {
        success: true,
        message: 'Image analyzed and draft billboard created successfully',
        analysis,
        draft,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to analyze image and create draft: ${error.message}`);
    }
  }
}