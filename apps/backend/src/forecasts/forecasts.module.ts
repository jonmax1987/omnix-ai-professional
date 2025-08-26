import { Module } from '@nestjs/common';
import { ForecastsController } from './forecasts.controller';
import { ForecastsService } from './forecasts.service';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ProductsModule],
  controllers: [ForecastsController],
  providers: [ForecastsService],
  exports: [ForecastsService],
})
export class ForecastsModule {}