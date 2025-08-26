# AI Analysis API Documentation

## Overview

The AI Analysis API provides AI-powered customer analytics using AWS Bedrock with Claude 3. It analyzes customer purchase history to predict consumption patterns, generate customer profiles, and provide personalized recommendations.

## Base URL
```
https://api.omnix-ai.com/v1/customers/{customerId}
```

## Authentication
All endpoints require authentication via:
- **JWT Token**: `Authorization: Bearer {token}`
- **API Key**: `x-api-key: {api-key}`

## Endpoints

### 1. Complete AI Analysis
**GET** `/v1/customers/{customerId}/ai-analysis`

Performs comprehensive AI analysis including consumption patterns, customer profiling, and recommendations.

#### Parameters
- `customerId` (path) - Required. Customer ID to analyze

#### Response
```json
{
  "customerId": "ai-test-customer-001",
  "analysisDate": "2025-01-19T10:30:00Z",
  "consumptionPatterns": [
    {
      "productId": "prod-milk",
      "productName": "Whole Milk 1L",
      "category": "Dairy",
      "averageDaysBetweenPurchases": 5,
      "predictedNextPurchaseDate": "2025-01-24",
      "confidence": 0.85,
      "seasonalVariation": false
    }
  ],
  "customerProfile": {
    "customerId": "ai-test-customer-001",
    "spendingPatterns": {
      "averageOrderValue": 45.50,
      "preferredCategories": ["Dairy", "Fruits", "Vegetables"],
      "shoppingFrequency": "weekly",
      "pricePreference": "mid-range"
    },
    "behavioralInsights": {
      "plannedShopper": true,
      "brandLoyal": false,
      "seasonalShopper": false,
      "bulkBuyer": true
    },
    "demographics": {
      "estimatedAgeGroup": "25-35",
      "estimatedIncomeLevel": "medium-high",
      "familySize": 3,
      "lifestyle": ["health-conscious", "family-oriented"]
    }
  },
  "recommendations": [
    {
      "productId": "prod-yogurt",
      "productName": "Greek Yogurt",
      "reason": "Often purchased with dairy products, due for replenishment",
      "urgency": "medium",
      "predictedPurchaseDate": "2025-01-22"
    }
  ],
  "confidence": 0.78,
  "dataQuality": "good"
}
```

### 2. Consumption Predictions
**GET** `/v1/customers/{customerId}/consumption-predictions`

Analyzes purchase patterns to predict when customer will need specific products again.

#### Parameters
- `customerId` (path) - Required. Customer ID to analyze

#### Response
```json
{
  "customerId": "ai-test-customer-001",
  "analysisDate": "2025-01-19T10:30:00Z",
  "consumptionPatterns": [
    {
      "productId": "prod-milk",
      "productName": "Whole Milk 1L",
      "category": "Dairy",
      "averageDaysBetweenPurchases": 5,
      "predictedNextPurchaseDate": "2025-01-24",
      "confidence": 0.85,
      "seasonalVariation": false
    }
  ],
  "dataQuality": "good"
}
```

### 3. Customer Profile Analysis
**GET** `/v1/customers/{customerId}/customer-profile-analysis`

Generates detailed customer behavioral and demographic profile based on shopping patterns.

#### Response
```json
{
  "customerId": "ai-test-customer-001",
  "analysisDate": "2025-01-19T10:30:00Z",
  "customerProfile": {
    "customerId": "ai-test-customer-001",
    "spendingPatterns": {
      "averageOrderValue": 45.50,
      "preferredCategories": ["Dairy", "Fruits", "Vegetables"],
      "shoppingFrequency": "weekly",
      "pricePreference": "mid-range"
    },
    "behavioralInsights": {
      "plannedShopper": true,
      "brandLoyal": false,
      "seasonalShopper": false,
      "bulkBuyer": true
    },
    "demographics": {
      "estimatedAgeGroup": "25-35",
      "estimatedIncomeLevel": "medium-high",
      "familySize": 3,
      "lifestyle": ["health-conscious", "family-oriented"]
    }
  },
  "confidence": 0.72
}
```

### 4. AI Recommendations
**GET** `/v1/customers/{customerId}/ai-recommendations`

Generates personalized product recommendations based on AI analysis of purchase patterns.

#### Parameters
- `customerId` (path) - Required. Customer ID
- `limit` (query) - Optional. Number of recommendations (default: 5, max: 10)

#### Response
```json
{
  "customerId": "ai-test-customer-001",
  "analysisDate": "2025-01-19T10:30:00Z",
  "recommendations": [
    {
      "productId": "prod-yogurt",
      "productName": "Greek Yogurt",
      "reason": "Often purchased with dairy products, due for replenishment",
      "urgency": "medium",
      "predictedPurchaseDate": "2025-01-22"
    },
    {
      "productId": "prod-bread",
      "productName": "Whole Wheat Bread",
      "reason": "Regular weekly purchase, likely needed soon",
      "urgency": "high",
      "predictedPurchaseDate": "2025-01-20"
    }
  ]
}
```

### 5. Replenishment Alerts
**GET** `/v1/customers/{customerId}/replenishment-alerts`

Provides urgent and upcoming product replenishment alerts based on consumption patterns.

