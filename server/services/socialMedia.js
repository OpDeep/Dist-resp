import { logger } from '../middleware/middleware.js';

export class SocialMediaService {
  constructor(cacheService) {
    this.cache = cacheService;
  }

  async fetchSocialMediaReports(disasterId, tags = []) {
    const cacheKey = `social_media_${disasterId}_${tags.join('_')}`;
    
    try {
      // Check cache first
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        logger('info', 'Social media cache hit');
        return cached;
      }

      // Enhanced mock Twitter API data with more realistic content
      const mockReports = this.generateEnhancedMockReports(tags, disasterId);
      
      // Cache the result
      await this.cache.set(cacheKey, mockReports, 0.5); // 30 minutes TTL for social media
      
      logger('info', `Fetched ${mockReports.length} social media reports`);
      return mockReports;
    } catch (error) {
      logger('error', `Social media fetch error: ${error.message}`);
      return [];
    }
  }

  generateEnhancedMockReports(tags, disasterId) {
    const baseReports = [
      {
        id: `tweet_${disasterId}_1`,
        user: 'citizen_reporter',
        content: '#FloodAlert Water levels rising rapidly in downtown area. Multiple streets flooded. Avoid 5th Avenue between 42nd and 50th Street. Emergency services on scene.',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        priority: 'urgent',
        location: 'Manhattan, NYC',
        keywords: ['flood', 'emergency', 'water', 'streets'],
        platform: 'Twitter',
        verified: true,
        engagement: { likes: 234, shares: 89, replies: 45 }
      },
      {
        id: `tweet_${disasterId}_2`,
        user: 'nyc_emergency',
        content: '🚨 EMERGENCY ALERT: Evacuation order issued for Lower East Side residents. Proceed to designated shelters immediately. Transportation available at community centers.',
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        priority: 'urgent',
        location: 'Lower East Side, NYC',
        keywords: ['evacuation', 'emergency', 'shelter', 'transportation'],
        platform: 'Twitter',
        verified: true,
        engagement: { likes: 567, shares: 234, replies: 78 }
      },
      {
        id: `tweet_${disasterId}_3`,
        user: 'volunteer_helper',
        content: 'Setting up emergency food distribution at Central Park. Hot meals and water available. Volunteers needed! #DisasterRelief #NYC',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        priority: 'medium',
        location: 'Central Park, NYC',
        keywords: ['food', 'volunteers', 'relief', 'help'],
        platform: 'Twitter',
        verified: false,
        engagement: { likes: 123, shares: 67, replies: 23 }
      },
      {
        id: `tweet_${disasterId}_4`,
        user: 'medical_team_nyc',
        content: 'Mobile medical unit deployed to Brooklyn Bridge area. First aid and emergency medical care available. Follow safety protocols when approaching.',
        timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        priority: 'high',
        location: 'Brooklyn Bridge, NYC',
        keywords: ['medical', 'first aid', 'emergency', 'safety'],
        platform: 'Twitter',
        verified: true,
        engagement: { likes: 189, shares: 45, replies: 12 }
      },
      {
        id: `tweet_${disasterId}_5`,
        user: 'local_resident',
        content: 'Power outage affecting entire block on 8th Avenue. Traffic lights down. Please drive carefully and check on elderly neighbors.',
        timestamp: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
        priority: 'medium',
        location: '8th Avenue, NYC',
        keywords: ['power', 'outage', 'traffic', 'safety'],
        platform: 'Twitter',
        verified: false,
        engagement: { likes: 67, shares: 23, replies: 8 }
      },
      {
        id: `tweet_${disasterId}_6`,
        user: 'fire_dept_nyc',
        content: '🔥 Structure fire contained at 123 Main St. Area secured. Residents from adjacent buildings evacuated as precaution. Air quality monitoring in progress.',
        timestamp: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
        priority: 'high',
        location: 'Main Street, NYC',
        keywords: ['fire', 'evacuation', 'air quality', 'safety'],
        platform: 'Twitter',
        verified: true,
        engagement: { likes: 345, shares: 123, replies: 56 }
      },
      {
        id: `tweet_${disasterId}_7`,
        user: 'community_leader',
        content: 'Community center at 456 Oak St open as temporary shelter. Blankets, food, and phone charging stations available. Pet-friendly facility.',
        timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
        priority: 'medium',
        location: 'Oak Street, NYC',
        keywords: ['shelter', 'community', 'pets', 'charging'],
        platform: 'Twitter',
        verified: false,
        engagement: { likes: 156, shares: 78, replies: 34 }
      },
      {
        id: `tweet_${disasterId}_8`,
        user: 'transport_update',
        content: 'Subway lines 4, 5, 6 suspended due to flooding. Bus service rerouted. Check MTA app for real-time updates. Free rides to evacuation centers.',
        timestamp: new Date(Date.now() - 85 * 60 * 1000).toISOString(),
        priority: 'high',
        location: 'NYC Transit System',
        keywords: ['subway', 'bus', 'transport', 'evacuation'],
        platform: 'Twitter',
        verified: true,
        engagement: { likes: 445, shares: 167, replies: 89 }
      }
    ];

    // Filter based on tags if provided
    if (tags.length > 0) {
      return baseReports.filter(report => 
        tags.some(tag => 
          report.keywords.some(keyword => 
            keyword.toLowerCase().includes(tag.toLowerCase())
          ) || report.content.toLowerCase().includes(tag.toLowerCase())
        )
      );
    }

    return baseReports;
  }

  async detectPriorityAlerts(reports) {
    const urgentKeywords = ['urgent', 'sos', 'emergency', 'help', 'trapped', 'critical', 'evacuation', 'danger'];
    
    const priorityAlerts = reports.filter(report => {
      const content = report.content.toLowerCase();
      return urgentKeywords.some(keyword => content.includes(keyword)) || report.priority === 'urgent';
    });

    // Sort by priority and timestamp
    return priorityAlerts.sort((a, b) => {
      const priorityOrder = { urgent: 3, high: 2, medium: 1, low: 0 };
      const aPriority = priorityOrder[a.priority] || 0;
      const bPriority = priorityOrder[b.priority] || 0;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Higher priority first
      }
      
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(); // More recent first
    });
  }

  async analyzeSentiment(reports) {
    // Simple sentiment analysis based on keywords
    return reports.map(report => {
      const content = report.content.toLowerCase();
      let sentiment = 'neutral';
      
      const positiveKeywords = ['help', 'safe', 'rescued', 'volunteer', 'support', 'relief'];
      const negativeKeywords = ['trapped', 'danger', 'emergency', 'critical', 'urgent', 'flood', 'fire'];
      
      const positiveCount = positiveKeywords.filter(keyword => content.includes(keyword)).length;
      const negativeCount = negativeKeywords.filter(keyword => content.includes(keyword)).length;
      
      if (negativeCount > positiveCount) {
        sentiment = 'negative';
      } else if (positiveCount > negativeCount) {
        sentiment = 'positive';
      }
      
      return {
        ...report,
        sentiment,
        sentiment_score: positiveCount - negativeCount
      };
    });
  }
}