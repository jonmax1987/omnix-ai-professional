// React Query Provider Component
// Wraps the app with React Query functionality and development tools
import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '../../services/queryClientService';

/**
 * QueryProvider Component
 * Provides React Query context and development tools to the entire app
 */
const QueryProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Development tools - only show in development */}
      {import.meta.env.DEV && (
        <ReactQueryDevtools 
          initialIsOpen={false}
          position="bottom-right"
          toggleButtonProps={{
            style: {
              marginLeft: '5px',
              transform: 'scale(0.8)',
              transformOrigin: 'bottom right',
              zIndex: 99999
            }
          }}
        />
      )}
    </QueryClientProvider>
  );
};

export default QueryProvider;