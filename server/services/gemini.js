import axios from 'axios';
import { logger } from '../middleware/middleware.js';

export class GeminiService {
  constructor(cacheService) {
    this.cache = cacheService;
    this.hfToken = process.env.GEMINI_API_KEY || process.env.HUGGINGFACE_API_KEY;
    this.textModel = 'dslim/bert-base-NER'; // Hugging Face model for NER
    this.imageModel = 'google/vit-base-patch16-224'; // Vision model for image analysis
  }

  async extractLocation(description) {
    const cacheKey = `location_extract_${Buffer.from(description).toString('base64').substring(0, 50)}`;

    try {
      // Check cache first
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        logger('info', 'Location extraction cache hit');
        return cached;
      }

      // Enhanced location extraction with multiple approaches
      let extractedLocation = await this.extractLocationWithNER(description);
      
      // Fallback to pattern matching if NER fails
      if (!extractedLocation || extractedLocation === 'Unknown') {
        extractedLocation = this.extractLocationWithPatterns(description);
      }

      const result_data = { 
        location: extractedLocation || 'Location extraction failed',
        confidence: extractedLocation ? 0.8 : 0.1,
        method: extractedLocation ? 'NER+Patterns' : 'Failed'
      };

      // Cache the result
      await this.cache.set(cacheKey, result_data);
      logger('info', `Location extracted: ${result_data.location} (confidence: ${result_data.confidence})`);
      return result_data;

    } catch (error) {
      logger('error', `Location extraction error: ${error.message}`);
      return { 
        location: 'Location extraction failed',
        confidence: 0,
        method: 'Error',
        error: error.message
      };
    }
  }

  async extractLocationWithNER(description) {
    try {
      if (!this.hfToken) {
        logger('warn', 'No Hugging Face API key provided, using pattern matching only');
        return null;
      }

      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${this.textModel}`,
        { inputs: description },
        {
          headers: {
            Authorization: `Bearer ${this.hfToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      // Extract location entities
      const entities = response.data;
      if (Array.isArray(entities)) {
        const locations = entities
          .filter(ent => 
            ent.entity_group === 'LOC' || 
            ent.entity_group === 'ORG' || 
            (ent.entity_group === 'MISC' && ent.word.match(/\b(street|avenue|road|park|bridge|center)\b/i))
          )
          .map(ent => ent.word)
          .filter(word => word && word !== '[CLS]' && word !== '[SEP]')
          .join(' ')
          .replace(/##/g, '')
          .trim();

        return locations || null;
      }
    } catch (error) {
      logger('error', `NER location extraction error: ${error.message}`);
      return null;
    }
  }

  extractLocationWithPatterns(description) {
    // Enhanced pattern matching for common location formats
    const locationPatterns = [
      // City, State patterns
      /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2}|[A-Z][a-z]+)\b/g,
      // Street addresses
      /\b\d+\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Place|Pl))\b/gi,
      // Neighborhoods and areas
      /\b(?:in|at|near|around)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:Area|District|Neighborhood|Heights|Park|Center|Square|Plaza)))\b/gi,
      // Landmarks and buildings
      /\b(?:at|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Bridge|Building|Hospital|School|University|Mall|Airport|Station))\b/gi,
      // General location indicators
      /\b(?:in|at|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g
    ];

    const locations = [];
    
    for (const pattern of locationPatterns) {
      const matches = description.match(pattern);
      if (matches) {
        locations.push(...matches.map(match => 
          match.replace(/^(?:in|at|near|around)\s+/i, '').trim()
        ));
      }
    }

    // Remove duplicates and filter out common non-location words
    const filteredLocations = [...new Set(locations)]
      .filter(loc => 
        loc.length > 2 && 
        !loc.match(/^(the|and|but|for|are|was|were|been|have|has|had|will|would|could|should)$/i)
      );

    return filteredLocations.length > 0 ? filteredLocations[0] : null;
  }

  async verifyImage(imageUrl) {
    const cacheKey = `image_verify_${Buffer.from(imageUrl).toString('base64').substring(0, 50)}`;
  
    try {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        logger('info', 'Image verification cache hit');
        return cached;
      }

      // Enhanced image verification with multiple checks
      const verificationResult = await this.performImageVerification(imageUrl);
      
      await this.cache.set(cacheKey, verificationResult);
      logger('info', `Image verification completed: ${verificationResult.status}`);
      return verificationResult;
  
    } catch (error) {
      logger('error', `Image verification error: ${error.message}`);
      return {
        status: 'error',
        analysis: 'Image verification failed due to technical error',
        confidence: 0,
        details: {
          error: error.message,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  async performImageVerification(imageUrl) {
    try {
      // Basic URL validation
      if (!this.isValidImageUrl(imageUrl)) {
        return {
          status: 'invalid',
          analysis: 'Invalid image URL provided',
          confidence: 0,
          details: { reason: 'Invalid URL format' }
        };
      }

      // Try to fetch and analyze the image
      if (this.hfToken) {
        return await this.analyzeImageWithHuggingFace(imageUrl);
      } else {
        return await this.analyzeImageBasic(imageUrl);
      }

    } catch (error) {
      return {
        status: 'error',
        analysis: `Image analysis failed: ${error.message}`,
        confidence: 0,
        details: { error: error.message }
      };
    }
  }

  async analyzeImageWithHuggingFace(imageUrl) {
    try {
      // Get image as binary
      const imageResp = await axios.get(imageUrl, { 
        responseType: 'arraybuffer',
        timeout: 15000,
        headers: {
          'User-Agent': 'DisasterResponsePlatform/1.0'
        }
      });

      // Send to Hugging Face for analysis
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${this.imageModel}`,
        imageResp.data,
        {
          headers: {
            Authorization: `Bearer ${this.hfToken}`,
            'Content-Type': 'application/octet-stream'
          },
          timeout: 20000
        }
      );

      // Process the response
      const analysis = response.data;
      let status = 'analyzed';
      let confidence = 0.7;
      let analysisText = 'Image analyzed successfully';

      if (Array.isArray(analysis) && analysis.length > 0) {
        const topResult = analysis[0];
        analysisText = `Image classification: ${topResult.label} (confidence: ${(topResult.score * 100).toFixed(1)}%)`;
        confidence = topResult.score;
        
        // Check for disaster-related content
        const disasterKeywords = ['flood', 'fire', 'damage', 'destruction', 'emergency', 'disaster'];
        const isDisasterRelated = disasterKeywords.some(keyword => 
          topResult.label.toLowerCase().includes(keyword)
        );
        
        if (isDisasterRelated) {
          status = 'authentic';
          analysisText += ' - Appears to be disaster-related content';
        }
      }

      return {
        status,
        analysis: analysisText,
        confidence,
        details: {
          raw_analysis: analysis,
          image_size: imageResp.data.length,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      throw new Error(`Hugging Face analysis failed: ${error.message}`);
    }
  }

  async analyzeImageBasic(imageUrl) {
    try {
      // Basic image validation without AI
      const response = await axios.head(imageUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'DisasterResponsePlatform/1.0'
        }
      });

      const contentType = response.headers['content-type'];
      const contentLength = response.headers['content-length'];

      if (!contentType || !contentType.startsWith('image/')) {
        return {
          status: 'invalid',
          analysis: 'URL does not point to a valid image',
          confidence: 0,
          details: { content_type: contentType }
        };
      }

      return {
        status: 'basic_check',
        analysis: `Image URL validated. Type: ${contentType}, Size: ${contentLength} bytes`,
        confidence: 0.5,
        details: {
          content_type: contentType,
          content_length: contentLength,
          method: 'basic_validation'
        }
      };

    } catch (error) {
      throw new Error(`Basic image validation failed: ${error.message}`);
    }
  }

  isValidImageUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }
}