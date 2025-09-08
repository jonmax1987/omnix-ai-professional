/**
 * Test Configuration System
 */

const fs = require('fs');

// Test if we can load the configuration modules without AWS SDK dependencies
async function testConfigurationSystem() {
    const results = {
        moduleLoads: {},
        configLoads: {},
        errors: []
    };
    
    console.log('🔧 Testing Configuration System...');
    console.log('');
    
    // Test 1: Module Loading
    console.log('### 2.1 Module Loading Test');
    console.log('');
    
    try {
        // Test ConfigurationManager loading
        console.log('Testing ConfigurationManager...');
        const { ConfigurationManager } = require('./deployment/lib/ConfigurationManager');
        results.moduleLoads.ConfigurationManager = 'SUCCESS - Module loaded';
        console.log('✅ ConfigurationManager: Module loaded successfully');
    } catch (error) {
        results.moduleLoads.ConfigurationManager = `FAILED - ${error.message}`;
        console.log('❌ ConfigurationManager: Failed to load -', error.message);
        results.errors.push('ConfigurationManager load failed');
    }
    
    try {
        // Test ConfigurationValidator loading  
        console.log('Testing ConfigurationValidator...');
        const { ConfigurationValidator } = require('./deployment/lib/ConfigurationValidator');
        results.moduleLoads.ConfigurationValidator = 'SUCCESS - Module loaded';
        console.log('✅ ConfigurationValidator: Module loaded successfully');
    } catch (error) {
        results.moduleLoads.ConfigurationValidator = `FAILED - ${error.message}`;
        console.log('❌ ConfigurationValidator: Failed to load -', error.message);
        results.errors.push('ConfigurationValidator load failed');
    }
    
    console.log('');
    console.log('### 2.2 Configuration Loading Test');
    console.log('');
    
    // Test 2: Configuration Loading (without AWS dependencies)
    try {
        const yaml = require('js-yaml');
        
        // Test loading master config
        console.log('Testing master configuration loading...');
        const masterConfigPath = './config/deployment-config.yaml';
        if (fs.existsSync(masterConfigPath)) {
            const masterConfig = yaml.load(fs.readFileSync(masterConfigPath, 'utf8'));
            
            if (masterConfig.global && masterConfig.environments) {
                results.configLoads.masterConfig = 'SUCCESS - Valid structure';
                console.log('✅ Master Config: Valid structure with global and environments sections');
            } else {
                results.configLoads.masterConfig = 'FAILED - Missing required sections';
                console.log('❌ Master Config: Missing required sections (global/environments)');
                results.errors.push('Master config structure invalid');
            }
        } else {
            results.configLoads.masterConfig = 'FAILED - File not found';
            console.log('❌ Master Config: File not found');
            results.errors.push('Master config file missing');
        }
        
        // Test loading environment configs
        const environments = ['development', 'staging', 'production'];
        for (const env of environments) {
            console.log(`Testing ${env} environment configuration...`);
            const envConfigPath = `./config/environments/${env}.yaml`;
            
            if (fs.existsSync(envConfigPath)) {
                const envConfig = yaml.load(fs.readFileSync(envConfigPath, 'utf8'));
                
                if (envConfig.environment === env) {
                    results.configLoads[`${env}Config`] = 'SUCCESS - Environment matches';
                    console.log(`✅ ${env} Config: Environment field matches (${env})`);
                } else {
                    results.configLoads[`${env}Config`] = `FAILED - Environment mismatch (expected: ${env}, got: ${envConfig.environment})`;
                    console.log(`❌ ${env} Config: Environment mismatch`);
                    results.errors.push(`${env} config environment mismatch`);
                }
            } else {
                results.configLoads[`${env}Config`] = 'FAILED - File not found';
                console.log(`❌ ${env} Config: File not found`);
                results.errors.push(`${env} config file missing`);
            }
        }
        
    } catch (error) {
        results.configLoads.yamlLoading = `FAILED - ${error.message}`;
        console.log('❌ YAML Loading: Failed -', error.message);
        results.errors.push('YAML loading failed');
    }
    
    console.log('');
    console.log('### 2.3 Configuration Validation Test');
    console.log('');
    
    // Test 3: Basic validation without full ConfigurationManager instantiation
    try {
        console.log('Testing configuration key completeness...');
        
        const requiredKeys = {
            development: ['environment', 'stage', 'frontend', 'backend'],
            staging: ['environment', 'stage', 'frontend', 'backend'],  
            production: ['environment', 'stage', 'frontend', 'backend']
        };
        
        const yaml = require('js-yaml');
        let allConfigsValid = true;
        
        for (const [env, keys] of Object.entries(requiredKeys)) {
            const configPath = `./config/environments/${env}.yaml`;
            if (fs.existsSync(configPath)) {
                const config = yaml.load(fs.readFileSync(configPath, 'utf8'));
                const missingKeys = keys.filter(key => !config[key]);
                
                if (missingKeys.length === 0) {
                    console.log(`✅ ${env} Config: All required keys present`);
                } else {
                    console.log(`❌ ${env} Config: Missing keys - ${missingKeys.join(', ')}`);
                    allConfigsValid = false;
                    results.errors.push(`${env} config missing required keys`);
                }
            }
        }
        
        results.configLoads.keyValidation = allConfigsValid ? 'SUCCESS - All configs have required keys' : 'FAILED - Some configs missing keys';
        
    } catch (error) {
        results.configLoads.keyValidation = `FAILED - ${error.message}`;
        console.log('❌ Key Validation: Failed -', error.message);
        results.errors.push('Key validation failed');
    }
    
    console.log('');
    console.log('📊 Configuration System Test Summary');
    console.log('════════════════════════════════════════');
    
    const totalTests = Object.keys(results.moduleLoads).length + Object.keys(results.configLoads).length;
    const passedTests = Object.values({...results.moduleLoads, ...results.configLoads}).filter(r => r.startsWith('SUCCESS')).length;
    
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);  
    console.log(`Failed: ${totalTests - passedTests}`);
    console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
    
    if (results.errors.length > 0) {
        console.log('');
        console.log('❌ Issues Found:');
        results.errors.forEach(error => console.log(`  - ${error}`));
    } else {
        console.log('');
        console.log('✅ Configuration system is working correctly!');
    }
    
    return results;
}

// Only run if called directly
if (require.main === module) {
    testConfigurationSystem().catch(console.error);
}

module.exports = { testConfigurationSystem };