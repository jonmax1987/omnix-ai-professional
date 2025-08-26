# OMNIX AI - Demand Forecasting Lambda Service

This directory contains the Python-based AWS Lambda functions for AI-powered demand forecasting and inventory recommendations using Facebook Prophet and scikit-learn.

## 🎯 Features

### 📈 Demand Forecasting
- **Facebook Prophet Integration** - Advanced time series forecasting with seasonality detection
- **Trend Analysis** - Automatic detection of increasing, decreasing, or stable trends
- **Confidence Intervals** - Statistical confidence bands for forecast reliability
- **Multiple Timeframes** - Support for 7-day to 90-day forecast periods
- **External Regressors** - Price and promotion impact modeling

### 🎯 AI Recommendations
- **Reorder Recommendations** - Smart alerts for low-stock situations
- **Inventory Optimization** - Reduce carrying costs for overstocked items
- **Promotional Opportunities** - Identify slow-moving inventory for promotions
- **Priority Scoring** - High/Medium/Low priority classification
- **Confidence Metrics** - AI-powered confidence scores for each recommendation

### ⚡ Performance Features
- **Batch Processing** - Scheduled daily forecasting for all products
- **SQS Integration** - Asynchronous processing with dead letter queues
- **DynamoDB Storage** - Scalable storage for forecasts and historical data
- **Lambda Layers** - Optimized deployment with shared dependencies
- **Monitoring** - AWS CloudWatch integration with custom metrics

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   API Gateway   │────│  Lambda Function │────│   DynamoDB      │
│                 │    │  (Forecasting)   │    │   (Forecasts)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                │
                       ┌──────────────────┐    ┌─────────────────┐
                       │  SQS Queue       │────│   Lambda        │
                       │  (Batch Jobs)    │    │   (Batch)       │
                       └──────────────────┘    └─────────────────┘
                                │
                                │
                       ┌──────────────────┐    ┌─────────────────┐
                       │  CloudWatch      │    │   DynamoDB      │
                       │  (Scheduled)     │    │   (Historical)  │
                       └──────────────────┘    └─────────────────┘
```

## 📦 Dependencies

### Core ML Libraries
- **pandas** (2.1.4) - Data manipulation and analysis
- **numpy** (1.24.4) - Numerical computing
- **prophet** (1.1.4) - Time series forecasting
- **scikit-learn** (1.3.2) - Machine learning utilities
- **statsmodels** (0.14.0) - Statistical modeling

### AWS Integration
- **boto3** (1.34.0) - AWS SDK for Python
- **aws-lambda-powertools** (2.25.0) - Lambda utilities (logging, metrics, tracing)

### Utilities
- **pydantic** (2.5.0) - Data validation
- **requests** (2.31.0) - HTTP client
- **plotly** (5.17.0) - Data visualization (optional)

## 🚀 Deployment

### Prerequisites
```bash
# Install Serverless Framework globally
npm install -g serverless

# Install project dependencies
npm install

# Install Python dependencies (handled by serverless-python-requirements)
```

### Development Deployment
```bash
# Deploy to development environment
npm run deploy:dev

# Test locally
npm run test-local

# Run offline development server
npm run offline
```

### Production Deployment
```bash
# Deploy to production environment
npm run deploy:prod

# Monitor logs
npm run logs
```

## 🧪 Testing

### Local Testing
```bash
# Test the main function locally
python lambda_function.py

# Test with Serverless offline
npm run invoke:local

# Run comprehensive tests
npm run test
```

### API Testing

#### Forecast Request
```bash
curl -X POST https://api-url/v1/ai/forecast \
  -H "Content-Type: application/json" \
  -d '{
    "action": "forecast",
    "data": {
      "product_id": "COF-001",
      "product_name": "Premium Coffee Beans",
      "historical_data": [
        {"date": "2025-07-01", "demand": 45},
        {"date": "2025-07-02", "demand": 52},
        ...
      ],
      "forecast_days": 30
    }
  }'
```

#### Recommendations Request
```bash
curl -X POST https://api-url/v1/ai/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "action": "recommendations",
    "products_data": [
      {
        "product_id": "COF-001",
        "product_name": "Premium Coffee Beans",
        "current_stock": 15,
        "min_threshold": 25,
        "avg_daily_demand": 3.2,
        "price": 12.99
      }
    ]
  }'
