import json
import boto3
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any
import pandas as pd
from lambda_function import DemandForecaster, ForecastRequest

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

class BatchForecastProcessor:
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb')
        self.sqs = boto3.client('sqs')
        self.products_table = None
        self.forecasts_table = None
        self.historical_data_table = None
        self.stage = os.environ.get('STAGE', 'dev')
        
    def initialize_tables(self):
        """Initialize DynamoDB table references"""
        self.products_table = self.dynamodb.Table(f'omnix-products-{self.stage}')
        self.forecasts_table = self.dynamodb.Table(f'omnix-forecasts-{self.stage}')
        self.historical_data_table = self.dynamodb.Table(f'omnix-historical-data-{self.stage}')
    
    def get_active_products(self) -> List[Dict[str, Any]]:
        """Retrieve all active products that need forecasting"""
        try:
            response = self.products_table.scan(
                FilterExpression='attribute_exists(product_id) AND active = :active',
                ExpressionAttributeValues={':active': True}
            )
            
            return response.get('Items', [])
            
        except Exception as e:
            logger.error(f"Error retrieving products: {str(e)}")
            return []
    
    def get_historical_data(self, product_id: str, days: int = 90) -> List[Dict[str, Any]]:
        """Retrieve historical demand data for a product"""
        try:
            # Calculate date range
            end_date = datetime.now().date()
            start_date = end_date - timedelta(days=days)
            
            response = self.historical_data_table.query(
                KeyConditionExpression='product_id = :product_id AND #date BETWEEN :start_date AND :end_date',
                ExpressionAttributeNames={'#date': 'date'},
                ExpressionAttributeValues={
                    ':product_id': product_id,
                    ':start_date': start_date.isoformat(),
                    ':end_date': end_date.isoformat()
                },
                ScanIndexForward=True  # Sort by date ascending
            )
            
            return response.get('Items', [])
            
        except Exception as e:
            logger.error(f"Error retrieving historical data for {product_id}: {str(e)}")
            return []
    
    def save_forecast(self, product_id: str, forecast_data: Dict[str, Any]) -> bool:
        """Save forecast results to DynamoDB"""
        try:
            forecast_date = datetime.now().isoformat()
            
            item = {
                'product_id': product_id,
                'forecast_date': forecast_date,
                'forecast_data': forecast_data['forecast_data'],
                'trend': forecast_data['trend'],
                'seasonality': forecast_data['seasonality'],
                'accuracy': forecast_data['accuracy'],
                'next_order_date': forecast_data['next_order_date'],
                'recommended_quantity': forecast_data['recommended_quantity'],
                'confidence_metrics': forecast_data['confidence_metrics'],
                'created_at': forecast_date,
                'ttl': int((datetime.now() + timedelta(days=90)).timestamp())  # Expire after 90 days
            }
            
            self.forecasts_table.put_item(Item=item)
            return True
            
        except Exception as e:
            logger.error(f"Error saving forecast for {product_id}: {str(e)}")
            return False
    
    def process_product_forecast(self, product: Dict[str, Any]) -> bool:
        """Process forecast for a single product"""
        try:
            product_id = product['product_id']
            product_name = product.get('name', 'Unknown Product')
            
            logger.info(f"Processing forecast for {product_name} ({product_id})")
            
            # Get historical data
            historical_data = self.get_historical_data(product_id)
            
            if len(historical_data) < 7:
                logger.warning(f"Insufficient historical data for {product_id}: {len(historical_data)} records")
                return False
            
            # Prepare data for forecasting
            formatted_data = []
            for record in historical_data:
                formatted_data.append({
                    'date': record['date'],
                    'demand': record.get('demand', 0),
                    'price': record.get('price', product.get('price', 0)),
                    'promotion': record.get('promotion', 0)
                })
            
            # Create forecast request
            forecast_request = ForecastRequest(
                product_id=product_id,
                product_name=product_name,
                historical_data=formatted_data,
                forecast_days=30
            )
            
            # Generate forecast
            forecaster = DemandForecaster()
            result = forecaster.generate_forecast(forecast_request)
            
            # Save results
            forecast_data = {
                'forecast_data': result.forecast_data,
                'trend': result.trend,
                'seasonality': result.seasonality,
                'accuracy': result.accuracy,
                'next_order_date': result.next_order_date,
                'recommended_quantity': result.recommended_quantity,
                'confidence_metrics': result.confidence_metrics
            }
            
            success = self.save_forecast(product_id, forecast_data)
            
            if success:
                logger.info(f"Successfully processed forecast for {product_name}")
            else:
                logger.error(f"Failed to save forecast for {product_name}")
                
            return success
            
        except Exception as e:
            logger.error(f"Error processing forecast for product {product.get('product_id', 'unknown')}: {str(e)}")
            return False
    
    def run_batch_forecast(self) -> Dict[str, Any]:
        """Run batch forecasting for all products"""
        try:
            logger.info("Starting batch forecasting process")
            
            self.initialize_tables()
            
            # Get all active products
            products = self.get_active_products()
            logger.info(f"Found {len(products)} active products")
            
            if not products:
                return {
                    'success': True,
                    'message': 'No active products found',
                    'processed': 0,
                    'failed': 0
                }
            
            # Process each product
            processed = 0
            failed = 0
            
            for product in products:
                try:
                    success = self.process_product_forecast(product)
                    if success:
                        processed += 1
                    else:
                        failed += 1
                        
                except Exception as e:
                    logger.error(f"Unexpected error processing product {product.get('product_id')}: {str(e)}")
                    failed += 1
            
            logger.info(f"Batch forecasting completed. Processed: {processed}, Failed: {failed}")
            
            return {
                'success': True,
                'message': f'Batch forecasting completed successfully',
                'processed': processed,
                'failed': failed,
                'total_products': len(products)
            }
            
        except Exception as e:
            logger.error(f"Batch forecasting failed: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'processed': 0,
                'failed': 0
            }

def lambda_handler(event, context):
    """AWS Lambda handler for batch forecasting"""
    try:
        logger.info("Starting batch forecast Lambda execution")
        
        processor = BatchForecastProcessor()
        result = processor.run_batch_forecast()
        
        return {
            'statusCode': 200,
            'body': json.dumps(result, default=str)
        }
        
    except Exception as e:
        logger.error(f"Batch forecast Lambda error: {str(e)}")
        
        return {
            'statusCode': 500,
            'body': json.dumps({
                'success': False,
                'error': str(e)
            })
        }

if __name__ == "__main__":
    # Test the batch forecasting locally
    result = lambda_handler({}, None)
    print(json.dumps(result, indent=2))