import React from 'react';
import styled from 'styled-components';

const DebugContainer = styled.div`
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: #1f2937;
  color: #fff;
  padding: 16px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 12px;
  z-index: 9999;
  max-width: 400px;
`;

const DebugTitle = styled.h4`
  margin: 0 0 8px 0;
  color: #10B981;
`;

const DebugItem = styled.div`
  margin: 4px 0;
  word-break: break-all;
`;

const EnvDebug = () => {
  if (!import.meta.env.DEV) return null;
  
  return (
    <DebugContainer>
      <DebugTitle>🔧 Environment Debug</DebugTitle>
      <DebugItem>
        <strong>VITE_API_BASE_URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'undefined'}
      </DebugItem>
      <DebugItem>
        <strong>VITE_WEBSOCKET_URL:</strong> {import.meta.env.VITE_WEBSOCKET_URL || 'undefined'}
      </DebugItem>
      <DebugItem>
        <strong>NODE_ENV:</strong> {import.meta.env.NODE_ENV || 'undefined'}
      </DebugItem>
      <DebugItem>
        <strong>DEV:</strong> {String(import.meta.env.DEV)}
      </DebugItem>
      <DebugItem>
        <strong>MODE:</strong> {import.meta.env.MODE || 'undefined'}
      </DebugItem>
    </DebugContainer>
  );
};

export default EnvDebug;