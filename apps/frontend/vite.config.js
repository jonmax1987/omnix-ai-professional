import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import legacy from '@vitejs/plugin-legacy'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'
import viteImagemin from 'vite-plugin-imagemin'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => ({
  plugins: [
    react(),
    
    // Legacy browser support
    legacy({
      targets: ['defaults', 'not IE 11']
    }),
    
    // PWA configuration with enhanced service worker
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'sw.js',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,ttf,eot}'],
        maximumFileSizeToCacheInBytes: 10000000, // 10MB limit for better performance
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'omnix-images-v2',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.(?:woff|woff2|ttf|eot)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'omnix-fonts-v2',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              }
            }
          },
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'omnix-api-v2',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'OMNIX AI',
        short_name: 'OMNIX AI',
        description: 'Smart inventory management system',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    }),
    
    // Image optimization
    mode === 'production' && viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      pngquant: { quality: [0.65, 0.8] },
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'removeEmptyAttrs', active: false }
        ]
      }
    }),
    
    // Bundle analyzer in development
    mode === 'analyze' && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ].filter(Boolean),
  
  // Build optimization
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production'
      }
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React ecosystem
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/react-router')) {
            return 'vendor-router';
          }
          
          // UI and Animation
          if (id.includes('node_modules/styled-components')) {
            return 'vendor-styled';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-animation';
          }
          
          // State Management
          if (id.includes('node_modules/zustand') || id.includes('node_modules/immer')) {
            return 'vendor-state';
          }
          
          // Chart libraries
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3')) {
            return 'vendor-charts';
          }
          
          // Data fetching
          if (id.includes('node_modules/@tanstack/react-query') || id.includes('node_modules/axios')) {
            return 'vendor-data';
          }
          
          // Icons and assets
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/@lucide')) {
            return 'vendor-icons';
          }
          
          // Utilities
          if (id.includes('node_modules/html2canvas') || id.includes('node_modules/jspdf') || 
              id.includes('node_modules/date-fns') || id.includes('node_modules/lodash')) {
            return 'vendor-utils';
          }
          
          // Large vendors get their own chunks
          if (id.includes('node_modules/@aws-sdk')) {
            return 'vendor-aws';
          }
          if (id.includes('node_modules/aws-amplify')) {
            return 'vendor-amplify';
          }
          
          // Page-specific chunks for better caching
          if (id.includes('src/pages/Dashboard')) {
            return 'page-dashboard';
          }
          if (id.includes('src/pages/Analytics') || id.includes('src/pages/ABTesting')) {
            return 'page-analytics';
          }
          if (id.includes('src/pages/Products') || id.includes('src/pages/Orders')) {
            return 'page-management';
          }
          if (id.includes('src/pages/Customer')) {
            return 'page-customer';
          }
          
          // Debug components in development
          if (mode === 'development' && id.includes('src/components/debug')) {
            return 'debug';
          }
          
          // Group organism components
          if (id.includes('src/components/organisms')) {
            return 'components-organisms';
          }
          
          // All other node_modules go into vendor-misc
          if (id.includes('node_modules')) {
            return 'vendor-misc';
          }
        },
        // CDN-friendly asset naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js'
      }
    },
    chunkSizeWarningLimit: 1000,
    // CDN optimization
    assetsDir: 'assets'
  },
  
  // Development server optimization
  server: {
    hmr: {
      overlay: false
    },
    // Proxy API requests to avoid CORS issues in development
    proxy: {
      '/v1': {
        target: 'https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/v1/, ''),
        headers: {
          'Origin': 'http://localhost:5173',
          'User-Agent': 'OMNIX-AI-Frontend/1.0'
        },
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('🚨 Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('📤 Proxy request:', req.method, req.url, '->', proxyReq.path);
            // Ensure proper headers for CORS
            proxyReq.setHeader('Origin', 'http://localhost:5173');
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('📡 Proxy response:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  },
  
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.jsx',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.config.js',
        '**/*.config.ts',
        'src/main.jsx',
        'dist/',
        'coverage/',
        '**/*.test.{js,jsx,ts,tsx}',
        '**/__tests__/**'
      ]
    }
  }
}))
