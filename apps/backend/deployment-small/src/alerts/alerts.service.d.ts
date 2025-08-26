export interface Alert {
    id: string;
    type: 'low-stock' | 'out-of-stock' | 'expired' | 'forecast-warning' | 'system';
    productId?: string;
    productName?: string;
    severity: 'high' | 'medium' | 'low';
    message: string;
    details?: string;
    actionRequired: boolean;
    createdAt: string;
    expiresAt?: string;
    dismissedAt?: string;
    dismissedBy?: string;
}
export declare class AlertsService {
    private alerts;
    findAll(type?: string, severity?: string, limit?: number): Promise<{
        data: Alert[];
        count: number;
    }>;
    dismissAlert(id: string): Promise<boolean>;
}
