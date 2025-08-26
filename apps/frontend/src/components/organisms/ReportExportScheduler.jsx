import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  Download, 
  Send, 
  Calendar, 
  Clock, 
  Mail, 
  FileText, 
  Image, 
  Database,
  Settings,
  Users,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';

const SchedulerContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface.primary};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ActionCard = styled.div`
  background: ${({ theme }) => theme.colors.background.main};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.main};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }
`;

const CardIcon = styled.div`
  width: 48px;
  height: 48px;
  background: ${({ theme }) => theme.colors.primary.light}20;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary.main};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const CardTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
`;

const CardDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin: 0;
  line-height: 1.5;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.surface.primary};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ModalTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};

  &:hover {
    background: ${({ theme }) => theme.colors.neutral.hover};
  }
`;

const FormSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SectionTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Label = styled.label`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.main};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.main}20;
  }
`;

const Select = styled.select`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.main};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const TextArea = styled.textarea`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.main};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  min-height: 80px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.main}20;
  }
`;

const CheckboxGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};

  &:hover {
    background: ${({ theme }) => theme.colors.neutral.hover};
  }
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: ${({ theme }) => theme.colors.primary.main};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  background: ${({ variant, theme }) => 
    variant === 'primary' ? theme.colors.primary.main : 
    variant === 'secondary' ? theme.colors.secondary.main :
    theme.colors.surface.secondary};
  color: ${({ variant }) => 
    variant === 'primary' || variant === 'secondary' ? 'white' : '#6B7280'};
  border: 1px solid ${({ variant, theme }) => 
    variant === 'primary' ? theme.colors.primary.main :
    variant === 'secondary' ? theme.colors.secondary.main :
    theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ variant, theme }) => 
      variant === 'primary' ? theme.colors.primary.dark : 
      variant === 'secondary' ? theme.colors.secondary.dark :
      theme.colors.neutral.hover};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ScheduledReports = styled.div`
  background: ${({ theme }) => theme.colors.background.main};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const ReportItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral.border};

  &:last-child {
    border-bottom: none;
  }
`;

const ReportInfo = styled.div`
  flex: 1;
`;

