import { Injectable } from '@nestjs/common';

@Injectable()
export class HashtagService {
  /**
   * Extract hashtags from text content
   * @param content - The text content to extract hashtags from
   * @returns Array of hashtags (without the # symbol)
   */
  extractHashtags(content: string): string[] {
    if (!content) return [];

    // Regex to match hashtags: # followed by word characters, numbers, or underscores
    const hashtagRegex = /#(\w+)/g;
    const matches = content.match(hashtagRegex);

    if (!matches) return [];

    // Remove the # symbol and convert to lowercase for consistency
    return matches
      .map(hashtag => hashtag.slice(1).toLowerCase())
      .filter((hashtag, index, array) => array.indexOf(hashtag) === index); // Remove duplicates
  }

  /**
   * Clean and validate hashtags
   * @param hashtags - Array of hashtags to clean
   * @returns Array of cleaned hashtags
   */
  cleanHashtags(hashtags: string[]): string[] {
    return hashtags
      .filter(hashtag => hashtag && hashtag.trim().length > 0)
      .map(hashtag => hashtag.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''))
      .filter(hashtag => hashtag.length >= 2 && hashtag.length <= 50)
      .filter((hashtag, index, array) => array.indexOf(hashtag) === index); // Remove duplicates
  }

  /**
   * Process content to extract and clean hashtags
   * @param content - The text content
   * @returns Object with cleaned content and extracted hashtags
   */
  processContent(content: string): { content: string; hashtags: string[] } {
    if (!content) return { content: '', hashtags: [] };

    const hashtags = this.extractHashtags(content);
    const cleanedHashtags = this.cleanHashtags(hashtags);

    return {
      content: content.trim(),
      hashtags: cleanedHashtags
    };
  }

  /**
   * Generate popular hashtag suggestions based on content
   * @param content - The text content
   * @returns Array of suggested hashtags
   */
  generateSuggestions(content: string): string[] {
    const suggestions = [];
    const lowerContent = content.toLowerCase();

    // Property type suggestions
    if (lowerContent.includes('apartment') || lowerContent.includes('wohnung')) {
      suggestions.push('apartment', 'wohnung');
    }
    if (lowerContent.includes('house') || lowerContent.includes('haus')) {
      suggestions.push('house', 'haus');
    }
    if (lowerContent.includes('room') || lowerContent.includes('zimmer')) {
      suggestions.push('room', 'zimmer');
    }

    // Features
    if (lowerContent.includes('furnished') || lowerContent.includes('möbliert')) {
      suggestions.push('furnished', 'möbliert');
    }
    if (lowerContent.includes('balcony') || lowerContent.includes('balkon')) {
      suggestions.push('balcony', 'balkon');
    }
    if (lowerContent.includes('garden') || lowerContent.includes('garten')) {
      suggestions.push('garden', 'garten');
    }
    if (lowerContent.includes('parking') || lowerContent.includes('parkplatz')) {
      suggestions.push('parking', 'parkplatz');
    }

    // Location-based
    if (lowerContent.includes('city') || lowerContent.includes('stadt')) {
      suggestions.push('cityliving', 'stadtleben');
    }
    if (lowerContent.includes('quiet') || lowerContent.includes('ruhig')) {
      suggestions.push('quiet', 'ruhig');
    }

    return this.cleanHashtags(suggestions);
  }
}