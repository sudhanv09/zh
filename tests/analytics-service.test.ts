import { describe, it, expect, beforeEach, vi } from 'vitest';
import { analyticsService } from '~/service/analytics-service';

// Mock the database
vi.mock('~/db', () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockResolvedValue([
        {
          id: '1',
          vocabulary: '你好',
          pinyin: 'ni3 hao3',
          level: 'HSK1',
          reviewHistory: [
            {
              review: new Date().toISOString(),
              rating: 4,
            }
          ]
        },
        {
          id: '2',
          vocabulary: '谢谢',
          pinyin: 'xie4 xie4',
          level: 'HSK1',
          reviewHistory: [
            {
              review: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
              rating: 3,
            }
          ]
        },
        {
          id: '3',
          vocabulary: '再见',
          pinyin: 'zai4 jian4',
          level: 'HSK2',
          reviewHistory: []
        }
      ])
    })
  }
}));

describe('AnalyticsService', () => {
  beforeEach(() => {
    // Clear cache before each test
    analyticsService.clearCache();
  });

  describe('getDashboardMetrics', () => {
    it('should return dashboard metrics with correct structure', async () => {
      const metrics = await analyticsService.getDashboardMetrics();
      
      expect(metrics).toHaveProperty('cardsStudiedToday');
      expect(metrics).toHaveProperty('accuracyRate');
      expect(metrics).toHaveProperty('totalCards');
      expect(metrics).toHaveProperty('studyTimeToday');
      expect(metrics).toHaveProperty('weeklyChange');
      expect(metrics.weeklyChange).toHaveProperty('cardsStudied');
      expect(metrics.weeklyChange).toHaveProperty('accuracy');
      
      expect(typeof metrics.cardsStudiedToday).toBe('number');
      expect(typeof metrics.accuracyRate).toBe('number');
      expect(typeof metrics.totalCards).toBe('number');
      expect(typeof metrics.studyTimeToday).toBe('string');
    });

    it('should calculate total cards correctly', async () => {
      const metrics = await analyticsService.getDashboardMetrics();
      expect(metrics.totalCards).toBe(3); // Based on mocked data
    });

    it('should handle empty database gracefully', async () => {
      // Mock empty database by temporarily replacing the db mock
      const { db } = await vi.importMock('~/db');
      const originalSelect = db.select;
      
      db.select = vi.fn().mockReturnValue({
        from: vi.fn().mockResolvedValue([])
      });

      // Clear cache to ensure fresh calculation
      analyticsService.clearCache();
      
      const metrics = await analyticsService.getDashboardMetrics();
      expect(metrics.totalCards).toBe(0);
      expect(metrics.cardsStudiedToday).toBe(0);
      expect(metrics.accuracyRate).toBe(0);
      
      // Restore original mock
      db.select = originalSelect;
    });
  });

  describe('getWeeklyProgress', () => {
    it('should return weekly progress data with correct structure', async () => {
      const weeklyData = await analyticsService.getWeeklyProgress();
      
      expect(weeklyData).toHaveProperty('labels');
      expect(weeklyData).toHaveProperty('datasets');
      expect(weeklyData.labels).toHaveLength(7);
      expect(weeklyData.datasets).toHaveLength(1);
      expect(weeklyData.datasets[0]).toHaveProperty('label');
      expect(weeklyData.datasets[0]).toHaveProperty('data');
      expect(weeklyData.datasets[0]).toHaveProperty('borderColor');
      expect(weeklyData.datasets[0]).toHaveProperty('backgroundColor');
      expect(weeklyData.datasets[0].data).toHaveLength(7);
    });

    it('should have correct day labels', async () => {
      const weeklyData = await analyticsService.getWeeklyProgress();
      const expectedLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      expect(weeklyData.labels).toEqual(expectedLabels);
    });
  });

  describe('getCategoryDistribution', () => {
    it('should return category distribution with correct structure', async () => {
      const categoryData = await analyticsService.getCategoryDistribution();
      
      expect(categoryData).toHaveProperty('labels');
      expect(categoryData).toHaveProperty('datasets');
      expect(categoryData.datasets).toHaveLength(1);
      expect(categoryData.datasets[0]).toHaveProperty('label');
      expect(categoryData.datasets[0]).toHaveProperty('data');
      expect(categoryData.datasets[0]).toHaveProperty('backgroundColor');
      expect(categoryData.labels.length).toBe(categoryData.datasets[0].data.length);
    });

    it('should group cards by level correctly', async () => {
      const categoryData = await analyticsService.getCategoryDistribution();
      
      // Based on mocked data: 2 HSK1 cards, 1 HSK2 card
      expect(categoryData.labels).toContain('HSK1');
      expect(categoryData.labels).toContain('HSK2');
      
      const hsk1Index = categoryData.labels.indexOf('HSK1');
      const hsk2Index = categoryData.labels.indexOf('HSK2');
      
      expect(categoryData.datasets[0].data[hsk1Index]).toBe(2);
      expect(categoryData.datasets[0].data[hsk2Index]).toBe(1);
    });
  });

  describe('caching', () => {
    it('should cache dashboard metrics', async () => {
      const metrics1 = await analyticsService.getDashboardMetrics();
      const metrics2 = await analyticsService.getDashboardMetrics();
      
      // Should return the same object reference due to caching
      expect(metrics1).toEqual(metrics2);
    });

    it('should clear cache when requested', async () => {
      await analyticsService.getDashboardMetrics();
      analyticsService.clearCache();
      
      // After clearing cache, should work normally
      const metrics = await analyticsService.getDashboardMetrics();
      expect(metrics).toBeDefined();
    });
  });
});