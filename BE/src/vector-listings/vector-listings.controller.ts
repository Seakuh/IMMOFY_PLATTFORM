import { Body, Controller, Post } from '@nestjs/common';
import { VectorListingsService } from './vector-listings.service';

@Controller('vector-listings')
export class VectorListingsController {
  constructor(private readonly vectorListingsService: VectorListingsService) {}

  @Post('add')
  async addListing(@Body() body: any) {
    const { listing } = body; // Embedding wird vom Client geliefert
    return this.vectorListingsService.addListing(listing);
  }
  @Post('search')
  async search(@Body() body: { query: string; type: 'tenant' | 'landlord'; filters: any }) {
    const { query, type, filters } = body;
    return this.vectorListingsService.searchListings(query, type, filters);
  }
}
