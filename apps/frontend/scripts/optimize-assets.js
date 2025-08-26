#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');
const assetsDir = path.join(projectRoot, 'src', 'assets');

// Image optimization settings
const optimizationSettings = {
  jpeg: { quality: 80, progressive: true },
  png: { compressionLevel: 9, adaptiveFiltering: true },
  webp: { quality: 85, effort: 6 },
  avif: { quality: 75, effort: 9 }
};

// File size limits (in bytes)
const sizeWarnings = {
  small: 50 * 1024,    // 50KB
  medium: 200 * 1024,  // 200KB
  large: 1024 * 1024   // 1MB
};

async function findImageFiles(dir) {
  const images = [];
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        const subImages = await findImageFiles(fullPath);
        images.push(...subImages);
      } else if (entry.isFile() && /\.(jpe?g|png|gif|svg|webp|avif)$/i.test(entry.name)) {
        images.push(fullPath);
      }
    }
  } catch (error) {
    // Directory might not exist
    console.warn(`Warning: Could not read directory ${dir}`);
  }
  
  return images;
}

async function optimizeImage(imagePath) {
  const ext = path.extname(imagePath).toLowerCase();
  const basename = path.basename(imagePath, ext);
  const dirname = path.dirname(imagePath);
  
  const stats = await fs.stat(imagePath);
  const originalSize = stats.size;
  
  console.log(`Optimizing: ${path.relative(projectRoot, imagePath)} (${formatBytes(originalSize)})`);
  
  try {
    let sharpInstance = sharp(imagePath);
    const metadata = await sharpInstance.metadata();
    
    // Skip if already optimized or very small
    if (originalSize < 1024) {
      console.log(`  Skipping (too small): ${formatBytes(originalSize)}`);
      return;
    }
    
    // Create optimized versions
    const results = [];
    
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        // Optimize original JPEG
        const jpegBuffer = await sharpInstance
          .jpeg(optimizationSettings.jpeg)
          .toBuffer();
        
        if (jpegBuffer.length < originalSize) {
          await fs.writeFile(imagePath, jpegBuffer);
          results.push({ format: 'JPEG', size: jpegBuffer.length, savings: originalSize - jpegBuffer.length });
        }
        
        // Create WebP version
        const webpPath = path.join(dirname, `${basename}.webp`);
        const webpBuffer = await sharp(imagePath)
          .webp(optimizationSettings.webp)
          .toBuffer();
        await fs.writeFile(webpPath, webpBuffer);
        results.push({ format: 'WebP', size: webpBuffer.length, path: webpPath });
        
        break;
        
      case '.png':
        // Optimize original PNG
        const pngBuffer = await sharpInstance
          .png(optimizationSettings.png)
          .toBuffer();
          
        if (pngBuffer.length < originalSize) {
          await fs.writeFile(imagePath, pngBuffer);
          results.push({ format: 'PNG', size: pngBuffer.length, savings: originalSize - pngBuffer.length });
        }
        
        // Create WebP version
        const pngWebpPath = path.join(dirname, `${basename}.webp`);
        const pngWebpBuffer = await sharp(imagePath)
          .webp(optimizationSettings.webp)
          .toBuffer();
        await fs.writeFile(pngWebpPath, pngWebpBuffer);
        results.push({ format: 'WebP', size: pngWebpBuffer.length, path: pngWebpPath });
        
        break;
        
      case '.svg':
        // SVG optimization would require additional tools like SVGO
        console.log('  SVG optimization requires additional processing');
        break;
        
      default:
        console.log(`  Unsupported format: ${ext}`);
    }
    
    // Report results
    results.forEach(result => {
      if (result.savings) {
        const savingsPercent = ((result.savings / originalSize) * 100).toFixed(1);
        console.log(`  ${result.format}: ${formatBytes(result.size)} (saved ${formatBytes(result.savings)} / ${savingsPercent}%)`);
      } else {
        console.log(`  ${result.format}: ${formatBytes(result.size)} (${path.basename(result.path)})`);
      }
    });
    
    // Size warnings
    const finalSize = results.find(r => r.savings)?.size || originalSize;
    if (finalSize > sizeWarnings.large) {
      console.warn(`  WARNING: Large image size (${formatBytes(finalSize)})`);
    } else if (finalSize > sizeWarnings.medium) {
      console.warn(`  NOTICE: Medium image size (${formatBytes(finalSize)})`);
    }
    
  } catch (error) {
    console.error(`  Error optimizing ${imagePath}:`, error.message);
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

async function generateResponsiveImages() {
  console.log('\nGenerating responsive image variants...');
  
  const breakpoints = [480, 768, 1024, 1440, 1920];
  const imageExtensions = ['.jpg', '.jpeg', '.png'];
  
  const images = await findImageFiles(assetsDir);
  const largeImages = [];
  
  for (const imagePath of images) {
    const ext = path.extname(imagePath).toLowerCase();
    if (!imageExtensions.includes(ext)) continue;
    
    try {
      const metadata = await sharp(imagePath).metadata();
      if (metadata.width && metadata.width > 800) {
        largeImages.push({ path: imagePath, width: metadata.width, height: metadata.height });
      }
    } catch (error) {
      console.warn(`Could not read metadata for ${imagePath}`);
    }
  }
  
  for (const { path: imagePath, width: originalWidth } of largeImages) {
    const ext = path.extname(imagePath).toLowerCase();
    const basename = path.basename(imagePath, ext);
    const dirname = path.dirname(imagePath);
    
    console.log(`Generating responsive variants for: ${path.relative(projectRoot, imagePath)}`);
    
    for (const breakpoint of breakpoints) {
      if (breakpoint >= originalWidth) continue;
      
      const outputPath = path.join(dirname, `${basename}-${breakpoint}w${ext}`);
      
      try {
        await sharp(imagePath)
          .resize(breakpoint, null, { 
            withoutEnlargement: true,
            fit: 'inside'
          })
          .jpeg(optimizationSettings.jpeg)
          .toFile(outputPath);
          
        console.log(`  Generated: ${basename}-${breakpoint}w${ext}`);
      } catch (error) {
        console.error(`  Error generating ${breakpoint}w variant:`, error.message);
      }
    }
  }
}

async function auditImageUsage() {
  console.log('\nAuditing image usage...');
  
  const sourceFiles = await findSourceFiles(path.join(projectRoot, 'src'));
  const images = await findImageFiles(assetsDir);
  const usedImages = new Set();
  const unusedImages = [];
  
  // Check which images are referenced in source code
  for (const sourceFile of sourceFiles) {
    try {
      const content = await fs.readFile(sourceFile, 'utf8');
      
      for (const imagePath of images) {
        const imageName = path.basename(imagePath);
        const imageNameNoExt = path.basename(imagePath, path.extname(imagePath));
        
        if (content.includes(imageName) || content.includes(imageNameNoExt)) {
          usedImages.add(imagePath);
        }
      }
    } catch (error) {
      console.warn(`Could not read source file: ${sourceFile}`);
    }
  }
  
  // Find unused images
  for (const imagePath of images) {
    if (!usedImages.has(imagePath)) {
      const stats = await fs.stat(imagePath);
      unusedImages.push({ path: imagePath, size: stats.size });
    }
  }
  
  console.log(`\nImage Usage Report:`);
  console.log(`Total images: ${images.length}`);
  console.log(`Used images: ${usedImages.size}`);
  console.log(`Unused images: ${unusedImages.length}`);
  
  if (unusedImages.length > 0) {
    console.log('\nUnused images:');
    let totalUnusedSize = 0;
    
    unusedImages.forEach(({ path: imagePath, size }) => {
      console.log(`  ${path.relative(projectRoot, imagePath)} (${formatBytes(size)})`);
      totalUnusedSize += size;
    });
    
    console.log(`\nTotal unused image size: ${formatBytes(totalUnusedSize)}`);
  }
}

async function findSourceFiles(dir) {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      const subFiles = await findSourceFiles(fullPath);
      files.push(...subFiles);
    } else if (entry.isFile() && /\.(js|jsx|ts|tsx|css|scss|html)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

async function main() {
  console.log('OMNIX AI Asset Optimization');
  console.log('============================\n');
  
  // Find all image files
  const publicImages = await findImageFiles(publicDir);
  const assetImages = await findImageFiles(assetsDir);
  const allImages = [...publicImages, ...assetImages];
  
  console.log(`Found ${allImages.length} image files\n`);
  
  // Optimize each image
  for (const imagePath of allImages) {
    await optimizeImage(imagePath);
  }
  
  // Generate responsive variants
  await generateResponsiveImages();
  
  // Audit image usage
  await auditImageUsage();
  
  console.log('\n✅ Asset optimization complete!');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}