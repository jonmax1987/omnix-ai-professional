#!/usr/bin/env node
/**
 * Configuration Extractor for Deployment Scripts
 * Extracts configuration values from YAML files for bash scripts
 */

const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

function loadConfiguration(environment) {
    try {
        const configPath = path.join(__dirname, 'config', 'deployment-config.yaml');
        
        if (!fs.existsSync(configPath)) {
            throw new Error(`Master configuration file not found: ${configPath}`);
        }

        const masterConfig = yaml.load(fs.readFileSync(configPath, 'utf8'));
        
        if (!masterConfig.environments || !masterConfig.environments[environment]) {
            throw new Error(`Environment '${environment}' not found in configuration`);
        }

        const envConfig = masterConfig.environments[environment];
        const globalConfig = masterConfig.global || {};

        return {
            aws_region: envConfig.aws_region || globalConfig.default_region,
            s3_bucket: envConfig.frontend?.s3_bucket,
            lambda_function_name: envConfig.backend?.lambda_function_name,
            api_gateway_id: envConfig.backend?.api_gateway_id,
            cloudfront_distribution_id: envConfig.frontend?.cloudfront_distribution_id,
            api_base_url: envConfig.frontend?.api_base_url,
            api_key: envConfig.environment_variables?.API_KEY,
            stage: envConfig.stage,
            cloudfront_domain: envConfig.frontend?.cloudfront_domain
        };

    } catch (error) {
        console.error(`Error loading configuration: ${error.message}`);
        process.exit(1);
    }
}

function main() {
    const [,, environment, key] = process.argv;
    
    if (!environment) {
        console.error('Usage: node extract-config.js <environment> [key]');
        console.error('Environments: development, staging, production');
        console.error('Keys: aws_region, s3_bucket, lambda_function_name, api_gateway_id, cloudfront_distribution_id');
        process.exit(1);
    }

    const config = loadConfiguration(environment);

    if (key) {
        // Return specific key value
        const value = config[key];
        if (value !== undefined && value !== null) {
            console.log(value);
        } else {
            console.error(`Key '${key}' not found in configuration for environment '${environment}'`);
            process.exit(1);
        }
    } else {
        // Return all values as environment variables
        Object.entries(config).forEach(([k, v]) => {
            if (v !== undefined && v !== null) {
                console.log(`export ${k.toUpperCase()}="${v}"`);
            }
        });
    }
}

if (require.main === module) {
    main();
}

module.exports = { loadConfiguration };