```

## 📊 Expected Response Formats

### Forecast Response
```json
{
  "success": true,
  "data": {
    "product_id": "COF-001",
    "product_name": "Premium Coffee Beans",
    "forecast_data": [
      {
        "date": "2025-08-11",
        "predicted": 48,
        "confidence": 0.87
      }
    ],
    "trend": "increasing",
    "seasonality": "medium",
    "accuracy": 89.2,
    "next_order_date": "2025-08-20",
    "recommended_quantity": 150,
    "confidence_metrics": {
      "overall_confidence": 0.892,
      "trend_strength": 0.8,
      "seasonality_strength": 0.7,
      "data_quality": 0.95
    }
  }
}
```

### Recommendations Response
```json
{
  "success": true,
  "data": [
    {
      "id": "rec_reorder_COF-001",
      "type": "reorder",
      "priority": "high",
      "product_id": "COF-001",
      "product_name": "Premium Coffee Beans",
      "title": "Urgent Reorder Required",
      "description": "Stock will run out in approximately 5 days at current consumption rate.",
      "impact": "High risk of stockout",
      "action": "Order 150 units immediately to maintain service levels",
      "estimated_savings": 2400,
      "days_until_action": 5,
      "confidence": 0.92,
      "created_at": "2025-08-10T14:30:00Z"
    }
  ]
}
```

## 📈 Performance Characteristics

### Forecasting Performance
- **Cold Start**: ~3-5 seconds (with Lambda layers)
- **Warm Execution**: ~500-1500ms per forecast
- **Batch Processing**: ~1000 products in 10-15 minutes
- **Memory Usage**: 512MB-1GB depending on data size
- **Accuracy Range**: 75-95% depending on data quality

### Cost Optimization
- **Lambda Layers**: Shared dependencies reduce deployment size
- **Memory Scaling**: Dynamic memory allocation based on workload
- **SQS Batching**: Reduces Lambda invocations for batch jobs
- **DynamoDB On-Demand**: Pay-per-request pricing for variable workloads

## 🔧 Configuration

### Environment Variables
- `STAGE`: Deployment stage (dev/prod)
- `SERVICE`: Service name for resource naming
- `PYTHONPATH`: Python module path

### DynamoDB Tables
- `omnix-forecasts-{stage}`: Stores forecast results
- `omnix-historical-data-{stage}`: Historical demand data
- `omnix-products-{stage}`: Product master data

### SQS Queues
- `omnix-forecasting-queue-{stage}`: Main processing queue
- `omnix-forecasting-dlq-{stage}`: Dead letter queue for failed messages

## 🔍 Monitoring & Observability

### CloudWatch Metrics
- `ForecastGenerated`: Number of forecasts created
- `RecommendationsGenerated`: Number of recommendations created
- Lambda execution metrics (duration, memory, errors)

### Logging
- Structured JSON logging with correlation IDs
- Error tracking with stack traces
- Performance metrics and timing

### Tracing
- AWS X-Ray integration for distributed tracing
- Request/response correlation across services

## 🛡️ Security

### IAM Permissions
- Minimal required permissions for DynamoDB, SQS, and CloudWatch
- No internet access required (VPC optional)
- Secrets management via AWS Systems Manager

### Data Privacy
- No sensitive data logged
- PII handling compliant with data protection standards
- Encryption at rest and in transit

## 🚨 Error Handling

### Retry Logic
- Automatic retries for transient failures
- Exponential backoff for API calls
- Dead letter queue for persistent failures

### Graceful Degradation
- Fallback to simple moving averages if Prophet fails
- Default accuracy assumptions when validation data insufficient
- Error boundaries prevent cascade failures

## 📝 Development Notes

### Adding New Features
1. Update `lambda_function.py` with new logic
2. Add corresponding tests
3. Update API documentation
4. Deploy to development environment first

### Performance Tuning
- Monitor CloudWatch metrics for optimization opportunities
- Adjust memory allocation based on actual usage
- Consider provisioned concurrency for consistent performance

### Debugging
- Use CloudWatch logs for runtime debugging
- Enable X-Ray tracing for complex request flows
- Test locally with `serverless offline`