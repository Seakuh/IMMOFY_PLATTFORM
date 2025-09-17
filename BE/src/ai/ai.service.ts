import { Injectable, BadRequestException } from '@nestjs/common';
import { BillboardCategory, BillboardType } from '../billboard/entities/billboard.entity';

export interface ImageAnalysisResult {
  title: string;
  description: string;
  category: BillboardCategory;
  type: BillboardType;
  price?: number;
  priceType?: string;
  size?: number;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  furnished?: boolean;
  balcony?: boolean;
  garden?: boolean;
  parking?: boolean;
  elevator?: boolean;
  petsAllowed?: boolean;
  amenities?: string[];
  tags?: string[];
  location?: string;
  city?: string;
  floor?: number;
}

@Injectable()
export class AiService {
  async analyzeImage(imageBuffer: Buffer, filename: string): Promise<ImageAnalysisResult> {
    // Mock AI analysis - in production, this would integrate with OpenAI Vision API or similar
    // For demonstration purposes, we'll simulate analysis based on common property patterns
    
    const mockAnalysisResults = [
      {
        title: "Moderne 3-Zimmer Wohnung in Stadtmitte",
        description: "Helle und moderne 3-Zimmer Wohnung mit großen Fenstern und offener Küche. Perfekt für WG oder kleine Familie gelegen in zentraler Lage.",
        category: BillboardCategory.APARTMENT,
        type: BillboardType.OFFER,
        price: 850,
        priceType: "Kaltmiete",
        size: 85,
        rooms: 3,
        bedrooms: 2,
        bathrooms: 1,
        furnished: false,
        balcony: true,
        garden: false,
        parking: false,
        elevator: true,
        petsAllowed: false,
        amenities: ["Moderne Küche", "Große Fenster", "Zentrale Lage"],
        tags: ["modern", "hell", "zentral"],
        location: "Stadtmitte",
        city: "Berlin",
        floor: 3
      },
      {
        title: "Gemütliches WG-Zimmer mit Balkon",
        description: "Schönes, helles WG-Zimmer in 4er WG. Das Zimmer verfügt über einen eigenen Balkon und ist komplett möbliert. Ruhige Wohnlage.",
        category: BillboardCategory.APARTMENT,
        type: BillboardType.OFFER,
        price: 450,
        priceType: "Warmmiete",
        size: 18,
        rooms: 1,
        bedrooms: 1,
        bathrooms: 1,
        furnished: true,
        balcony: true,
        garden: false,
        parking: false,
        elevator: false,
        petsAllowed: true,
        amenities: ["Möbliert", "Eigener Balkon", "WG-Leben"],
        tags: ["WG", "möbliert", "balkon", "gemütlich"],
        location: "Friedrichshain",
        city: "Berlin",
        floor: 2
      },
      {
        title: "Luxuriöse Penthouse Wohnung mit Dachterrasse",
        description: "Exklusive Penthouse Wohnung mit großer Dachterrasse und Panoramablick über die Stadt. Hochwertige Ausstattung und Premium-Lage.",
        category: BillboardCategory.APARTMENT,
        type: BillboardType.OFFER,
        price: 2500,
        priceType: "Kaltmiete",
        size: 120,
        rooms: 4,
        bedrooms: 2,
        bathrooms: 2,
        furnished: true,
        balcony: false,
        garden: false,
        parking: true,
        elevator: true,
        petsAllowed: false,
        amenities: ["Dachterrasse", "Panoramablick", "Premium Ausstattung", "Tiefgarage"],
        tags: ["luxus", "penthouse", "dachterrasse", "premium"],
        location: "Prenzlauer Berg",
        city: "Berlin",
        floor: 6
      }
    ];

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Return random mock result
    const randomIndex = Math.floor(Math.random() * mockAnalysisResults.length);
    return mockAnalysisResults[randomIndex];
  }

  private extractImageMetadata(buffer: Buffer, filename: string) {
    // Extract basic file info
    return {
      filename,
      size: buffer.length,
      type: this.getMimeType(filename),
    };
  }

  private getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'webp':
        return 'image/webp';
      default:
        return 'image/jpeg';
    }
  }

  private validateImage(buffer: Buffer, filename: string): void {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['jpg', 'jpeg', 'png', 'webp'];
    
    if (buffer.length > maxSize) {
      throw new BadRequestException('Image file too large. Maximum size is 10MB.');
    }

    const ext = filename.split('.').pop()?.toLowerCase();
    if (!ext || !allowedTypes.includes(ext)) {
      throw new BadRequestException('Invalid file type. Only JPG, PNG, and WebP are allowed.');
    }
  }
}