import { ForecastsService } from './forecasts.service';
export declare class ForecastsController {
    private readonly forecastsService;
    constructor(forecastsService: ForecastsService);
    getMetrics(): Promise<{
        data: {
            totalForecasts: number;
            averageAccuracy: number;
            upcomingReorders: number;
            potentialSavings: number;
            criticalItems: number;
        };
    }>;
    getForecasts(query: any): Promise<{
        data: ({
            productId: string;
            productName: string;
            productSku: string;
            forecastDays: number;
            data: any[];
            trend: "increasing";
            seasonality: "high";
            accuracy: number;
            nextOrderDate: string;
            recommendedQuantity: number;
        } | {
            productId: string;
            productName: string;
            productSku: string;
            forecastDays: number;
            data: any[];
            trend: "stable";
            seasonality: "low";
            accuracy: number;
            nextOrderDate: string;
            recommendedQuantity: number;
        } | {
            productId: string;
            productName: string;
            productSku: string;
            forecastDays: number;
            data: any[];
            trend: "decreasing";
            seasonality: "medium";
            accuracy: number;
            nextOrderDate: string;
            recommendedQuantity: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
        meta: {
            totalForecasts: number;
            averageAccuracy: number;
            upcomingReorders: number;
            potentialSavings: number;
            criticalItems: number;
        };
    }>;
    getForecast(productId: string, days?: number): Promise<{
        data: {
            productId: string;
            productName: string;
            productSku: string;
            forecastDays: number;
            data: any[];
            trend: "increasing";
            seasonality: "high";
            accuracy: number;
            nextOrderDate: string;
            recommendedQuantity: number;
        };
    }>;
}
