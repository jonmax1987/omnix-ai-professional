#!/usr/bin/env node

// OMNIX AI - Batch Job Processor
// Processes batch analysis jobs from SQS queue

const { BatchProcessingService } = require('./src/services/batch-processing.service');

async function startBatchProcessor() {
    console.log('🚀 Starting OMNIX AI Batch Processor');
    console.log('===================================');
    
    const batchService = new BatchProcessingService();
    
    try {
        // Get queue stats
        const queueStats = await batchService.getQueueStats();
        console.log('📊 Queue Statistics:');
        console.log(`   Messages in queue: ${queueStats.approximateNumberOfMessages}`);
        console.log(`   Processing: ${queueStats.approximateNumberOfMessagesNotVisible}`);
        console.log(`   Oldest message age: ${queueStats.approximateAgeOfOldestMessage}s`);
        console.log('');
        
        if (queueStats.approximateNumberOfMessages === 0) {
            console.log('📭 No messages in queue. Exiting...');
            return;
        }
        
        // Start processing (this will run continuously)
        console.log('⚡ Starting batch job processing...');
        await batchService.processBatchJobs(10); // Max 10 concurrent jobs
        
    } catch (error) {
        console.error('❌ Batch processor failed:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

if (require.main === module) {
    startBatchProcessor().catch(console.error);
}
