import { Module } from '@nestjs/common';
import { MlService } from './ml.service';
import { RecommendationEngineService } from './recommendation-engine.service';
import { ProductSimilarityService } from './product-similarity.service';
import { DynamoDBService } from '../services/dynamodb.service';
import { CustomersModule } from '../customers/customers.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [CustomersModule, ProductsModule],
  providers: [
    MlService,
    RecommendationEngineService,
    ProductSimilarityService,
    DynamoDBService,
  ],
  exports: [MlService, RecommendationEngineService, ProductSimilarityService],
})
export class MlModule {}