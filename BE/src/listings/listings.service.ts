import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VectorListingsService } from 'src/vector-listings/vector-listings.service';
import { Repository } from 'typeorm';
import { ChatGPTModel } from '../chatbot/models/chatgpt.model';
import { ImageService } from '../images/image.service';
import { UserManagementService } from '../users/services/user-management.service';
import {
  UploadListingDto,
  UploadListingResponse,
} from './dto/upload-listing.dto';
import { Listing } from './entities/listing.entity';

@Injectable()
export class ListingsService {
  constructor(
    @InjectRepository(Listing)
    private readonly listingRepository: Repository<Listing>,
    @Inject(forwardRef(() => VectorListingsService))
    private readonly vectorListingsService: VectorListingsService,
    @Inject(forwardRef(() => ChatGPTModel))
    private readonly chatGPTModel: ChatGPTModel,
    @Inject(forwardRef(() => ImageService))
    private readonly imageService: ImageService,
    @Inject(forwardRef(() => UserManagementService))
    private readonly userManagementService: UserManagementService,
  ) {}

  /**
   * Upload and process a new listing with ChatGPT filtering and image handling
   */
  async uploadListing(
    uploadListingDto: UploadListingDto,
    userId: string,
    images?: Express.Multer.File[],
  ): Promise<UploadListingResponse> {
    try {
      // 1. Parse metadata if provided
      let metadata = {};
      if (uploadListingDto.metadata) {
        try {
          metadata = JSON.parse(uploadListingDto.metadata);
        } catch (error) {
          console.error('Error parsing metadata:', error);
        }
      }

      // 2. Upload images to Hetzner if provided
      let uploadedImageUrls: string[] = [];
      if (images && images.length > 0) {
        uploadedImageUrls = await Promise.all(
          images.map((image) => this.imageService.uploadImage(image)),
        );
      }

      // 3. Use AI to filter and extract structured data from listing text
      const filteredData = await this.extractListingData(
        uploadListingDto.prompt,
        metadata,
        {
          platform: uploadListingDto.platform,
          title: uploadListingDto.title,
          location: uploadListingDto.location,
          landlordName: uploadListingDto.landlordName,
          landlordEmail: uploadListingDto.landlordEmail,
        },
      );

      // 4. Generate enhanced description using AI
      const generatedDescription = await this.generateListingDescription(
        uploadListingDto.prompt,
        filteredData,
        uploadedImageUrls.length > 0,
      );

      // 5. Create listing in database
      const newListing = this.listingRepository.create({
        platform: uploadListingDto.platform || 'Manual Upload',
        link: uploadListingDto.link,
        title: uploadListingDto.title || filteredData.title,
        description: uploadListingDto.prompt,
        location: uploadListingDto.location || filteredData.location,
        landlordName:
          uploadListingDto.landlordName || filteredData.landlordName,
        landlordEmail:
          uploadListingDto.landlordEmail || filteredData.landlordEmail,
        generatedMessage: generatedDescription,
        textType: 'Listing',
        additionalData: metadata,
        uploadedImages: uploadedImageUrls,
        filteredData,
        price: filteredData.price,
        rooms: filteredData.rooms,
        size: filteredData.size,
        status: 'processed',
        isPublished: true,
        user: { id: userId } as any,
      });

      const savedListing = await this.listingRepository.save(newListing);

      // 6. Add to vector database for semantic search
      await this.vectorListingsService.addListing({
        id: savedListing.id,
        title: savedListing.title || 'Listing',
        description: generatedDescription,
        location: savedListing.location,
        price: savedListing.price,
        features: filteredData.features || [],
        listingType: 'apartment',
        userId,
        ...filteredData,
      });

      return {
        success: true,
        message:
          'Inserat erfolgreich hochgeladen, verarbeitet und veröffentlicht',
        listingId: savedListing.id,
        listing: {
          id: savedListing.id,
          filteredData: savedListing.filteredData,
          uploadedImages: savedListing.uploadedImages,
          generatedDescription,
        },
      };
    } catch (error) {
      console.error('Error uploading listing:', error);
      throw new Error(`Failed to upload listing: ${error.message}`);
    }
  }

  async saveListingOrText(data: {
    platform: string;
    location?: string;
    link?: string;
    title?: string;
    description?: string;
    generatedMessage: string;
    landlordName?: string;
    landlordEmail?: string;
    textType: string;
    userId: string;
    additionalData?: Record<string, any>;
  }): Promise<Listing> {
    const { userId, ...listingData } = data;

    console.log('listingdata', listingData);
    // Create the listing entity
    const newListing = this.listingRepository.create({
      ...listingData,
      user: { id: userId } as any, // Use a shallow reference to the User entity
    });

    // Save the listing
    return await this.listingRepository.save(newListing);
  }

  async getUserListings(userId: string): Promise<Listing[]> {
    return await this.listingRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllListings(page: number, limit: number): Promise<Listing[]> {
    const offset = (page - 1) * limit;
    return this.listingRepository.find({
      skip: offset,
      take: limit,
    });
  }

  async getListingById(id: string): Promise<Listing> {
    const listing = await this.listingRepository.findOne({ where: { id } });
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }
    return listing;
  }

