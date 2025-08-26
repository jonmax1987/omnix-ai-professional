import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { DynamoDBService } from '../services/dynamodb.service';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [WebSocketModule],
  controllers: [ProductsController],
  providers: [ProductsService, DynamoDBService],
  exports: [ProductsService],
})
export class ProductsModule {}