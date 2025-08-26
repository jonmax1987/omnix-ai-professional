import { AlertsService } from './alerts.service';
export declare class AlertsController {
    private readonly alertsService;
    constructor(alertsService: AlertsService);
    getAlerts(type?: string, severity?: string, limit?: string): Promise<{
        data: import("./alerts.service").Alert[];
        count: number;
    }>;
    dismissAlert(alertId: string): Promise<{
        message: string;
    }>;
}
