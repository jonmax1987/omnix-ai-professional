import React, { useState } from 'react';
import styled from 'styled-components';
import { FileText, TrendingUp, Users, Package, Download, Calendar, Filter, DollarSign, Sun, BarChart3, Send } from 'lucide-react';
import ExecutiveSummaryReport from '../components/organisms/ExecutiveSummaryReport';
import RevenueTrendAnalysis from '../components/organisms/RevenueTrendAnalysis';
import CustomerBehaviorInsights from '../components/organisms/CustomerBehaviorInsights';
import InventoryTurnoverAnalysis from '../components/organisms/InventoryTurnoverAnalysis';
import ProfitabilityAnalysis from '../components/organisms/ProfitabilityAnalysis';
import SeasonalTrendAnalysis from '../components/organisms/SeasonalTrendAnalysis';
import ComparativePeriodAnalysis from '../components/organisms/ComparativePeriodAnalysis';
import ReportExportScheduler from '../components/organisms/ReportExportScheduler';

const PageContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 1400px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const PageTitle = styled.h1`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
`;

const PageDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  margin: 0;
`;

const ReportNav = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.small};
  overflow-x: auto;
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  background: ${({ isActive, theme }) => 
    isActive ? theme.colors.primary.main : 'transparent'};
  color: ${({ isActive, theme }) => 
    isActive ? 'white' : theme.colors.text.secondary};
  border: 2px solid ${({ isActive, theme }) => 
    isActive ? theme.colors.primary.main : theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: ${({ isActive, theme }) => 
      isActive ? theme.colors.primary.dark : theme.colors.neutral.hover};
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.small};
  }
`;

const ReportContent = styled.div`
  animation: fadeIn 0.3s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const QuickActions = styled.div`
  position: fixed;
  bottom: ${({ theme }) => theme.spacing.xl};
  right: ${({ theme }) => theme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  z-index: 100;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: 50%;
  box-shadow: ${({ theme }) => theme.shadows.large};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primary.dark};
    transform: scale(1.1);
  }
`;

const BIReports = () => {
  const [activeReport, setActiveReport] = useState('executive');

  const reports = [
    {
      id: 'executive',
      name: 'Executive Summary',
      icon: FileText,
      component: ExecutiveSummaryReport
    },
    {
      id: 'revenue',
      name: 'Revenue Trends',
      icon: TrendingUp,
      component: RevenueTrendAnalysis
    },
    {
      id: 'customer',
      name: 'Customer Behavior',
      icon: Users,
      component: CustomerBehaviorInsights
    },
    {
      id: 'inventory',
      name: 'Inventory Turnover',
      icon: Package,
      component: InventoryTurnoverAnalysis
    },
    {
      id: 'profitability',
      name: 'Profitability Analysis',
      icon: DollarSign,
      component: ProfitabilityAnalysis
    },
    {
      id: 'seasonal',
      name: 'Seasonal Trends',
      icon: Sun,
      component: SeasonalTrendAnalysis
    },
    {
      id: 'comparative',
      name: 'Comparative Analysis',
      icon: BarChart3,
      component: ComparativePeriodAnalysis
    },
    {
      id: 'export',
      name: 'Export & Schedule',
      icon: Send,
      component: ReportExportScheduler
    }
  ];

  const ActiveReportComponent = reports.find(r => r.id === activeReport)?.component;

  const handleExportAll = () => {
    console.log('Exporting all reports...');
  };

  const handleScheduleReports = () => {
    console.log('Opening schedule modal...');
  };

  const handleFilterReports = () => {
    console.log('Opening filter options...');
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Business Intelligence Reports</PageTitle>
        <PageDescription>
          Comprehensive analytics and insights to drive data-driven decisions
        </PageDescription>
      </PageHeader>

      <ReportNav>
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <NavButton
              key={report.id}
              isActive={activeReport === report.id}
              onClick={() => setActiveReport(report.id)}
            >
              <Icon size={18} />
              {report.name}
            </NavButton>
          );
        })}
      </ReportNav>

      <ReportContent>
        {ActiveReportComponent && <ActiveReportComponent />}
      </ReportContent>

      <QuickActions>
        <ActionButton onClick={handleFilterReports} title="Filter Reports">
          <Filter size={24} />
        </ActionButton>
        <ActionButton onClick={handleScheduleReports} title="Schedule Reports">
          <Calendar size={24} />
        </ActionButton>
        <ActionButton onClick={handleExportAll} title="Export All Reports">
          <Download size={24} />
        </ActionButton>
      </QuickActions>
    </PageContainer>
  );
};

export default BIReports;