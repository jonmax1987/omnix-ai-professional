/**
 * System Health Page - MGR-031
 * Comprehensive system health monitoring dashboard
 * Provides detailed view of all system components and health metrics
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Activity, Settings, Download, RefreshCw } from 'lucide-react';
import SystemHealthMonitor from '../components/organisms/SystemHealthMonitor.jsx';
import Card from '../components/atoms/Card.jsx';
import Button from '../components/atoms/Button.jsx';

/**
 * Styled Components
 */
const PageContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors?.gray?.[50] || '#f9fafb'};
  padding: 2rem;
  
  @media (max-width: ${props => props.theme.breakpoints?.md || '768px'}) {
    padding: 1rem;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: between;
  gap: 1rem;
  margin-bottom: 1rem;
  
  @media (max-width: ${props => props.theme.breakpoints?.md || '768px'}) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const TitleSection = styled.div`
  flex: 1;
`;

const PageTitle = styled.h1`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 0.5rem 0;
  font-size: 1.875rem;
  font-weight: 700;
  color: ${props => props.theme.colors?.gray?.[900] || '#111827'};

  svg {
    width: 28px;
    height: 28px;
    color: ${props => props.theme.colors?.blue?.[600] || '#2563eb'};
  }
`;

const PageDescription = styled.p`
  margin: 0;
  color: ${props => props.theme.colors?.gray?.[600] || '#4b5563'};
  font-size: 1.1rem;
  line-height: 1.6;
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: ${props => props.theme.breakpoints?.md || '768px'}) {
    width: 100%;
    justify-content: stretch;
    
    button {
      flex: 1;
    }
  }
`;

const ControlsCard = styled(Card)`
  margin-bottom: 2rem;
  padding: 1.5rem;
`;

const ControlsContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  
  @media (max-width: ${props => props.theme.breakpoints?.md || '768px'}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: ${props => props.theme.breakpoints?.sm || '640px'}) {
    flex-direction: column;
    align-items: stretch;
    
    label {
      text-align: center;
    }
  }
`;

const Label = styled.label`
  font-weight: 500;
  color: ${props => props.theme.colors?.gray?.[700] || '#374151'};
`;

const Select = styled.select`
  padding: 0.5rem 0.75rem;
  border: 1px solid ${props => props.theme.colors?.gray?.[300] || '#d1d5db'};
  border-radius: 6px;
  background: white;
  color: ${props => props.theme.colors?.gray?.[900] || '#111827'};
  font-size: 0.875rem;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors?.blue?.[500] || '#3b82f6'};
    box-shadow: 0 0 0 3px ${props => props.theme.colors?.blue?.[100] || '#dbeafe'};
  }
`;

const Checkbox = styled.input`
  margin-right: 0.5rem;
`;

const ExportOptions = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: ${props => props.theme.colors?.blue?.[50] || '#eff6ff'};
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors?.blue?.[200] || '#bfdbfe'};
`;

const ExportTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: ${props => props.theme.colors?.blue?.[900] || '#1e3a8a'};
  font-size: 1.1rem;
  font-weight: 600;
`;

const ExportDescription = styled.p`
  margin: 0 0 1rem 0;
  color: ${props => props.theme.colors?.blue?.[700] || '#1d4ed8'};
  font-size: 0.875rem;
  line-height: 1.5;
`;

const ExportActions = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: ${props => props.theme.breakpoints?.sm || '640px'}) {
    flex-direction: column;
  }
`;

/**
 * System Health Page Component
 */
const SystemHealth = () => {
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [showAlerts, setShowAlerts] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  /**
   * Handle settings change
   */
  const handleRefreshIntervalChange = (event) => {
    setRefreshInterval(Number(event.target.value));
  };

  const handleShowAlertsChange = (event) => {
    setShowAlerts(event.target.checked);
  };

  const handleCompactViewChange = (event) => {
    setCompactView(event.target.checked);
  };

  /**
   * Export health report
   */
  const exportHealthReport = async (format = 'json') => {
    setIsExporting(true);
    
    try {
      // Collect current health data
      const healthData = {
        timestamp: new Date().toISOString(),
        systemStatus: 'healthy', // This would come from the monitor component
        components: {
          webSocket: { status: 'healthy', metrics: {} },
          api: { status: 'healthy', metrics: {} },
          performance: { status: 'healthy', metrics: {} }
        },
        metadata: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          refreshInterval,
          showAlerts,
          compactView
        }
      };

      let exportContent;
      let fileName;
      let mimeType;

      if (format === 'json') {
        exportContent = JSON.stringify(healthData, null, 2);
        fileName = `system-health-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      } else if (format === 'csv') {
        // Simple CSV format for basic metrics
        const csvHeaders = ['Component', 'Status', 'Timestamp'];
        const csvData = Object.entries(healthData.components).map(([component, data]) => 
          `${component},${data.status},${healthData.timestamp}`
        );
        exportContent = [csvHeaders.join(','), ...csvData].join('\n');
        fileName = `system-health-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      } else {
        throw new Error('Unsupported export format');
      }

      // Create and trigger download
      const blob = new Blob([exportContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log(`Health report exported as ${fileName}`);
    } catch (error) {
      console.error('Failed to export health report:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader>
        <HeaderContent>
          <TitleSection>
            <PageTitle>
              <Activity />
              System Health Monitor
            </PageTitle>
            <PageDescription>
              Real-time monitoring of system components, performance metrics, and health status.
              Monitor WebSocket connections, API services, and application performance.
            </PageDescription>
          </TitleSection>
          
          <ActionButtons>
            <Button
              variant="secondary"
              icon={<Settings />}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Settings
            </Button>
            <Button
              variant="primary"
              icon={<RefreshCw />}
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </ActionButtons>
        </HeaderContent>
      </PageHeader>

      <ControlsCard>
        <ControlsContent>
          <ControlGroup>
            <Label>Refresh Interval:</Label>
            <Select value={refreshInterval} onChange={handleRefreshIntervalChange}>
              <option value={1000}>1 second</option>
              <option value={2000}>2 seconds</option>
              <option value={5000}>5 seconds</option>
              <option value={10000}>10 seconds</option>
              <option value={30000}>30 seconds</option>
              <option value={60000}>1 minute</option>
            </Select>
          </ControlGroup>

          <ControlGroup>
            <Label>
              <Checkbox
                type="checkbox"
                checked={showAlerts}
                onChange={handleShowAlertsChange}
              />
              Show Alerts
            </Label>
            
            <Label>
              <Checkbox
                type="checkbox"
                checked={compactView}
                onChange={handleCompactViewChange}
              />
              Compact View
            </Label>
          </ControlGroup>
        </ControlsContent>

        <ExportOptions>
          <ExportTitle>Export Health Report</ExportTitle>
          <ExportDescription>
            Export current system health data and metrics for analysis, reporting, or troubleshooting.
            Reports include component status, performance metrics, and configuration details.
          </ExportDescription>
          <ExportActions>
            <Button
              variant="outline"
              size="sm"
              icon={<Download />}
              onClick={() => exportHealthReport('json')}
              disabled={isExporting}
            >
              Export JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Download />}
              onClick={() => exportHealthReport('csv')}
              disabled={isExporting}
            >
              Export CSV
            </Button>
          </ExportActions>
        </ExportOptions>
      </ControlsCard>

      <SystemHealthMonitor
        refreshInterval={refreshInterval}
        showAlerts={showAlerts}
        compactView={compactView}
      />
    </PageContainer>
  );
};

export default SystemHealth;