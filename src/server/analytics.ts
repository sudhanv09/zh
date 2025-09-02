import { createServerFn } from '@tanstack/solid-start';
import { analyticsService } from '~/service/analytics-service';
import type { DashboardMetrics, WeeklyProgressData, CategoryData } from '~/service/analytics-service';


export const getDashboardMetrics = createServerFn({
    method: 'GET'
}).handler(async (): Promise<DashboardMetrics> => {
    try {
        return await analyticsService.getDashboardMetrics();
    } catch (error) {
        console.error('Failed to get dashboard metrics:', error);
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
});


export const getWeeklyProgress = createServerFn({
    method: 'GET'
}).handler(async (): Promise<WeeklyProgressData> => {
    try {
        return await analyticsService.getWeeklyProgress();
    } catch (error) {
        console.error('Failed to get weekly progress:', error);
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
});


export const getCategoryDistribution = createServerFn({
    method: 'GET'
}).handler(async (): Promise<CategoryData> => {
    try {
        return await analyticsService.getCategoryDistribution();
    } catch (error) {
        console.error('Failed to get category distribution:', error);
        return {
            labels: ['No Data'],
            datasets: [{
                label: 'Categories',
                data: [0],
                backgroundColor: ['#6b7280'],
            }]
        };
    }
});