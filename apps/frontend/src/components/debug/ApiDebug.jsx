import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../../services/api.js';

// Debug component to verify API configuration and data flow
const ApiDebug = () => {
  const [debugInfo, setDebugInfo] = useState({
    environment: {},
    apiConfig: {},
    apiTest: null,
    loading: false
  });

  useEffect(() => {
    // Log environment variables (browser-safe)
    const envInfo = {
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
      VITE_API_KEY: import.meta.env.VITE_API_KEY || 'not_set',
      NODE_ENV: import.meta.env.NODE_ENV,
      DEV: import.meta.env.DEV,
      MODE: import.meta.env.MODE,
      PROD: import.meta.env.PROD
    };

    // console.group('🔍 API Debug Information');
    // console.log('Environment Variables:', envInfo);
    // console.groupEnd();

    setDebugInfo(prev => ({
      ...prev,
      environment: envInfo
    }));

    // Test API call
    const testAPI = async () => {
      setDebugInfo(prev => ({ ...prev, loading: true }));
      
      try {
        // console.log('🧪 Testing API call to dashboard/summary...');
        const result = await analyticsAPI.getDashboardMetrics();
        
        // console.group('✅ API Test Result');
        // console.log('Success! Data received:', result);
        // console.log('Total Items:', result?.inventory?.totalItems || result?.totalItems);
        // console.log('Inventory Value:', result?.inventory?.totalValue || result?.totalInventoryValue);
        // console.groupEnd();
        
        setDebugInfo(prev => ({
          ...prev,
          apiTest: {
            success: true,
            data: result,
            timestamp: new Date().toISOString()
          },
          loading: false
        }));
      } catch (error) {
        // console.group('❌ API Test Failed');
        // console.error('Error:', error);
        // console.error('Message:', error.message);
        // console.error('Status:', error.status);
        // console.groupEnd();
        
        setDebugInfo(prev => ({
          ...prev,
          apiTest: {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
          },
          loading: false
        }));
      }
    };

    testAPI();
  }, []);

  // Only show in development
  if (import.meta.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      width: '400px',
      backgroundColor: '#1a1a1a',
      color: '#fff',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 10000,
      border: '1px solid #333',
      maxHeight: '80vh',
      overflow: 'auto'
    }}>
      <h3 style={{ margin: '0 0 12px 0', color: '#4ade80' }}>🔧 API Debug</h3>
      
      <div style={{ marginBottom: '12px' }}>
        <strong>Environment:</strong>
        <pre style={{ fontSize: '10px', background: '#2a2a2a', padding: '8px', margin: '4px 0', borderRadius: '4px' }}>
          {JSON.stringify(debugInfo.environment, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <strong>API Test:</strong>
        {debugInfo.loading ? (
          <div style={{ color: '#fbbf24' }}>🔄 Testing API...</div>
        ) : debugInfo.apiTest ? (
          <div style={{ color: debugInfo.apiTest.success ? '#4ade80' : '#ef4444' }}>
            {debugInfo.apiTest.success ? '✅ SUCCESS' : '❌ FAILED'}
            <pre style={{ fontSize: '10px', background: '#2a2a2a', padding: '8px', margin: '4px 0', borderRadius: '4px' }}>
              {JSON.stringify(debugInfo.apiTest, null, 2)}
            </pre>
          </div>
        ) : (
          <div style={{ color: '#6b7280' }}>Waiting...</div>
        )}
      </div>

      <div style={{ fontSize: '10px', color: '#6b7280' }}>
        Check browser console for detailed logs
      </div>
    </div>
  );
};

export default ApiDebug;