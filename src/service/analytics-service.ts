import { db } from '~/db';
import { flashcards } from '~/db/schema';
import type { ReviewLog } from 'ts-fsrs';

export interface DashboardMetrics {
  cardsStudiedToday: number;
  accuracyRate: number;
  totalCards: number;
  studyTimeToday: string;
  weeklyChange: {
    cardsStudied: string;
    accuracy: string;
  };
}

export interface WeeklyProgressData {
  labels: string[];
  datasets: [{
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }];
}

export interface CategoryData {
  labels: string[];
  datasets: [{
    label: string;
    data: number[];
    backgroundColor: string[];
  }];
}

export interface ActivityItem {
  id: string;
  type: 'review' | 'study' | 'achievement';
  title: string;
  description: string;
  timestamp: Date;
  points: number;
}

class AnalyticsService {
  private metricsCache: { data: DashboardMetrics; timestamp: number } | null = null;
  private weeklyCache: { data: WeeklyProgressData; timestamp: number } | null = null;
  private categoryCache: { data: CategoryData; timestamp: number } | null = null;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private isCacheValid(cache: { timestamp: number } | null): boolean {
    return cache !== null && Date.now() - cache.timestamp < this.CACHE_TTL;
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    if (this.isCacheValid(this.metricsCache)) {
      return this.metricsCache!.data;
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = Math.floor(today.getTime() / 1000);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayTimestamp = Math.floor(yesterday.getTime() / 1000);

      // Get all flashcards with their review history
      const allCards = await db.select().from(flashcards);
      
      let cardsStudiedToday = 0;
      let cardsStudiedYesterday = 0;
      let totalReviewsToday = 0;
      let correctReviewsToday = 0;
      let totalReviewsYesterday = 0;
      let correctReviewsYesterday = 0;
      let studyTimeToday = 0;

      for (const card of allCards) {
        const reviewHistory = card.reviewHistory as ReviewLog[];
        
        for (const review of reviewHistory) {
          const reviewTimestamp = Math.floor(new Date(review.review).getTime() / 1000);
          
          if (reviewTimestamp >= todayTimestamp) {
            cardsStudiedToday++;
            totalReviewsToday++;
            studyTimeToday += 30; // Assume 30 seconds per review
            if (review.rating >= 3) { // Rating 3 or 4 is considered correct
              correctReviewsToday++;
            }
          } else if (reviewTimestamp >= yesterdayTimestamp) {
            cardsStudiedYesterday++;
            totalReviewsYesterday++;
            if (review.rating >= 3) {
              correctReviewsYesterday++;
            }
          }
        }
      }

      const accuracyRate = totalReviewsToday > 0 ? (correctReviewsToday / totalReviewsToday) * 100 : 0;
      const yesterdayAccuracy = totalReviewsYesterday > 0 ? (correctReviewsYesterday / totalReviewsYesterday) * 100 : 0;
      
      const cardsChange = cardsStudiedYesterday > 0 
        ? ((cardsStudiedToday - cardsStudiedYesterday) / cardsStudiedYesterday * 100).toFixed(0)
        : cardsStudiedToday > 0 ? '+100' : '0';
      
      const accuracyChange = yesterdayAccuracy > 0 
        ? ((accuracyRate - yesterdayAccuracy) / yesterdayAccuracy * 100).toFixed(0)
        : accuracyRate > 0 ? '+100' : '0';

      const metrics: DashboardMetrics = {
        cardsStudiedToday,
        accuracyRate: Math.round(accuracyRate),
        totalCards: allCards.length,
        studyTimeToday: `${Math.round(studyTimeToday / 60)}m`,
        weeklyChange: {
          cardsStudied: `${cardsChange.startsWith('-') ? '' : '+'}${cardsChange}%`,
          accuracy: `${accuracyChange.startsWith('-') ? '' : '+'}${accuracyChange}%`,
        },
      };

      this.metricsCache = { data: metrics, timestamp: Date.now() };
      return metrics;
    } catch (error) {
      console.error('Error calculating dashboard metrics:', error);
      // Return fallback data
      return {
        cardsStudiedToday: 0,
        accuracyRate: 0,
        totalCards: 0,
        studyTimeToday: '0m',
        weeklyChange: {
          cardsStudied: '0%',
          accuracy: '0%',
        },
      };
    }
  }

  async getWeeklyProgress(): Promise<WeeklyProgressData> {
    if (this.isCacheValid(this.weeklyCache)) {
      return this.weeklyCache!.data;
    }

    try {
      const today = new Date();
      const weekData: number[] = [];
      const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

      // Get data for the last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const dayStart = Math.floor(date.getTime() / 1000);
        
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        const dayEnd = Math.floor(nextDay.getTime() / 1000);

        const allCards = await db.select().from(flashcards);
        let cardsStudiedThisDay = 0;

        for (const card of allCards) {
          const reviewHistory = card.reviewHistory as ReviewLog[];
          for (const review of reviewHistory) {
            const reviewTimestamp = Math.floor(new Date(review.review).getTime() / 1000);
            if (reviewTimestamp >= dayStart && reviewTimestamp < dayEnd) {
              cardsStudiedThisDay++;
            }
          }
        }

        weekData.push(cardsStudiedThisDay);
      }

      const progressData: WeeklyProgressData = {
        labels,
        datasets: [{
          label: 'Cards Studied',
          data: weekData,
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
        }]
      };

      this.weeklyCache = { data: progressData, timestamp: Date.now() };
      return progressData;
    } catch (error) {
      console.error('Error calculating weekly progress:', error);
      // Return fallback data
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Cards Studied',
          data: [0, 0, 0, 0, 0, 0, 0],
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
        }]
      };
    }
  }

  async getCategoryDistribution(): Promise<CategoryData> {
    if (this.isCacheValid(this.categoryCache)) {
      return this.categoryCache!.data;
    }

    try {
      const allCards = await db.select().from(flashcards);
      
      // Group cards by level
      const levelCounts: Record<string, number> = {};
      
      for (const card of allCards) {
        const level = card.level || 'Unknown';
        levelCounts[level] = (levelCounts[level] || 0) + 1;
      }

      const labels = Object.keys(levelCounts);
      const data = Object.values(levelCounts);
      const colors = [
        '#4f46e5', // Blue
        '#10b981', // Green
        '#f59e0b', // Yellow
        '#8b5cf6', // Purple
        '#ef4444', // Red
        '#06b6d4', // Cyan
        '#84cc16', // Lime
        '#f97316', // Orange
      ];

      const categoryData: CategoryData = {
        labels,
        datasets: [{
          label: 'Categories',
          data,
          backgroundColor: colors.slice(0, labels.length),
        }]
      };

      this.categoryCache = { data: categoryData, timestamp: Date.now() };
      return categoryData;
    } catch (error) {
      console.error('Error calculating category distribution:', error);
      // Return fallback data
      return {
        labels: ['No Data'],
        datasets: [{
          label: 'Categories',
          data: [0],
          backgroundColor: ['#6b7280'],
        }]
      };
    }
  }

  // Clear all caches (useful for testing or manual refresh)
  clearCache(): void {
    this.metricsCache = null;
    this.weeklyCache = null;
    this.categoryCache = null;
  }
}

export const analyticsService = new AnalyticsService();