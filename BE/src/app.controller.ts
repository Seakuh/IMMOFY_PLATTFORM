import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { HousingRequestsService } from './housing-requests/housing-requests.service';
import { ListingsService } from './listings/listings.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly listingsService: ListingsService,
    private readonly housingRequestsService: HousingRequestsService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Homepage endpoint with featured content
   */
  @Get('homepage')
  async getHomepage() {
    try {
      // Get featured listings and recent housing requests
      const [featuredListings, recentListings, recentHousingRequests] =
        await Promise.all([
          this.listingsService.getFeaturedListings(6),
          this.listingsService.getPublishedListings(12),
          this.housingRequestsService
            .findAll()
            .then((requests) => requests.slice(0, 8)),
        ]);

      return {
        success: true,
        data: {
          featuredListings,
          recentListings,
          recentHousingRequests,
          stats: {
            totalListings: recentListings.length,
            totalHousingRequests: recentHousingRequests.length,
            featuredCount: featuredListings.length,
          },
        },
      };
    } catch (error) {
      console.error('Error loading homepage data:', error);
      return {
        success: false,
        message: 'Failed to load homepage data',
        error: error.message,
      };
    }
  }

  /**
   * API status endpoint
   */
  @Get('health')
  async getHealth() {
    return {
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
