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
    
    // PWA configuration with auto-generated service worker
    VitePWA({
      registerType: 'autoUpdate',
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
            urlPattern: /^https:\/\/.*\.(?:execute-api\..*\.amazonaws\.com|api\.)/,
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
        // Let Vite handle automatic chunking - it knows dependency relationships better
        manualChunks: undefined,
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
    chunkSizeWarningLimit: 1500, // Increased due to consolidating React ecosystem
    // CDN optimization
    assetsDir: 'assets',
    // Ensure proper module resolution to prevent React.AsyncMode issues
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    }
  },
  
  // Resolve configuration to prevent React version conflicts
  resolve: {
    alias: {
      // Ensure consistent React version across all dependencies
      'react': 'react',
      'react-dom': 'react-dom',
      'react-is': 'react-is', // Force single react-is version
    },
    dedupe: ['react', 'react-dom', 'react-is'], // Dedupe React ecosystem
  },
  
  // Simplified optimizeDeps - let Vite handle dependency optimization automatically
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-is'
    ],
    force: false // Let Vite decide when to rebuild optimized deps
  },
  
  // Development server optimization
  server: {
    hmr: {
      overlay: false
    },
    // Proxy API requests to avoid CORS issues in development  
    proxy: {
      '/system': {
        target: 'https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod',
        changeOrigin: true,
        secure: true,
        headers: {
          'Origin': 'http://localhost:5173',
          'User-Agent': 'OMNIX-AI-Frontend/1.0'
        }
      },
      '/dashboard': {
        target: 'https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod',
        changeOrigin: true,
        secure: true,
        headers: {
          'Origin': 'http://localhost:5173',
          'User-Agent': 'OMNIX-AI-Frontend/1.0'
        }
      },
      '/products': {
        target: 'https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod',
        changeOrigin: true,
        secure: true,
        headers: {
          'Origin': 'http://localhost:5173',
          'User-Agent': 'OMNIX-AI-Frontend/1.0'
        }
      },
      '/auth': {
        target: 'https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod',
        changeOrigin: true,
        secure: true,
        headers: {
          'Origin': 'http://localhost:5173',
          'User-Agent': 'OMNIX-AI-Frontend/1.0'
        }
      },
      '/orders': {
        target: 'https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod',
        changeOrigin: true,
        secure: true,
        headers: {
          'Origin': 'http://localhost:5173',
          'User-Agent': 'OMNIX-AI-Frontend/1.0'
        }
      },
      '/alerts': {
        target: 'https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod',
        changeOrigin: true,
        secure: true,
        headers: {
          'Origin': 'http://localhost:5173',
          'User-Agent': 'OMNIX-AI-Frontend/1.0'
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
