import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { WebSocketModule } from '../websocket/websocket.module';
import { CustomersModule } from '../customers/customers.module';
import { KinesisStreamingService } from '../services/kinesis-streaming.service';

@Module({
  imports: [WebSocketModule, CustomersModule],
  controllers: [OrdersController],
  providers: [OrdersService, KinesisStreamingService],
  exports: [OrdersService],
})
export class OrdersModule {}