import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { Download, Calendar, TrendingUp, Users, Package, DollarSign, BarChart3, FileText, Send, Clock } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const ReportContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface.primary};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const ReportHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding-bottom: ${({ theme }) => theme.spacing.lg};
  border-bottom: 2px solid ${({ theme }) => theme.colors.neutral.border};
`;

const HeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ReportTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin: 0;
`;

const ReportSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ isSchedule, theme }) => 
    isSchedule ? theme.colors.secondary.main : theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ isSchedule, theme }) => 
      isSchedule ? theme.colors.secondary.dark : theme.colors.primary.dark};
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const DateRangeSelector = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.main};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const DateInput = styled.input`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface.primary};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.main}20;
  }
`;

const QuickSelect = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-left: auto;
`;

const QuickSelectButton = styled.button`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ isActive, theme }) => 
    isActive ? theme.colors.primary.main : 'transparent'};
  color: ${({ isActive, theme }) => 
    isActive ? 'white' : theme.colors.text.secondary};
  border: 1px solid ${({ isActive, theme }) => 
    isActive ? theme.colors.primary.main : theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ isActive, theme }) => 
      isActive ? theme.colors.primary.dark : theme.colors.neutral.hover};
  }
`;

const SummarySection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const SectionTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const KeyMetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const MetricCard = styled.div`
  background: ${({ trend, theme }) => {
    if (!trend) return theme.colors.background.main;
    return trend > 0 ? `${theme.colors.success.light}10` : `${theme.colors.error.light}10`;
  }};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const MetricLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const MetricValue = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

const MetricTrend = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ trend, theme }) => 
    trend > 0 ? theme.colors.success.main : theme.colors.error.main};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const InsightsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const InsightCard = styled.div`
  background: ${({ priority, theme }) => {
    if (priority === 'high') return `${theme.colors.error.light}08`;
    if (priority === 'medium') return `${theme.colors.warning.light}08`;
    return theme.colors.background.main;
  }};
  border: 1px solid ${({ priority, theme }) => {
    if (priority === 'high') return theme.colors.error.light;
    if (priority === 'medium') return theme.colors.warning.light;
    return theme.colors.neutral.border;
  }};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const InsightTitle = styled.h4`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
`;

const InsightContent = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  line-height: 1.6;
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`;

const InsightAction = styled.div`
  color: ${({ theme }) => theme.colors.primary.main};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  &:hover {
    text-decoration: underline;
  }
`;

const ChartSection = styled.div`
  background: ${({ theme }) => theme.colors.background.main};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ScheduleModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${({ theme }) => theme.colors.surface.primary};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.large};
  z-index: 1000;
  width: 90%;
  max-width: 500px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const ScheduleOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const ScheduleOption = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
`;

const EmailInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.main};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-top: ${({ theme }) => theme.spacing.md};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.main}20;
  }
