import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RecommendationsService } from './recommendations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/user.decorator';

@ApiTags('recommendations')
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get AI-powered recommendations with filtering and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: ['reorder', 'optimize', 'discontinue', 'promotion'] })
  @ApiQuery({ name: 'priority', required: false, enum: ['high', 'medium', 'low'] })
  @ApiResponse({ status: 200, description: 'Returns paginated list of recommendations' })
  async getRecommendations(@Query() query: any) {
    return await this.recommendationsService.getRecommendations(query);
  }

  @Post(':recommendationId/accept')
  @ApiOperation({ summary: 'Accept a recommendation' })
  @ApiResponse({ status: 200, description: 'Recommendation accepted successfully' })
  async acceptRecommendation(@Param('recommendationId') recommendationId: string) {
    return await this.recommendationsService.acceptRecommendation(recommendationId);
  }

  @Post(':recommendationId/dismiss')
  @ApiOperation({ summary: 'Dismiss a recommendation' })
  @ApiResponse({ status: 200, description: 'Recommendation dismissed successfully' })
  async dismissRecommendation(@Param('recommendationId') recommendationId: string) {
    return await this.recommendationsService.dismissRecommendation(recommendationId);
  }

  // Customer product recommendation endpoints
  @Get('customers/:customerId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get personalized product recommendations for a customer' })
  @ApiQuery({ name: 'context', required: false, enum: ['homepage', 'product_page', 'checkout', 'email'] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getCustomerRecommendations(
    @Param('customerId') customerId: string,
    @Query('context') context?: 'homepage' | 'product_page' | 'checkout' | 'email',
    @Query('limit') limit?: string,
  ) {
    return await this.recommendationsService.getCustomerRecommendations(
      customerId,
      context || 'homepage',
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Get('products/:productId/similar')
  @ApiOperation({ summary: 'Get similar products recommendations' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getSimilarProducts(
    @Param('productId') productId: string,
    @Query('limit') limit?: string,
  ) {
    return await this.recommendationsService.getSimilarProducts(
      productId,
      limit ? parseInt(limit, 10) : 5,
    );
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending products' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTrendingProducts(@Query('limit') limit?: string) {
    return await this.recommendationsService.getTrendingProducts(
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Get('seasonal')
  @ApiOperation({ summary: 'Get seasonal product recommendations' })
  @ApiQuery({ name: 'season', required: false, enum: ['spring', 'summer', 'autumn', 'winter', 'current'] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getSeasonalRecommendations(
    @Query('season') season?: string,
    @Query('limit') limit?: string,
  ) {
    return await this.recommendationsService.getSeasonalRecommendations(
      season || 'current',
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Post('complementary')
  @ApiOperation({ summary: 'Get complementary product recommendations' })
  async getComplementaryProducts(
    @Body() body: { productIds: string[]; limit?: number },
  ) {
    return await this.recommendationsService.getComplementaryProducts(
      body.productIds,
      body.limit || 5,
    );
  }

  @Post('feedback')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Track user feedback on recommendations' })
  async trackRecommendationFeedback(
    @CurrentUser() user: any,
    @Body() body: { productId: string; action: 'click' | 'purchase' | 'dismiss' },
  ) {
    return await this.recommendationsService.trackRecommendationFeedback(
      user.id,
      body.productId,
      body.action,
    );
  }
}