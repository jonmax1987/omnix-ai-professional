#!/usr/bin/env node

// OMNIX AI - Batch Analysis Example
// Demonstrates how to submit large batch analysis requests

const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// Sample test customers with purchase history
const generateTestCustomers = (count = 50) => {
    const customers = [];
    const products = [
        { name: 'Milk', category: 'Dairy', price: 3.50 },
        { name: 'Bread', category: 'Bakery', price: 2.25 },
        { name: 'Chicken', category: 'Meat', price: 8.99 },
        { name: 'Bananas', category: 'Fruits', price: 1.29 },
        { name: 'Yogurt', category: 'Dairy', price: 4.50 },
    ];
    
    for (let i = 0; i < count; i++) {
        const customerId = `batch-customer-${i + 1}`;
        const purchases = [];
        
        // Generate 20-50 purchases per customer over last 6 months
        const numPurchases = Math.floor(Math.random() * 30) + 20;
        
        for (let j = 0; j < numPurchases; j++) {
            const product = products[Math.floor(Math.random() * products.length)];
            const daysAgo = Math.floor(Math.random() * 180);
            const purchaseDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
            
            purchases.push({
                productId: `prod-${product.name.toLowerCase()}`,
                productName: product.name,
                category: product.category,
                quantity: Math.floor(Math.random() * 3) + 1,
                price: product.price,
                purchaseDate: purchaseDate.toISOString(),
            });
        }
        
        customers.push({
            customerId,
            purchases: purchases.sort((a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate)),
            priority: i < 10 ? 'high' : (i < 30 ? 'normal' : 'low'), // First 10 are high priority
        });
    }
    
    return customers;
};

async function runBatchAnalysisExample() {
    console.log('⚡ OMNIX AI - Batch Analysis Example');
    console.log('===================================');
    
    try {
        // Generate test customers
        console.log('🔄 Generating test customers...');
        const customers = generateTestCustomers(100); // 100 customers
        
        console.log(`✅ Generated ${customers.length} test customers`);
        console.log(`   Average purchases per customer: ${Math.round(customers.reduce((sum, c) => sum + c.purchases.length, 0) / customers.length)}`);
        
        // Submit batch request
        console.log('\n📋 Submitting batch analysis request...');
        
        const batchRequest = {
            customers,
            analysisTypes: ['consumption_prediction', 'customer_profiling', 'recommendation_generation'],
            options: {
                maxConcurrent: 10,
                batchSize: 20,
                delayBetweenBatches: 1000, // 1 second
            },
        };
        
        const response = await axios.post(`${API_BASE_URL}/v1/customers/batch-analysis`, batchRequest);
        
        const { batchId, jobCount, estimatedCost } = response.data;
        
        console.log(`✅ Batch request submitted successfully!`);
        console.log(`   Batch ID: ${batchId}`);
        console.log(`   Jobs created: ${jobCount}`);
        console.log(`   Estimated cost: $${estimatedCost.toFixed(4)}`);
        
        // Monitor batch progress
        console.log('\n📊 Monitoring batch progress...');
        let completed = false;
        let attempts = 0;
        const maxAttempts = 60; // 10 minutes max
        
        while (!completed && attempts < maxAttempts) {
            attempts++;
            
            try {
                const statusResponse = await axios.get(`${API_BASE_URL}/v1/customers/batch-analysis/${batchId}`);
                const { stats, jobs } = statusResponse.data;
                
                const progress = stats.totalJobs > 0 ? ((stats.completedJobs + stats.failedJobs) / stats.totalJobs * 100) : 0;
                
                console.log(`   Progress: ${progress.toFixed(1)}% (${stats.completedJobs}/${stats.totalJobs} completed, ${stats.failedJobs} failed, ${stats.processingJobs} processing)`);
                
                if (stats.completedJobs + stats.failedJobs === stats.totalJobs) {
                    completed = true;
                    console.log('\n🎉 Batch analysis completed!');
                    console.log(`   Success rate: ${stats.successRate.toFixed(1)}%`);
                    console.log(`   Average processing time: ${stats.averageProcessingTime.toFixed(2)}s`);
                    console.log(`   Total cost: $${stats.totalCost.toFixed(4)}`);
                    
                    if (stats.failedJobs > 0) {
                        console.log(`   ⚠️  ${stats.failedJobs} jobs failed - check logs for details`);
                    }
                    
                    break;
                }
                
                await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
                
            } catch (error) {
                console.log(`   ⚠️  Status check failed: ${error.message}`);
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds on error
            }
        }
        
        if (!completed) {
            console.log('\n⏰ Batch monitoring timeout reached. Check dashboard for current status.');
        }
        
    } catch (error) {
        console.error('❌ Batch analysis example failed:', error.response?.data || error.message);
    }
}

if (require.main === module) {
    runBatchAnalysisExample().catch(console.error);
}

module.exports = { runBatchAnalysisExample, generateTestCustomers };