const ReportName = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const ReportDetails = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const StatusBadge = styled.div`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ status, theme }) => 
    status === 'active' ? `${theme.colors.success.light}20` :
    status === 'paused' ? `${theme.colors.warning.light}20` :
    `${theme.colors.error.light}20`};
  color: ${({ status, theme }) => 
    status === 'active' ? theme.colors.success.main :
    status === 'paused' ? theme.colors.warning.main :
    theme.colors.error.main};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const ReportExportScheduler = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [scheduleData, setScheduleData] = useState({
    frequency: 'weekly',
    dayOfWeek: 'monday',
    timeOfDay: '09:00',
    recipients: '',
    reports: [],
    subject: '',
    message: ''
  });

  const exportOptions = [
    {
      id: 'instant',
      icon: Download,
      title: 'Instant Export',
      description: 'Download reports immediately in your preferred format'
    },
    {
      id: 'schedule',
      icon: Calendar,
      title: 'Schedule Reports',
      description: 'Set up automated report delivery via email'
    },
    {
      id: 'bulk',
      icon: Database,
      title: 'Bulk Export',
      description: 'Export multiple reports and data sets at once'
    },
    {
      id: 'api',
      icon: Settings,
      title: 'API Integration',
      description: 'Connect external systems for automated data sync'
    }
  ];

  const reportTypes = [
    'Executive Summary',
    'Revenue Trends',
    'Customer Behavior',
    'Inventory Turnover',
    'Profitability Analysis',
    'Seasonal Trends',
    'Comparative Analysis'
  ];

  const scheduledReports = [
    {
      name: 'Weekly Executive Summary',
      frequency: 'Weekly - Mondays 9:00 AM',
      recipients: 'john@company.com, sarah@company.com',
      status: 'active'
    },
    {
      name: 'Monthly Revenue Report',
      frequency: 'Monthly - 1st of month 8:00 AM',
      recipients: 'finance@company.com',
      status: 'active'
    },
    {
      name: 'Daily Inventory Alert',
      frequency: 'Daily - 7:00 AM',
      recipients: 'inventory@company.com',
      status: 'paused'
    }
  ];

  const handleExport = (format) => {
    console.log(`Exporting reports in ${format} format`);
    setActiveModal(null);
  };

  const handleSchedule = () => {
    console.log('Scheduling report:', scheduleData);
    setActiveModal(null);
  };

  const handleReportToggle = (report) => {
    setScheduleData(prev => ({
      ...prev,
      reports: prev.reports.includes(report)
        ? prev.reports.filter(r => r !== report)
        : [...prev.reports, report]
    }));
  };

  return (
    <SchedulerContainer>
      <Header>
        <Title>
          <Send size={24} />
          Report Export & Scheduling
        </Title>
      </Header>

      <ActionGrid>
        {exportOptions.map((option) => {
          const Icon = option.icon;
          return (
            <ActionCard key={option.id} onClick={() => setActiveModal(option.id)}>
              <CardIcon>
                <Icon size={24} />
              </CardIcon>
              <CardTitle>{option.title}</CardTitle>
              <CardDescription>{option.description}</CardDescription>
            </ActionCard>
          );
        })}
      </ActionGrid>

      <ScheduledReports>
        <SectionTitle>Active Scheduled Reports</SectionTitle>
        {scheduledReports.map((report, index) => (
          <ReportItem key={index}>
            <ReportInfo>
              <ReportName>{report.name}</ReportName>
              <ReportDetails>
                {report.frequency} • {report.recipients}
              </ReportDetails>
            </ReportInfo>
            <StatusBadge status={report.status}>
              {report.status === 'active' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
              {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
            </StatusBadge>
          </ReportItem>
        ))}
      </ScheduledReports>

      {/* Instant Export Modal */}
      {activeModal === 'instant' && (
        <Modal onClick={() => setActiveModal(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Instant Export</ModalTitle>
              <CloseButton onClick={() => setActiveModal(null)}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>

            <FormSection>
              <SectionTitle>Export Format</SectionTitle>
              <FormGrid>
                <FormField>
                  <Label>Format</Label>
                  <Select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)}>
                    <option value="pdf">PDF Document</option>
                    <option value="excel">Excel Spreadsheet</option>
                    <option value="csv">CSV Data</option>
                    <option value="powerpoint">PowerPoint</option>
                  </Select>
                </FormField>
                <FormField>
                  <Label>Date Range</Label>
                  <Select>
                    <option value="current">Current Period</option>
                    <option value="last30">Last 30 Days</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                  </Select>
                </FormField>
              </FormGrid>
            </FormSection>

            <FormSection>
              <SectionTitle>Reports to Include</SectionTitle>
              <CheckboxGroup>
                {reportTypes.map((report) => (
                  <CheckboxItem key={report}>
                    <Checkbox type="checkbox" defaultChecked />
                    <span>{report}</span>
                  </CheckboxItem>
                ))}
              </CheckboxGroup>
            </FormSection>

            <ButtonGroup>
              <Button onClick={() => setActiveModal(null)}>Cancel</Button>
              <Button variant="primary" onClick={() => handleExport(exportFormat)}>
                <Download size={16} />
                Export Now
              </Button>
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}

      {/* Schedule Reports Modal */}
      {activeModal === 'schedule' && (
        <Modal onClick={() => setActiveModal(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Schedule Reports</ModalTitle>
              <CloseButton onClick={() => setActiveModal(null)}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>

            <FormSection>
              <SectionTitle>Schedule Settings</SectionTitle>
              <FormGrid>
                <FormField>
                  <Label>Frequency</Label>
                  <Select 
                    value={scheduleData.frequency} 
                    onChange={(e) => setScheduleData(prev => ({ ...prev, frequency: e.target.value }))}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </Select>
                </FormField>
                <FormField>
                  <Label>Day of Week</Label>
                  <Select 
                    value={scheduleData.dayOfWeek}
                    onChange={(e) => setScheduleData(prev => ({ ...prev, dayOfWeek: e.target.value }))}
                  >
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                  </Select>
                </FormField>
                <FormField>
                  <Label>Time</Label>
                  <Input 
                    type="time" 
                    value={scheduleData.timeOfDay}
                    onChange={(e) => setScheduleData(prev => ({ ...prev, timeOfDay: e.target.value }))}
                  />
                </FormField>
              </FormGrid>
            </FormSection>

            <FormSection>
              <SectionTitle>Reports to Include</SectionTitle>
              <CheckboxGroup>
                {reportTypes.map((report) => (
                  <CheckboxItem key={report}>
                    <Checkbox 
                      type="checkbox" 
                      checked={scheduleData.reports.includes(report)}
                      onChange={() => handleReportToggle(report)}
                    />
                    <span>{report}</span>
                  </CheckboxItem>
                ))}
              </CheckboxGroup>
            </FormSection>

            <FormSection>
              <SectionTitle>Email Settings</SectionTitle>
              <FormField>
                <Label>Recipients (comma-separated)</Label>
                <Input 
                  type="email" 
                  placeholder="john@company.com, sarah@company.com"
                  value={scheduleData.recipients}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, recipients: e.target.value }))}
                />
              </FormField>
              <FormField>
                <Label>Subject Line</Label>
                <Input 
                  type="text" 
                  placeholder="Weekly Business Intelligence Report"
                  value={scheduleData.subject}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, subject: e.target.value }))}
                />
              </FormField>
              <FormField>
                <Label>Custom Message</Label>
                <TextArea 
                  placeholder="Please find attached the weekly business intelligence reports..."
                  value={scheduleData.message}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, message: e.target.value }))}
                />
              </FormField>
            </FormSection>

            <ButtonGroup>
              <Button onClick={() => setActiveModal(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleSchedule}>
                <Calendar size={16} />
                Schedule Reports
              </Button>
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}

      {/* Other modals would be implemented similarly */}
      {activeModal === 'bulk' && (
        <Modal onClick={() => setActiveModal(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Bulk Export</ModalTitle>
              <CloseButton onClick={() => setActiveModal(null)}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>
            <p>Bulk export functionality coming soon...</p>
            <ButtonGroup>
              <Button onClick={() => setActiveModal(null)}>Close</Button>
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}

      {activeModal === 'api' && (
        <Modal onClick={() => setActiveModal(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>API Integration</ModalTitle>
              <CloseButton onClick={() => setActiveModal(null)}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>
            <p>API integration setup coming soon...</p>
            <ButtonGroup>
              <Button onClick={() => setActiveModal(null)}>Close</Button>
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}
    </SchedulerContainer>
  );
};

export default ReportExportScheduler;