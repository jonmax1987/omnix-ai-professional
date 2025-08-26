#!/usr/bin/env node

// OMNIX AI - Cache Optimization Analysis
// Analyzes cache performance and provides optimization recommendations

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'eu-central-1' });

async function analyzeCachePerformance() {
    console.log('🚀 OMNIX AI - Cache Performance Analysis');
    console.log('=======================================');
    
    try {
        // Get cache entries from last 24 hours
        const endTime = new Date().toISOString();
        const startTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        
        const result = await dynamodb.scan({
            TableName: 'omnix-ai-analysis-cache-dev',
            FilterExpression: 'createdAt BETWEEN :start AND :end',
            ExpressionAttributeValues: {
                ':start': startTime,
                ':end': endTime
            }
        }).promise();
        
        if (!result.Items || result.Items.length === 0) {
            console.log('📊 No cache entries found for the last 24 hours');
            return;
        }
        
        const items = result.Items;
        const totalEntries = items.length;
        const totalHits = items.reduce((sum, item) => sum + (item.hitCount || 0), 0);
        
        // Group by analysis type
        const byType = {};
        items.forEach(item => {
            if (!byType[item.analysisType]) {
                byType[item.analysisType] = { entries: 0, hits: 0 };
            }
            byType[item.analysisType].entries++;
            byType[item.analysisType].hits += item.hitCount || 0;
        });
        
        console.log('\n📈 Cache Statistics (Last 24 Hours)');
        console.log('-----------------------------------');
        console.log(`Total Cache Entries: ${totalEntries}`);
        console.log(`Total Cache Hits: ${totalHits}`);
        console.log(`Average Hits per Entry: ${(totalHits / totalEntries).toFixed(2)}`);
        
        console.log('\n🎯 Performance by Analysis Type');
        console.log('-------------------------------');
        Object.entries(byType).forEach(([type, data]) => {
            const hitRate = data.hits / data.entries;
            console.log(`${type}: ${data.entries} entries, ${data.hits} hits (${hitRate.toFixed(2)} hits/entry)`);
        });
        
        // Optimization recommendations
        console.log('\n💡 Cache Optimization Recommendations');
        console.log('------------------------------------');
        
        if (totalHits / totalEntries < 1) {
            console.log('⚠️  Low cache utilization detected');
            console.log('   Recommendations:');
            console.log('   • Increase cache TTL for frequently accessed analyses');
            console.log('   • Implement cache warming for high-value customers');
            console.log('   • Review cache invalidation strategy');
        }
        
        if (totalEntries > 1000) {
            console.log('💾 High cache volume detected');
            console.log('   Recommendations:');
            console.log('   • Monitor DynamoDB costs');
            console.log('   • Implement cache cleanup for low-hit entries');
            console.log('   • Consider cache size limits per customer');
        }
        
        // Check for expired entries
        const now = new Date();
        const expiredEntries = items.filter(item => new Date(item.expiresAt) < now);
        if (expiredEntries.length > totalEntries * 0.1) {
            console.log('🗑️  High percentage of expired entries');
            console.log('   Recommendations:');
            console.log('   • Implement automatic cleanup of expired entries');
            console.log('   • Review TTL settings for different analysis types');
        }
        
        if (totalHits / totalEntries > 2 && totalEntries > 100) {
            console.log('✅ Excellent cache performance! System is well-optimized.');
            console.log('💰 Estimated significant cost savings from caching');
        }
        
    } catch (error) {
        console.error('❌ Error analyzing cache performance:', error);
    }
}

analyzeCachePerformance();
