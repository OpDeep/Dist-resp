import React, { useState, useEffect } from 'react';
import { MessageCircle, AlertTriangle, MapPin, Clock, User, ExternalLink } from 'lucide-react';

interface SocialMediaReport {
  id: string;
  user: string;
  content: string;
  timestamp: string;
  priority: string;
  location: string;
  keywords: string[];
  platform?: string;
  verified?: boolean;
  engagement?: {
    likes: number;
    shares: number;
    replies: number;
  };
}

interface SocialMediaFeedProps {
  reports: SocialMediaReport[];
  onReportClick?: (report: SocialMediaReport) => void;
  loading?: boolean;
}

export const SocialMediaFeed: React.FC<SocialMediaFeedProps> = ({ 
  reports, 
  onReportClick,
  loading = false 
}) => {
  const [filteredReports, setFilteredReports] = useState<SocialMediaReport[]>(reports);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [keywordFilter, setKeywordFilter] = useState<string>('');

  useEffect(() => {
    let filtered = reports;

    // Filter by priority
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(report => report.priority === priorityFilter);
    }

    // Filter by keyword
    if (keywordFilter) {
      filtered = filtered.filter(report => 
        report.content.toLowerCase().includes(keywordFilter.toLowerCase()) ||
        report.keywords.some(keyword => 
          keyword.toLowerCase().includes(keywordFilter.toLowerCase())
        )
      );
    }

    setFilteredReports(filtered);
  }, [reports, priorityFilter, keywordFilter]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '📢';
      default: return '💬';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="space-y-1 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Social Media Feed</h3>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded-full">
              {filteredReports.length} reports
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Priority:</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Search:</label>
            <input
              type="text"
              value={keywordFilter}
              onChange={(e) => setKeywordFilter(e.target.value)}
              placeholder="Filter by keywords..."
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {filteredReports.length === 0 ? (
          <div className="p-8 text-center">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No social media reports found</p>
            <p className="text-sm text-gray-400 mt-1">
              {keywordFilter || priorityFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Reports will appear here when available'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                onClick={() => onReportClick?.(report)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">@{report.user}</span>
                      {report.verified && (
                        <span className="text-blue-500 text-xs">✓</span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(report.priority)}`}>
                        {getPriorityIcon(report.priority)} {report.priority}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTimeAgo(report.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-2 leading-relaxed">
                      {report.content}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{report.location}</span>
                        </div>
                        {report.platform && (
                          <div className="flex items-center space-x-1">
                            <ExternalLink className="h-3 w-3" />
                            <span>{report.platform}</span>
                          </div>
                        )}
                      </div>
                      
                      {report.engagement && (
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span>❤️ {report.engagement.likes}</span>
                          <span>🔄 {report.engagement.shares}</span>
                          <span>💬 {report.engagement.replies}</span>
                        </div>
                      )}
                    </div>
                    
                    {report.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {report.keywords.slice(0, 3).map((keyword, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            #{keyword}
                          </span>
                        ))}
                        {report.keywords.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{report.keywords.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};