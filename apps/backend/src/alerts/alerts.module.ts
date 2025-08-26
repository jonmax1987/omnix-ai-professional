import { Module } from '@nestjs/common';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { ProductsModule } from '../products/products.module';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [ProductsModule, WebSocketModule],
  controllers: [AlertsController],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {}