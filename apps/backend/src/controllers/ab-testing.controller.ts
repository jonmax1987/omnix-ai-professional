import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { EnhancedBedrockService } from '../services/enhanced-bedrock.service';
import { ABTestingService, ABTestConfig } from '../services/ab-testing.service';

export class CreateABTestDto {
  testId: string;
  testName: string;
  modelA: {
    id: string;
    name: string;
    weight: number;
  };
  modelB: {
    id: string;
    name: string;
    weight: number;
  };
  startDate: string;
  endDate: string;
  metrics: string[];
}

export class ABTestResultsDto {
  testId: string;
  includeRawData?: boolean;
}

@ApiTags('A/B Testing')
@Controller('v1/ab-tests')
export class ABTestingController {
  constructor(
    private readonly enhancedBedrockService: EnhancedBedrockService,
    private readonly abTestingService: ABTestingService,
  ) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create new A/B test',
    description: 'Create a new A/B test to compare different Bedrock models (Haiku vs Sonnet)'
  })
  @ApiBody({ type: CreateABTestDto })
  @ApiResponse({ status: 201, description: 'A/B test created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid test configuration' })
  async createABTest(@Body() createTestDto: CreateABTestDto) {
    console.log(`📊 Creating A/B test: ${createTestDto.testName}`);
    
    // Validate test configuration
    this.validateTestConfig(createTestDto);
    
    await this.enhancedBedrockService.createABTest(createTestDto);
    
    return {
      success: true,
      message: `A/B test '${createTestDto.testName}' created successfully`,
      testId: createTestDto.testId,
    };
  }

  @Get()
  @ApiOperation({ 
    summary: 'List all A/B tests',
    description: 'Get list of all A/B tests with their current status'
  })
  @ApiResponse({ status: 200, description: 'List of A/B tests retrieved successfully' })
  async listABTests() {
    const tests = await this.enhancedBedrockService.listABTests();
    
    return {
      success: true,
      data: tests,
      totalTests: tests.length,
      activeTests: tests.filter(test => test.active).length,
    };
  }

  @Get(':testId/results')
  @ApiOperation({ 
    summary: 'Get A/B test results',
    description: 'Retrieve detailed results and performance comparison for an A/B test'
  })
  @ApiParam({ name: 'testId', description: 'A/B test identifier' })
  @ApiResponse({ status: 200, description: 'A/B test results retrieved successfully' })
  @ApiResponse({ status: 404, description: 'A/B test not found' })
  async getABTestResults(
    @Param('testId') testId: string,
    @Query('includeRawData') includeRawData?: boolean
  ) {
    console.log(`📈 Generating results for A/B test: ${testId}`);
    
    const results = await this.enhancedBedrockService.getABTestResults(testId);
    
    // Filter raw data if not requested
    if (!includeRawData) {
      delete (results as any).rawMetrics;
    }
    
    return {
      success: true,
      data: results,
      summary: this.generateResultsSummary(results),
    };
  }

  @Put(':testId/deactivate')
  @ApiOperation({ 
    summary: 'Deactivate A/B test',
    description: 'Stop an active A/B test and prevent new assignments'
  })
  @ApiParam({ name: 'testId', description: 'A/B test identifier' })
  @ApiResponse({ status: 200, description: 'A/B test deactivated successfully' })
  @ApiResponse({ status: 404, description: 'A/B test not found' })
  async deactivateABTest(@Param('testId') testId: string) {
    console.log(`🛑 Deactivating A/B test: ${testId}`);
    
    await this.enhancedBedrockService.deactivateABTest(testId);
    
    return {
      success: true,
      message: `A/B test '${testId}' deactivated successfully`,
    };
  }

  @Get(':testId/status')
  @ApiOperation({ 
    summary: 'Get A/B test status',
    description: 'Get current status and basic metrics for an A/B test'
  })
  @ApiParam({ name: 'testId', description: 'A/B test identifier' })
  @ApiResponse({ status: 200, description: 'A/B test status retrieved successfully' })
  async getABTestStatus(@Param('testId') testId: string) {
    const results = await this.enhancedBedrockService.getABTestResults(testId);
    
    return {
      success: true,
      data: {
        testId: results.testId,
        testName: results.testName,
        status: results.status,
        startDate: results.startDate,
        endDate: results.endDate,
        modelsCompared: [results.modelA.name, results.modelB.name],
        totalRequests: results.modelA.metrics.totalRequests + results.modelB.metrics.totalRequests,
        currentWinner: results.winner,
        significance: results.significance,
      },
    };
  }

  @Post('quick-test')
  @ApiOperation({ 
    summary: 'Create quick Haiku vs Sonnet test',
    description: 'Create a standard 7-day A/B test comparing Claude 3 Haiku vs Sonnet models'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        testName: { type: 'string', example: 'Haiku vs Sonnet - Customer Profiling' },
        analysisType: { type: 'string', enum: ['consumption_prediction', 'customer_profiling', 'recommendation_generation'] },
        durationDays: { type: 'number', default: 7, minimum: 1, maximum: 30 },
        trafficSplit: { type: 'number', default: 50, minimum: 10, maximum: 90, description: 'Percentage for Model A (Haiku)' },
      },
      required: ['testName', 'analysisType']
    }
  })
  @ApiResponse({ status: 201, description: 'Quick A/B test created successfully' })
  async createQuickTest(
    @Body() quickTestDto: {
      testName: string;
      analysisType: 'consumption_prediction' | 'customer_profiling' | 'recommendation_generation';
      durationDays?: number;
      trafficSplit?: number;
    }
  ) {
    const testId = `quick-test-${Date.now()}`;
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + (quickTestDto.durationDays || 7) * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];
    const trafficSplit = quickTestDto.trafficSplit || 50;

    const testConfig: CreateABTestDto = {
      testId,
      testName: quickTestDto.testName,
      modelA: {
        id: 'claude-3-haiku',
        name: 'Claude 3 Haiku',
        weight: trafficSplit,
      },
      modelB: {
        id: 'claude-3-sonnet',
        name: 'Claude 3 Sonnet',
        weight: 100 - trafficSplit,
      },
      startDate,
      endDate,
      metrics: [quickTestDto.analysisType],
    };

    await this.enhancedBedrockService.createABTest(testConfig);

    return {
      success: true,
      message: `Quick A/B test created: ${quickTestDto.testName}`,
      testId,
      config: testConfig,
      estimatedCompletionDate: endDate,
    };
  }

  @Get('models/available')
  @ApiOperation({ 
    summary: 'List available models',
    description: 'Get list of available Bedrock models for A/B testing'
  })
  @ApiResponse({ status: 200, description: 'Available models retrieved successfully' })
  async getAvailableModels() {
    const availableModels = [
      {
        id: 'claude-3-haiku',
        name: 'Claude 3 Haiku',
        description: 'Fast and cost-effective model for high-volume applications',
        costPer1kTokens: { input: 0.00025, output: 0.00125 },
        avgResponseTime: '800ms',
        recommended: true,
      },
      {
        id: 'claude-3-sonnet',
        name: 'Claude 3 Sonnet',
        description: 'Balanced model with higher accuracy for complex analysis',
        costPer1kTokens: { input: 0.003, output: 0.015 },
        avgResponseTime: '1200ms',
        recommended: false,
      },
      {
        id: 'claude-3-5-sonnet',
        name: 'Claude 3.5 Sonnet',
        description: 'Latest model with enhanced reasoning capabilities',
        costPer1kTokens: { input: 0.003, output: 0.015 },
        avgResponseTime: '1400ms',
        recommended: false,
      },
    ];

    return {
      success: true,
      data: availableModels,
      totalModels: availableModels.length,
    };
  }

  /**
   * Validate A/B test configuration
   */
  private validateTestConfig(config: CreateABTestDto): void {
    if (!config.testId || !config.testName) {
      throw new Error('Test ID and name are required');
    }

    if (config.modelA.weight + config.modelB.weight !== 100) {
      throw new Error('Model weights must sum to 100');
    }

    if (new Date(config.startDate) >= new Date(config.endDate)) {
      throw new Error('End date must be after start date');
    }

    if (!config.metrics || config.metrics.length === 0) {
      throw new Error('At least one metric must be specified');
    }

    const validMetrics = ['consumption_prediction', 'customer_profiling', 'recommendation_generation'];
    const invalidMetrics = config.metrics.filter(metric => !validMetrics.includes(metric));
    
    if (invalidMetrics.length > 0) {
      throw new Error(`Invalid metrics: ${invalidMetrics.join(', ')}`);
    }
  }

  /**
   * Generate summary of A/B test results
   */
  private generateResultsSummary(results: any): any {
    const totalRequests = results.modelA.metrics.totalRequests + results.modelB.metrics.totalRequests;
    
    if (totalRequests === 0) {
      return {
        status: 'No data available',
        recommendation: 'Wait for more test data to be collected',
      };
    }

    const summary = {
      testDuration: this.calculateTestDuration(results.startDate, results.endDate),
      totalRequests,
      winner: results.winner,
      confidence: `${Math.round(results.significance * 100)}%`,
      keyFindings: [],
      recommendation: results.recommendations[0] || 'Continue monitoring test results',
    };

    // Add key findings
    if (results.winner !== 'tie') {
      const winner = results.winner === 'A' ? results.modelA : results.modelB;
      const loser = results.winner === 'A' ? results.modelB : results.modelA;
      
      if (winner.metrics.successRate > loser.metrics.successRate + 0.05) {
        summary.keyFindings.push(`${winner.name} has ${Math.round((winner.metrics.successRate - loser.metrics.successRate) * 100)}% higher success rate`);
      }
      
      if (winner.metrics.averageProcessingTime < loser.metrics.averageProcessingTime * 0.9) {
        summary.keyFindings.push(`${winner.name} is ${Math.round((1 - winner.metrics.averageProcessingTime / loser.metrics.averageProcessingTime) * 100)}% faster`);
      }
      
      if (winner.metrics.averageTokenCost < loser.metrics.averageTokenCost * 0.9) {
        summary.keyFindings.push(`${winner.name} is ${Math.round((1 - winner.metrics.averageTokenCost / loser.metrics.averageTokenCost) * 100)}% more cost-effective`);
      }
    }

    return summary;
  }

  /**
   * Calculate test duration in human-readable format
   */
  private calculateTestDuration(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day';
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays === 7) return '1 week';
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks`;
    return `${Math.ceil(diffDays / 30)} months`;
  }
}