#### Response
```json
{
  "urgent": [
    {
      "productId": "prod-milk",
      "productName": "Whole Milk 1L",
      "category": "Dairy",
      "averageDaysBetweenPurchases": 5,
      "predictedNextPurchaseDate": "2025-01-20",
      "confidence": 0.85,
      "seasonalVariation": false
    }
  ],
  "upcoming": [
    {
      "productId": "prod-bread",
      "productName": "Whole Wheat Bread",
      "category": "Bakery",
      "averageDaysBetweenPurchases": 7,
      "predictedNextPurchaseDate": "2025-01-25",
      "confidence": 0.78,
      "seasonalVariation": false
    }
  ]
}
```

### 6. Purchase Prediction
**GET** `/v1/customers/{customerId}/purchase-prediction/{productId}`

Predicts when a customer will next purchase a specific product.

#### Parameters
- `customerId` (path) - Required. Customer ID
- `productId` (path) - Required. Product ID to predict

#### Response
```json
{
  "predictedDate": "2025-01-24",
  "confidence": 0.85,
  "averageDaysBetween": 5
}
```

### 7. Trigger Manual Analysis
**POST** `/v1/customers/{customerId}/analyze`

Triggers a new AI analysis for the customer, bypassing cache.

#### Response
```json
{
  "customerId": "ai-test-customer-001",
  "analysisDate": "2025-01-19T10:30:00Z",
  "status": "completed",
  "processingTime": 2456,
  "dataQuality": "good"
}
```

### 8. Analysis History
**GET** `/v1/customers/{customerId}/analysis-history`

Retrieves historical AI analysis results for the customer.

#### Parameters
- `customerId` (path) - Required. Customer ID
- `limit` (query) - Optional. Number of historical records (default: 10, max: 50)

#### Response
```json
[
  {
    "customerId": "ai-test-customer-001",
    "analysisDate": "2025-01-19T10:30:00Z",
    "confidence": 0.78,
    "dataQuality": "good",
    "patternsFound": 12,
    "recommendationsGenerated": 5
  },
  {
    "customerId": "ai-test-customer-001",
    "analysisDate": "2025-01-18T09:15:00Z",
    "confidence": 0.75,
    "dataQuality": "fair",
    "patternsFound": 10,
    "recommendationsGenerated": 4
  }
]
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid customer ID format",
  "statusCode": 400
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Customer not found or has no purchase history",
  "statusCode": 404
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "AI analysis service temporarily unavailable",
  "statusCode": 500,
  "fallbackData": {
    "customerId": "ai-test-customer-001",
    "basicAnalysis": "...",
    "confidence": 0.3,
    "note": "Generated using fallback analysis"
  }
}
```

## Data Models

### ConsumptionPattern
```typescript
interface ConsumptionPattern {
  productId: string;
  productName: string;
  category: string;
  averageDaysBetweenPurchases: number;
  predictedNextPurchaseDate: string; // YYYY-MM-DD
  confidence: number; // 0-1
  seasonalVariation?: boolean;
}
```

### CustomerProfile
```typescript
interface CustomerProfile {
  customerId: string;
  spendingPatterns: {
    averageOrderValue: number;
    preferredCategories: string[];
    shoppingFrequency: 'daily' | 'weekly' | 'monthly' | 'irregular';
    pricePreference: 'budget' | 'mid-range' | 'premium';
  };
  behavioralInsights: {
    plannedShopper: boolean;
    brandLoyal: boolean;
    seasonalShopper: boolean;
    bulkBuyer: boolean;
  };
  demographics: {
    estimatedAgeGroup: string;
    estimatedIncomeLevel: string;
    familySize: number;
    lifestyle: string[];
  };
}
```

### Recommendation
```typescript
interface Recommendation {
  productId: string;
  productName: string;
  reason: string;
  urgency: 'low' | 'medium' | 'high';
  predictedPurchaseDate: string; // YYYY-MM-DD
}
```

## Rate Limits

- **Standard Endpoints**: 100 requests per minute per customer
- **AI Analysis Endpoints**: 10 requests per minute per customer
- **Manual Analysis Trigger**: 5 requests per hour per customer

## Caching

- AI analysis results are cached for 24 hours
- Replenishment alerts are cached for 6 hours
- Purchase predictions are cached for 12 hours

## Fallback Behavior

When AWS Bedrock is unavailable, the API provides fallback analysis using rule-based algorithms:

- Lower confidence scores (≤ 0.7)
- Basic pattern recognition
- Simple frequency analysis
- Reduced recommendation accuracy
- `"fallbackUsed": true` in response metadata

## Testing

Use the provided test customer ID for development:
- **Test Customer ID**: `ai-test-customer-001`
- **Sample Purchase History**: Includes 3+ months of realistic shopping data
- **Categories**: Dairy, Fruits, Vegetables, Meat, Grains, Beverages

### Test Script
```bash
# Run comprehensive API tests
node test-ai-analysis.js

# Test specific endpoint
curl -H "Authorization: Bearer {token}" \
     "https://api.omnix-ai.com/v1/customers/ai-test-customer-001/ai-analysis"
```

## Configuration

### Environment Variables
```env
AWS_BEDROCK_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
AI_ANALYSIS_ENABLED=true
```

### AWS IAM Permissions Required
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": [
        "arn:aws:bedrock:*:*:model/anthropic.claude-3-haiku-20240307-v1:0"
      ]
    }
  ]
}
```

## Support

For issues or questions regarding the AI Analysis API:
1. Check the fallback response for basic analysis
2. Verify AWS Bedrock access and permissions
3. Review error logs for specific error messages
4. Contact the development team with customer ID and timestamp