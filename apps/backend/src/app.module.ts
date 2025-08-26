import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './services/database.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AlertsModule } from './alerts/alerts.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { ForecastsModule } from './forecasts/forecasts.module';
import { InventoryModule } from './inventory/inventory.module';
import { SystemModule } from './system/system.module';
import { OrdersModule } from './orders/orders.module';
import { WebSocketModule } from './websocket/websocket.module';
import { CustomersModule } from './customers/customers.module';
import { StreamingModule } from './streaming/streaming.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    ProductsModule,
    DashboardModule,
    AlertsModule,
    RecommendationsModule,
    ForecastsModule,
    InventoryModule,
    SystemModule,
    OrdersModule,
    WebSocketModule,
    CustomersModule,
    StreamingModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}