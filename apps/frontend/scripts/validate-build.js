#!/usr/bin/env node

/**
 * OMNIX AI - Build Validation Script
 * Validates build output for deployment readiness
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  header: (msg) => console.log(`${colors.magenta}${msg}${colors.reset}`)
};

class BuildValidator {
  constructor() {
    this.distPath = path.join(process.cwd(), 'dist');
    this.errors = [];
    this.warnings = [];
  }

  // Check if dist directory exists
  checkDistExists() {
    log.info('Checking build output directory...');
    
    if (!fs.existsSync(this.distPath)) {
      this.errors.push('dist directory does not exist');
      return false;
    }
    
    log.success('Build output directory found');
    return true;
  }

  // Validate required files
  validateRequiredFiles() {
    log.info('Validating required files...');
    
    const requiredFiles = [
      'index.html',
      'assets',
      'build-manifest.json'
    ];

    const missingFiles = [];
    
    for (const file of requiredFiles) {
      const filePath = path.join(this.distPath, file);
      if (!fs.existsSync(filePath)) {
        missingFiles.push(file);
      }
    }

    if (missingFiles.length > 0) {
      this.errors.push(`Missing required files: ${missingFiles.join(', ')}`);
      return false;
    }

    log.success('All required files present');
    return true;
  }

  // Check HTML file validity
  validateHtmlFiles() {
    log.info('Validating HTML files...');
    
    const htmlFiles = this.findFiles('.html');
    let validHtml = true;

    for (const htmlFile of htmlFiles) {
      const content = fs.readFileSync(htmlFile, 'utf-8');
      
      // Basic HTML structure checks
      if (!content.includes('<!DOCTYPE html>')) {
        this.warnings.push(`${htmlFile}: Missing DOCTYPE declaration`);
      }
      
      if (!content.includes('<title>')) {
        this.warnings.push(`${htmlFile}: Missing title tag`);
      }
      
      if (!content.includes('<meta name="viewport"')) {
        this.warnings.push(`${htmlFile}: Missing viewport meta tag`);
      }
      
      // Check for development artifacts
      if (content.includes('localhost') || content.includes('127.0.0.1')) {
        this.errors.push(`${htmlFile}: Contains localhost references`);
        validHtml = false;
      }
    }

    if (validHtml) {
      log.success('HTML files validation passed');
    }
    
    return validHtml;
  }

  // Validate asset files
  validateAssets() {
    log.info('Validating asset files...');
    
    const assetsPath = path.join(this.distPath, 'assets');
    if (!fs.existsSync(assetsPath)) {
      this.errors.push('Assets directory not found');
      return false;
    }

    // Check for JavaScript files
    const jsFiles = this.findFiles('.js', assetsPath);
    if (jsFiles.length === 0) {
      this.errors.push('No JavaScript files found in assets');
      return false;
    }

    // Check for CSS files
    const cssFiles = this.findFiles('.css', assetsPath);
    if (cssFiles.length === 0) {
      this.warnings.push('No CSS files found in assets');
    }

    // Check file sizes
    const largeSizeThreshold = 2 * 1024 * 1024; // 2MB
    const allAssetFiles = [...jsFiles, ...cssFiles];
    
    for (const file of allAssetFiles) {
      const stats = fs.statSync(file);
      if (stats.size > largeSizeThreshold) {
        this.warnings.push(`Large asset file: ${path.basename(file)} (${(stats.size / 1024 / 1024).toFixed(2)}MB)`);
      }
    }

    log.success('Asset validation completed');
    return true;
  }

  // Validate build manifest
  validateBuildManifest() {
    log.info('Validating build manifest...');
    
    const manifestPath = path.join(this.distPath, 'build-manifest.json');
    
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      
      const requiredFields = ['buildTime', 'environment', 'version'];
      const missingFields = requiredFields.filter(field => !manifest[field]);
      
      if (missingFields.length > 0) {
        this.warnings.push(`Build manifest missing fields: ${missingFields.join(', ')}`);
      }
      
      // Validate environment
      const validEnvironments = ['development', 'staging', 'production', 'test'];
      if (manifest.environment && !validEnvironments.includes(manifest.environment)) {
        this.warnings.push(`Invalid environment in manifest: ${manifest.environment}`);
      }
      
      log.success('Build manifest validation passed');
      return true;
    } catch (error) {
      this.errors.push(`Build manifest validation failed: ${error.message}`);
      return false;
    }
  }

  // Check for security issues
  validateSecurity() {
    log.info('Running security validation...');
    
    const allFiles = [
      ...this.findFiles('.js'),
      ...this.findFiles('.css'),
      ...this.findFiles('.html')
    ];

    const securityPatterns = [
      { pattern: /console\.log/g, message: 'Contains console.log statements', severity: 'warning' },
      { pattern: /debugger/g, message: 'Contains debugger statements', severity: 'error' },
      { pattern: /localhost/g, message: 'Contains localhost references', severity: 'error' },
      { pattern: /password/gi, message: 'Contains password references', severity: 'warning' },
      { pattern: /api[_-]?key/gi, message: 'Contains API key references', severity: 'warning' }
    ];

    let securityIssues = 0;

    for (const file of allFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      
      for (const { pattern, message, severity } of securityPatterns) {
        const matches = content.match(pattern);
        if (matches) {
          const issue = `${path.basename(file)}: ${message} (${matches.length} occurrences)`;
          
          if (severity === 'error') {
            this.errors.push(issue);
          } else {
            this.warnings.push(issue);
          }
          
          securityIssues++;
        }
      }
    }

    if (securityIssues === 0) {
      log.success('Security validation passed');
    } else {
      log.warning(`Found ${securityIssues} security-related issues`);
    }
    
    return securityIssues === 0 || this.errors.length === 0;
  }

  // Calculate build statistics
  calculateBuildStats() {
    log.info('Calculating build statistics...');
    
    const stats = {
      totalFiles: 0,
      totalSize: 0,
      jsFiles: 0,
      jsSize: 0,
      cssFiles: 0,
      cssSize: 0,
      htmlFiles: 0,
      htmlSize: 0,
      otherFiles: 0,
      otherSize: 0
    };

    const allFiles = this.findAllFiles();
    
    for (const file of allFiles) {
      const stat = fs.statSync(file);
      const ext = path.extname(file).toLowerCase();
      
      stats.totalFiles++;
      stats.totalSize += stat.size;
      
      switch (ext) {
        case '.js':
          stats.jsFiles++;
          stats.jsSize += stat.size;
          break;
        case '.css':
          stats.cssFiles++;
          stats.cssSize += stat.size;
          break;
        case '.html':
          stats.htmlFiles++;
          stats.htmlSize += stat.size;
          break;
        default:
          stats.otherFiles++;
          stats.otherSize += stat.size;
      }
    }

    return stats;
  }

  // Helper method to find files by extension
  findFiles(extension, directory = this.distPath) {
    const files = [];
    
    if (!fs.existsSync(directory)) return files;
    
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      
      if (entry.isDirectory()) {
        files.push(...this.findFiles(extension, fullPath));
      } else if (entry.name.endsWith(extension)) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  // Helper method to find all files
  findAllFiles(directory = this.distPath) {
    const files = [];
    
    if (!fs.existsSync(directory)) return files;
    
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      
      if (entry.isDirectory()) {
        files.push(...this.findAllFiles(fullPath));
      } else {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  // Format file size
  formatSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  // Run all validations
  validate() {
    log.header('\n🔍 OMNIX AI - Build Validation');
    log.header('═'.repeat(50));
    
    const validations = [
      () => this.checkDistExists(),
      () => this.validateRequiredFiles(),
      () => this.validateHtmlFiles(),
      () => this.validateAssets(),
      () => this.validateBuildManifest(),
      () => this.validateSecurity()
    ];

    let allPassed = true;
    
    for (const validation of validations) {
      if (!validation()) {
        allPassed = false;
      }
    }

    // Show build statistics
    const stats = this.calculateBuildStats();
    
    log.header('\n📊 Build Statistics');
    log.header('═'.repeat(50));
    log.info(`Total files: ${stats.totalFiles}`);
    log.info(`Total size: ${this.formatSize(stats.totalSize)}`);
    log.info(`JavaScript: ${stats.jsFiles} files (${this.formatSize(stats.jsSize)})`);
    log.info(`CSS: ${stats.cssFiles} files (${this.formatSize(stats.cssSize)})`);
    log.info(`HTML: ${stats.htmlFiles} files (${this.formatSize(stats.htmlSize)})`);
    log.info(`Other: ${stats.otherFiles} files (${this.formatSize(stats.otherSize)})`);

    // Show summary
    log.header('\n📋 Validation Summary');
    log.header('═'.repeat(50));
    
    if (this.errors.length > 0) {
      log.error(`Found ${this.errors.length} error(s):`);
      this.errors.forEach(error => log.error(`  • ${error}`));
    }
    
    if (this.warnings.length > 0) {
      log.warning(`Found ${this.warnings.length} warning(s):`);
      this.warnings.forEach(warning => log.warning(`  • ${warning}`));
    }
    
    if (allPassed && this.errors.length === 0) {
      log.success('\n🎉 Build validation passed! Ready for deployment.');
      return true;
    } else {
      log.error('\n❌ Build validation failed! Please fix the issues above.');
      return false;
    }
  }
}

// Run validation
const validator = new BuildValidator();
const success = validator.validate();

process.exit(success ? 0 : 1);