`;

const ExecutiveSummaryReport = ({ dateRange, metrics, insights }) => {
  const [selectedDateRange, setSelectedDateRange] = useState('week');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState('weekly');
  const [scheduleEmails, setScheduleEmails] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const mockMetrics = useMemo(() => ({
    revenue: {
      value: '$847,392',
      trend: 12.5,
      label: 'Total Revenue',
      icon: DollarSign
    },
    customers: {
      value: '4,326',
      trend: 8.3,
      label: 'Active Customers',
      icon: Users
    },
    inventory: {
      value: '94.7%',
      trend: -2.1,
      label: 'Inventory Health',
      icon: Package
    },
    performance: {
      value: '91.2%',
      trend: 5.4,
      label: 'Performance Score',
      icon: BarChart3
    }
  }), []);

  const mockInsights = useMemo(() => ([
    {
      title: 'Revenue Growth Opportunity',
      content: 'Premium product sales increased by 23% this week. Consider expanding premium inventory to capture growing demand.',
      priority: 'high',
      action: 'View Revenue Analysis'
    },
    {
      title: 'Customer Segment Shift',
      content: 'Budget-conscious segment growing 15% faster than expected. Adjust promotional strategies to target this segment.',
      priority: 'medium',
      action: 'Explore Segments'
    },
    {
      title: 'Inventory Optimization',
      content: 'AI predicts 3 products will stockout within 7 days. Automated reorder suggestions available for review.',
      priority: 'high',
      action: 'Review Orders'
    },
    {
      title: 'Seasonal Trend Alert',
      content: 'Historical data suggests 40% increase in beverage sales next week. Prepare inventory and promotions accordingly.',
      priority: 'medium',
      action: 'View Forecast'
    }
  ]), []);

  const handleExportPDF = async () => {
    setIsGenerating(true);
    try {
      const reportElement = document.getElementById('executive-report-content');
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        logging: false,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`executive-summary-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScheduleReport = () => {
    console.log('Scheduling report:', { frequency: scheduleFrequency, emails: scheduleEmails });
    setShowScheduleModal(false);
  };

  return (
    <>
      <ReportContainer id="executive-report-content">
        <ReportHeader>
          <HeaderInfo>
            <ReportTitle>Executive Summary Report</ReportTitle>
            <ReportSubtitle>
              <Clock size={16} />
              Generated: {new Date().toLocaleString()}
            </ReportSubtitle>
          </HeaderInfo>
          <ActionButtons>
            <ActionButton onClick={handleExportPDF} disabled={isGenerating}>
              <Download size={16} />
              {isGenerating ? 'Generating...' : 'Export PDF'}
            </ActionButton>
            <ActionButton isSchedule onClick={() => setShowScheduleModal(true)}>
              <Send size={16} />
              Schedule Report
            </ActionButton>
          </ActionButtons>
        </ReportHeader>

        <DateRangeSelector>
          <Calendar size={20} />
          <DateInput type="date" />
          <span>to</span>
          <DateInput type="date" />
          <QuickSelect>
            <QuickSelectButton
              isActive={selectedDateRange === 'day'}
              onClick={() => setSelectedDateRange('day')}
            >
              Today
            </QuickSelectButton>
            <QuickSelectButton
              isActive={selectedDateRange === 'week'}
              onClick={() => setSelectedDateRange('week')}
            >
              This Week
            </QuickSelectButton>
            <QuickSelectButton
              isActive={selectedDateRange === 'month'}
              onClick={() => setSelectedDateRange('month')}
            >
              This Month
            </QuickSelectButton>
            <QuickSelectButton
              isActive={selectedDateRange === 'quarter'}
              onClick={() => setSelectedDateRange('quarter')}
            >
              This Quarter
            </QuickSelectButton>
          </QuickSelect>
        </DateRangeSelector>

        <SummarySection>
          <SectionTitle>
            <TrendingUp size={20} />
            Key Performance Metrics
          </SectionTitle>
          <KeyMetricsGrid>
            {Object.values(mockMetrics).map((metric, index) => {
              const Icon = metric.icon;
              return (
                <MetricCard key={index} trend={metric.trend}>
                  <MetricLabel>
                    <Icon size={16} />
                    {metric.label}
                  </MetricLabel>
                  <MetricValue>{metric.value}</MetricValue>
                  <MetricTrend trend={metric.trend}>
                    <TrendingUp size={16} style={{ transform: metric.trend < 0 ? 'rotate(180deg)' : 'none' }} />
                    {Math.abs(metric.trend)}% vs last period
                  </MetricTrend>
                </MetricCard>
              );
            })}
          </KeyMetricsGrid>
        </SummarySection>

        <SummarySection>
          <SectionTitle>
            <FileText size={20} />
            AI-Powered Insights & Recommendations
          </SectionTitle>
          <InsightsGrid>
            {mockInsights.map((insight, index) => (
              <InsightCard key={index} priority={insight.priority}>
                <InsightTitle>{insight.title}</InsightTitle>
                <InsightContent>{insight.content}</InsightContent>
                <InsightAction>
                  {insight.action}
                  <TrendingUp size={14} />
                </InsightAction>
              </InsightCard>
            ))}
          </InsightsGrid>
        </SummarySection>

        <ChartSection>
          <SectionTitle>
            <BarChart3 size={20} />
            Performance Trends
          </SectionTitle>
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
            Chart visualization will be integrated here
          </div>
        </ChartSection>
      </ReportContainer>

      {showScheduleModal && (
        <>
          <ModalOverlay onClick={() => setShowScheduleModal(false)} />
          <ScheduleModal>
            <h3 style={{ margin: 0, marginBottom: '20px' }}>Schedule Executive Report</h3>
            <ScheduleOptions>
              <ScheduleOption>
                <input
                  type="radio"
                  name="frequency"
                  value="daily"
                  checked={scheduleFrequency === 'daily'}
                  onChange={(e) => setScheduleFrequency(e.target.value)}
                />
                Daily (9:00 AM)
              </ScheduleOption>
              <ScheduleOption>
                <input
                  type="radio"
                  name="frequency"
                  value="weekly"
                  checked={scheduleFrequency === 'weekly'}
                  onChange={(e) => setScheduleFrequency(e.target.value)}
                />
                Weekly (Mondays, 9:00 AM)
              </ScheduleOption>
              <ScheduleOption>
                <input
                  type="radio"
                  name="frequency"
                  value="monthly"
                  checked={scheduleFrequency === 'monthly'}
                  onChange={(e) => setScheduleFrequency(e.target.value)}
                />
                Monthly (1st of month, 9:00 AM)
              </ScheduleOption>
            </ScheduleOptions>
            <EmailInput
              type="email"
              placeholder="Enter email addresses (comma-separated)"
              value={scheduleEmails}
              onChange={(e) => setScheduleEmails(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <ActionButton onClick={handleScheduleReport} style={{ flex: 1 }}>
                Schedule
              </ActionButton>
              <ActionButton
                onClick={() => setShowScheduleModal(false)}
                style={{ flex: 1, background: '#666' }}
              >
                Cancel
              </ActionButton>
            </div>
          </ScheduleModal>
        </>
      )}
    </>
  );
};

export default ExecutiveSummaryReport;