  async getUserListingsWithLimit(
    userId: string,
    page: number,
    limit: number,
  ): Promise<Listing[]> {
    const skip = (page - 1) * limit;
    return await this.listingRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
  }

  /**
   * Holt ein Listing zusammen mit seinem Besitzer.
   * @param listingId - Die ID des Listings.
   * @returns Ein Listing-Objekt mit Besitzerinformationen.
   */
  async getListingWithOwner(listingId: string): Promise<Listing> {
    const listing = await this.listingRepository.findOne({
      where: { id: listingId },
      relations: ['user'], // Lade die Beziehung zum Besitzer des Listings
    });

    if (!listing) {
      throw new NotFoundException(`Listing with ID ${listingId} not found.`);
    }

    return listing;
  }

  /**
   * Extract structured data from listing text using AI
   */
  private async extractListingData(
    prompt: string,
    metadata: any,
    additionalInfo: any,
  ): Promise<any> {
    const systemPrompt = `
    Du bist ein KI-Assistent, der Wohnungsinserate analysiert und strukturiert. 
    Extrahiere alle relevanten Informationen aus dem Text und gib sie als JSON-Objekt zurück.
    
    Erwartete Felder (alle optional):
    - title: Titel des Inserats
    - price: Mietpreis pro Monat
    - rooms: Anzahl Zimmer
    - size: Wohnungsgröße in qm
    - location: Adresse/Stadtteil/Ort
    - availableFrom: Verfügbar ab
    - landlordName: Name des Vermieters
    - landlordEmail: E-Mail des Vermieters
    - landlordPhone: Telefonnummer des Vermieters
    - furnished: Möbliert (boolean)
    - pets: Haustiere erlaubt (boolean)
    - smoking: Rauchen erlaubt (boolean)
    - parking: Parkplatz vorhanden (boolean)
    - balcony: Balkon vorhanden (boolean)
    - garden: Garten vorhanden (boolean)
    - elevator: Aufzug vorhanden (boolean)
    - accessible: Barrierefrei (boolean)
    - heating: Art der Heizung
    - utilities: Nebenkosten
    - deposit: Kaution
    - features: Besondere Ausstattung (Array)
    - description: Kurze Zusammenfassung
    
    Gib nur das JSON-Objekt zurück, ohne zusätzlichen Text.
    `;

    const userPrompt = `
    Inserat Text: ${prompt}
    
    Zusätzliche Informationen: ${JSON.stringify({ ...metadata, ...additionalInfo })}
    `;

    try {
      const response = await this.chatGPTModel.createChatCompletionWithSystem(
        systemPrompt,
        userPrompt,
      );

      // Clean and parse the response
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse
          .replace(/^```json\s*/, '')
          .replace(/\s*```$/, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse
          .replace(/^```\s*/, '')
          .replace(/\s*```$/, '');
      }

      return JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Return fallback object with basic extracted info
      return {
        title: additionalInfo.title || 'Wohnung',
        location: additionalInfo.location || '',
        description: prompt.substring(0, 200),
        landlordName: additionalInfo.landlordName || '',
        landlordEmail: additionalInfo.landlordEmail || '',
      };
    }
  }

  /**
   * Generate enhanced listing description using AI
   */
  private async generateListingDescription(
    originalText: string,
    filteredData: any,
    hasImages: boolean,
  ): Promise<string> {
    const systemPrompt = `
    Du bist ein Experte für Wohnungsinserate. Erstelle basierend auf den gegebenen Daten 
    eine professionelle und ansprechende Beschreibung für ein Wohnungsinserat.
    
    Die Beschreibung soll:
    - Professionell und ansprechend formuliert sein
    - Alle wichtigen Informationen enthalten
    - Interesse wecken und zum Kontakt animieren
    - Circa 200-300 Wörter lang sein
    - Die Vorzüge der Wohnung hervorheben
    `;

    const userPrompt = `
    Original Text: ${originalText}
    
    Strukturierte Daten: ${JSON.stringify(filteredData)}
    
    Hat Bilder: ${hasImages ? 'Ja' : 'Nein'}
    
    Erstelle eine optimierte Beschreibung für dieses Wohnungsinserat.
    `;

    try {
      const response = await this.chatGPTModel.createChatCompletionWithSystem(
        systemPrompt,
        userPrompt,
      );
      return response;
    } catch (error) {
      console.error('Error generating enhanced description:', error);
      return originalText; // Fallback to original text
    }
  }

  /**
   * Get all published listings for homepage
   */
  async getPublishedListings(limit: number = 20): Promise<Listing[]> {
    return this.listingRepository.find({
      where: { isPublished: true },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get featured/highlighted listings for homepage
   */
  async getFeaturedListings(limit: number = 6): Promise<Listing[]> {
    return this.listingRepository.find({
      where: {
        isPublished: true,
        // Add criteria for featured listings (high views, recent, etc.)
      },
      order: {
        views: 'DESC',
        createdAt: 'DESC',
      },
      take: limit,
    });
  }
}
