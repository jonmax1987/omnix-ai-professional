import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useCallback } from 'react';
import { Shield, Lock, Eye, UserCheck, FileText, Download, AlertTriangle, CheckCircle, Settings, Database, Users, Calendar, Filter, Search, ExternalLink } from 'lucide-react';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const GovernanceContainer = styled(motion.div)`
  padding: ${props => props.theme.spacing[6]};
  background: ${props => props.theme.colors.background.primary};
  min-height: 100vh;
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    padding: ${props => props.theme.spacing[4]};
  }
`;

const Header = styled.div`
  margin-bottom: ${props => props.theme.spacing[6]};
  
  h2 {
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing[2]};
    color: ${props => props.theme.colors.text.primary};
    font-size: ${props => props.theme.typography.fontSize['2xl']};
    font-weight: ${props => props.theme.typography.fontWeight.bold};
    margin-bottom: ${props => props.theme.spacing[2]};
  }
  
  p {
    color: ${props => props.theme.colors.text.secondary};
    font-size: ${props => props.theme.typography.fontSize.base};
    max-width: 600px;
  }
`;

const TabContainer = styled.div`
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const TabList = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  margin-bottom: ${props => props.theme.spacing[4]};
  overflow-x: auto;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    gap: ${props => props.theme.spacing[1]};
  }
`;

const Tab = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  border: none;
  background: none;
  color: ${props => props.active ? props.theme.colors.primary[600] : props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.active ? props.theme.typography.fontWeight.semibold : props.theme.typography.fontWeight.medium};
  cursor: pointer;
  border-bottom: 2px solid ${props => props.active ? props.theme.colors.primary[600] : 'transparent'};
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    color: ${props => props.theme.colors.primary[600]};
    background: ${props => props.theme.colors.primary[50]};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
    font-size: ${props => props.theme.typography.fontSize.xs};
  }
`;

const ContentArea = styled.div`
  animation: ${fadeIn} 0.4s ease-out;
`;

const GovernanceGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing[6]};
  margin-bottom: ${props => props.theme.spacing[6]};
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing[4]};
  }
`;

const GovernanceCard = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[6]};
  animation: ${fadeIn} 0.6s ease-out;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[4]};
  
  h3 {
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing[2]};
    color: ${props => props.theme.colors.text.primary};
    font-size: ${props => props.theme.typography.fontSize.lg};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    margin: 0;
  }
`;

const ComplianceCard = styled.div`
  background: ${props => props.theme.colors.background.primary};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const ComplianceHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[2]};
  
  h4 {
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing[2]};
    color: ${props => props.theme.colors.text.primary};
    font-size: ${props => props.theme.typography.fontSize.base};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    margin: 0;
  }
`;

const ComplianceStatus = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.spacing[1]};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  
  ${props => {
    switch (props.status) {
      case 'compliant':
        return `
          background: ${props.theme.colors.green[100]};
          color: ${props.theme.colors.green[700]};
        `;
      case 'partial':
        return `
          background: ${props.theme.colors.yellow[100]};
          color: ${props.theme.colors.yellow[700]};
        `;
      case 'non-compliant':
        return `
          background: ${props.theme.colors.red[100]};
          color: ${props.theme.colors.red[700]};
        `;
      default:
        return `
          background: ${props.theme.colors.gray[100]};
          color: ${props.theme.colors.gray[700]};
        `;
    }
  }}
`;

const ComplianceDescription = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  margin: 0;
  line-height: 1.5;
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.background.elevated};
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.primary[50]};
    border-color: ${props => props.theme.colors.primary[200]};
    color: ${props => props.theme.colors.primary[700]};
  }
  
  &.primary {
    background: ${props => props.theme.colors.primary[600]};
    border-color: ${props => props.theme.colors.primary[600]};
    color: ${props => props.theme.colors.white};
    
    &:hover {
      background: ${props => props.theme.colors.primary[700]};
      border-color: ${props => props.theme.colors.primary[700]};
    }
  }
`;

const DataTable = styled.div`
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[2]};
  overflow: hidden;
`;

const TableHeader = styled.div`
  background: ${props => props.theme.colors.background.elevated};
  padding: ${props => props.theme.spacing[3]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: ${props => props.theme.spacing[2]};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.secondary};
`;

const TableRow = styled.div`
  padding: ${props => props.theme.spacing[3]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: ${props => props.theme.spacing[2]};
  align-items: center;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.background.elevated};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const SearchInput = styled.input`
  flex: 1;
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.background.elevated};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary[100]};
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.text.tertiary};
  }
`;

const FilterSelect = styled.select`
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.background.elevated};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary[100]};
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: ${props => props.theme.spacing[4]};
  right: ${props => props.theme.spacing[4]};
  background: none;
  border: none;
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  padding: ${props => props.theme.spacing[1]};
  border-radius: ${props => props.theme.spacing[1]};
  
  &:hover {
    background: ${props => props.theme.colors.gray[100]};
    color: ${props => props.theme.colors.text.primary};
  }
`;

const ABTestDataGovernance = ({ testData, onGovernanceUpdate, onClose }) => {
  const [activeTab, setActiveTab] = useState('privacy');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock governance data
  const governanceData = useMemo(() => {
    return {
      privacy: {
        gdprCompliance: {
          status: 'compliant',
          lastAudit: '2024-08-15',
          requirements: [
            'Data minimization - Only collect necessary test data',
            'Consent management - Explicit user consent for data processing',
            'Right to erasure - Ability to delete participant data',
            'Data portability - Export user data on request',
            'Privacy by design - Built-in privacy protection'
          ],
          violations: []
        },
        ccpaCompliance: {
          status: 'compliant',
          lastAudit: '2024-08-10',
          requirements: [
            'Consumer right to know - Transparent data usage disclosure',
            'Right to delete - Delete personal information on request',
            'Right to opt-out - Opt-out of data sale (not applicable)',
            'Non-discrimination - Equal service regardless of privacy choices'
          ],
          violations: []
        },
        consentManagement: {
          totalParticipants: 15420,
          consentedParticipants: 14850,
          consentRate: 96.3,
          withdrawnConsent: 570,
          pendingConsent: 0
        }
      },
      dataRetention: {
        policies: [
          {
            id: 'test-data',
            name: 'A/B Test Data',
            retention: '2 years',
            status: 'active',
            lastReview: '2024-07-01',
            dataTypes: ['user interactions', 'conversion events', 'test assignments']
          },
          {
            id: 'personal-data',
            name: 'Personal Identifiers',
            retention: '30 days',
            status: 'active',
            lastReview: '2024-08-01',
            dataTypes: ['user IDs', 'session data', 'IP addresses']
          },
          {
            id: 'analytics-data',
            name: 'Analytics Data',
            retention: '13 months',
            status: 'active',
            lastReview: '2024-06-15',
            dataTypes: ['aggregated metrics', 'performance data', 'statistical analysis']
          }
        ],
        scheduledDeletions: [
          {
            id: 'del-001',
            description: 'Test data from Q1 2022 experiments',
            scheduledDate: '2024-09-01',
            dataSize: '2.3 GB',
            status: 'scheduled'
          },
          {
            id: 'del-002',
            description: 'Expired user consent records',
            scheduledDate: '2024-08-25',
            dataSize: '156 MB',
            status: 'scheduled'
          }
        ]
      },
      access: {
        roles: [
          {
            id: 'admin',
            name: 'A/B Test Administrator',
            permissions: ['full-access', 'user-management', 'data-export', 'policy-configuration'],
            users: ['john.doe@company.com', 'sarah.johnson@company.com'],
            lastReview: '2024-08-01'
          },
          {
            id: 'analyst',
            name: 'Data Analyst',
            permissions: ['read-access', 'export-anonymized', 'create-reports'],
            users: ['mike.chen@company.com', 'emily.rodriguez@company.com', 'david.kim@company.com'],
            lastReview: '2024-07-15'
          },
          {
            id: 'viewer',
            name: 'Test Viewer',
            permissions: ['read-access', 'view-dashboards'],
            users: ['team-leads@company.com'],
            lastReview: '2024-08-10'
          }
        ],
        auditLog: [
          {
            timestamp: '2024-08-20T10:30:00Z',
            user: 'john.doe@company.com',
            action: 'exported test results',
            testId: 'ab-001',
            details: 'Exported anonymized results for Claude Sonnet vs Haiku test'
          },
          {
            timestamp: '2024-08-20T09:15:00Z',
            user: 'sarah.johnson@company.com',
            action: 'created new test',
            testId: 'ab-005',
            details: 'Created inventory prediction accuracy test'
          },
          {
            timestamp: '2024-08-19T16:45:00Z',
            user: 'mike.chen@company.com',
            action: 'accessed participant data',
            testId: 'ab-002',
            details: 'Viewed aggregated conversion metrics'
          }
        ]
      },
      security: {
        encryption: {
          dataAtRest: 'AES-256',
          dataInTransit: 'TLS 1.3',
          keyManagement: 'AWS KMS',
          status: 'compliant'
        },
        anonymization: {
          techniques: ['k-anonymity', 'differential privacy', 'data masking'],
          defaultKValue: 5,
          privacyBudget: 1.0,
          status: 'active'
        },
        vulnerabilities: [
          {
            id: 'vuln-001',
            severity: 'medium',
            description: 'Potential timing attack in A/B test assignment',
            status: 'mitigated',
            fixedDate: '2024-08-15'
          }
        ]
      }
    };
  }, []);

  // Filter audit log based on search and status
  const filteredAuditLog = useMemo(() => {
    let filtered = governanceData.access.auditLog;
    
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.details.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      // For demo purposes, all entries are considered 'success'
      filtered = filtered.filter(entry => 'success' === statusFilter);
    }
    
    return filtered;
  }, [governanceData.access.auditLog, searchTerm, statusFilter]);

  const handleExportCompliance = useCallback(() => {
    const complianceReport = {
      timestamp: new Date().toISOString(),
      privacy: governanceData.privacy,
      dataRetention: governanceData.dataRetention,
      access: governanceData.access,
      security: governanceData.security,
      summary: {
        overallStatus: 'compliant',
        gdprStatus: governanceData.privacy.gdprCompliance.status,
        ccpaStatus: governanceData.privacy.ccpaCompliance.status,
        consentRate: governanceData.privacy.consentManagement.consentRate,
        totalViolations: 0
      }
    };
    
    // Trigger download
    const blob = new Blob([JSON.stringify(complianceReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-governance-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Update parent component
    onGovernanceUpdate?.({
      type: 'export',
      report: complianceReport,
      timestamp: new Date()
    });
  }, [governanceData, onGovernanceUpdate]);

  const handleDeleteExpiredData = useCallback((deletionId) => {
    console.log('Triggering data deletion for:', deletionId);
    
    // Update parent component
    onGovernanceUpdate?.({
      type: 'data_deletion',
      deletionId,
      timestamp: new Date()
    });
  }, [onGovernanceUpdate]);

  const handleAccessReview = useCallback((roleId) => {
    console.log('Triggering access review for role:', roleId);
    
    // Update parent component  
    onGovernanceUpdate?.({
      type: 'access_review',
      roleId,
      timestamp: new Date()
    });
  }, [onGovernanceUpdate]);

  const tabs = [
    { id: 'privacy', label: 'Privacy Compliance', icon: Shield },
    { id: 'retention', label: 'Data Retention', icon: Database },
    { id: 'access', label: 'Access Control', icon: Lock },
    { id: 'security', label: 'Security', icon: UserCheck }
  ];

  return (
    <GovernanceContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      {onClose && (
        <CloseButton onClick={onClose}>
          ✕
        </CloseButton>
      )}

      <Header>
        <h2>
          <Shield />
          Data Governance & Privacy Compliance
        </h2>
        <p>
          Comprehensive privacy compliance, data governance, and security management for A/B testing operations ensuring GDPR, CCPA, and industry standards compliance.
        </p>
      </Header>

      {/* Tabs */}
      <TabContainer>
        <TabList>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <Tab
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} />
                {tab.label}
              </Tab>
            );
          })}
        </TabList>

        <ContentArea>
          <AnimatePresence mode="wait">
            {activeTab === 'privacy' && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <GovernanceGrid>
                  <GovernanceCard>
                    <CardHeader>
                      <h3>
                        <Shield />
                        GDPR Compliance
                      </h3>
                      <ComplianceStatus status={governanceData.privacy.gdprCompliance.status}>
                        <CheckCircle size={12} />
                        Compliant
                      </ComplianceStatus>
                    </CardHeader>
                    
                    <ComplianceCard>
                      <ComplianceDescription>
                        <strong>Last Audit:</strong> {governanceData.privacy.gdprCompliance.lastAudit}
                      </ComplianceDescription>
                      <br />
                      <ComplianceDescription>
                        <strong>Requirements Met:</strong>
                      </ComplianceDescription>
                      <ul style={{ margin: '8px 0', paddingLeft: '20px', color: '#6b7280' }}>
                        {governanceData.privacy.gdprCompliance.requirements.map((req, index) => (
                          <li key={index} style={{ fontSize: '14px', lineHeight: '1.5' }}>{req}</li>
                        ))}
                      </ul>
                    </ComplianceCard>

                    <ActionButton className="primary">
                      <FileText size={16} />
                      Generate GDPR Report
                    </ActionButton>
                  </GovernanceCard>

                  <GovernanceCard>
                    <CardHeader>
                      <h3>
                        <Lock />
                        CCPA Compliance
                      </h3>
                      <ComplianceStatus status={governanceData.privacy.ccpaCompliance.status}>
                        <CheckCircle size={12} />
                        Compliant
                      </ComplianceStatus>
                    </CardHeader>
                    
                    <ComplianceCard>
                      <ComplianceDescription>
                        <strong>Last Audit:</strong> {governanceData.privacy.ccpaCompliance.lastAudit}
                      </ComplianceDescription>
                      <br />
                      <ComplianceDescription>
                        <strong>Requirements Met:</strong>
                      </ComplianceDescription>
                      <ul style={{ margin: '8px 0', paddingLeft: '20px', color: '#6b7280' }}>
                        {governanceData.privacy.ccpaCompliance.requirements.map((req, index) => (
                          <li key={index} style={{ fontSize: '14px', lineHeight: '1.5' }}>{req}</li>
                        ))}
                      </ul>
                    </ComplianceCard>

                    <ActionButton className="primary">
                      <FileText size={16} />
                      Generate CCPA Report
                    </ActionButton>
                  </GovernanceCard>
                </GovernanceGrid>

                <GovernanceCard>
                  <CardHeader>
                    <h3>
                      <UserCheck />
                      Consent Management
                    </h3>
                    <ActionButton onClick={handleExportCompliance}>
                      <Download size={16} />
                      Export Compliance Report
                    </ActionButton>
                  </CardHeader>
                  
                  <GovernanceGrid style={{ marginBottom: 0 }}>
                    <ComplianceCard>
                      <ComplianceHeader>
                        <h4>Total Participants</h4>
                      </ComplianceHeader>
                      <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>
                        {governanceData.privacy.consentManagement.totalParticipants.toLocaleString()}
                      </div>
                    </ComplianceCard>
                    
                    <ComplianceCard>
                      <ComplianceHeader>
                        <h4>Consent Rate</h4>
                        <ComplianceStatus status="compliant">
                          <CheckCircle size={12} />
                          {governanceData.privacy.consentManagement.consentRate}%
                        </ComplianceStatus>
                      </ComplianceHeader>
                      <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#059669' }}>
                        {governanceData.privacy.consentManagement.consentedParticipants.toLocaleString()}
                      </div>
                      <ComplianceDescription style={{ marginTop: '8px' }}>
                        consented participants
                      </ComplianceDescription>
                    </ComplianceCard>
                    
                    <ComplianceCard>
                      <ComplianceHeader>
                        <h4>Withdrawn Consent</h4>
                      </ComplianceHeader>
                      <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#dc2626' }}>
                        {governanceData.privacy.consentManagement.withdrawnConsent.toLocaleString()}
                      </div>
                      <ComplianceDescription style={{ marginTop: '8px' }}>
                        users withdrew consent
                      </ComplianceDescription>
                    </ComplianceCard>
                    
                    <ComplianceCard>
                      <ComplianceHeader>
                        <h4>Pending Consent</h4>
                      </ComplianceHeader>
                      <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#6b7280' }}>
                        {governanceData.privacy.consentManagement.pendingConsent.toLocaleString()}
                      </div>
                      <ComplianceDescription style={{ marginTop: '8px' }}>
                        consent requests pending
                      </ComplianceDescription>
                    </ComplianceCard>
                  </GovernanceGrid>
                </GovernanceCard>
              </motion.div>
            )}

            {activeTab === 'retention' && (
              <motion.div
                key="retention"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <GovernanceCard>
                  <CardHeader>
                    <h3>
                      <Database />
                      Data Retention Policies
                    </h3>
                  </CardHeader>
                  
                  <DataTable>
                    <TableHeader>
                      <div>Policy Name</div>
                      <div>Retention Period</div>
                      <div>Status</div>
                      <div>Last Review</div>
                      <div>Actions</div>
                    </TableHeader>
                    
                    {governanceData.dataRetention.policies.map(policy => (
                      <TableRow key={policy.id}>
                        <div>
                          <div style={{ fontWeight: '600', marginBottom: '4px' }}>{policy.name}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {policy.dataTypes.join(', ')}
                          </div>
                        </div>
                        <div style={{ fontWeight: '500' }}>{policy.retention}</div>
                        <div>
                          <ComplianceStatus status="compliant">
                            <CheckCircle size={12} />
                            {policy.status}
                          </ComplianceStatus>
                        </div>
                        <div>{policy.lastReview}</div>
                        <div>
                          <ActionButton>
                            <Settings size={14} />
                          </ActionButton>
                        </div>
                      </TableRow>
                    ))}
                  </DataTable>
                </GovernanceCard>

                <GovernanceCard>
                  <CardHeader>
                    <h3>
                      <Calendar />
                      Scheduled Data Deletions
                    </h3>
                  </CardHeader>
                  
                  <DataTable>
                    <TableHeader>
                      <div>Description</div>
                      <div>Scheduled Date</div>
                      <div>Data Size</div>
                      <div>Status</div>
                      <div>Actions</div>
                    </TableHeader>
                    
                    {governanceData.dataRetention.scheduledDeletions.map(deletion => (
                      <TableRow key={deletion.id}>
                        <div>{deletion.description}</div>
                        <div>{deletion.scheduledDate}</div>
                        <div>{deletion.dataSize}</div>
                        <div>
                          <ComplianceStatus status="partial">
                            <Calendar size={12} />
                            {deletion.status}
                          </ComplianceStatus>
                        </div>
                        <div>
                          <ActionButton onClick={() => handleDeleteExpiredData(deletion.id)}>
                            <AlertTriangle size={14} />
                            Execute Now
                          </ActionButton>
                        </div>
                      </TableRow>
                    ))}
                  </DataTable>
                </GovernanceCard>
              </motion.div>
            )}

            {activeTab === 'access' && (
              <motion.div
                key="access"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <GovernanceCard>
                  <CardHeader>
                    <h3>
                      <Users />
                      Access Control & Roles
                    </h3>
                  </CardHeader>
                  
                  <DataTable>
                    <TableHeader>
                      <div>Role Name</div>
                      <div>Users</div>
                      <div>Permissions</div>
                      <div>Last Review</div>
                      <div>Actions</div>
                    </TableHeader>
                    
                    {governanceData.access.roles.map(role => (
                      <TableRow key={role.id}>
                        <div style={{ fontWeight: '600' }}>{role.name}</div>
                        <div>{role.users.length} users</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {role.permissions.slice(0, 2).join(', ')}
                          {role.permissions.length > 2 && ` +${role.permissions.length - 2} more`}
                        </div>
                        <div>{role.lastReview}</div>
                        <div>
                          <ActionButton onClick={() => handleAccessReview(role.id)}>
                            <Eye size={14} />
                            Review
                          </ActionButton>
                        </div>
                      </TableRow>
                    ))}
                  </DataTable>
                </GovernanceCard>

                <GovernanceCard>
                  <CardHeader>
                    <h3>
                      <FileText />
                      Access Audit Log
                    </h3>
                  </CardHeader>
                  
                  <SearchContainer>
                    <SearchInput
                      type="text"
                      placeholder="Search by user, action, or details..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FilterSelect
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="success">Success</option>
                      <option value="failed">Failed</option>
                      <option value="warning">Warning</option>
                    </FilterSelect>
                  </SearchContainer>
                  
                  <DataTable>
                    <TableHeader>
                      <div>User & Action</div>
                      <div>Test ID</div>
                      <div>Timestamp</div>
                      <div>Status</div>
                      <div>Details</div>
                    </TableHeader>
                    
                    {filteredAuditLog.map((entry, index) => (
                      <TableRow key={index}>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>
                            {entry.user}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {entry.action}
                          </div>
                        </div>
                        <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>{entry.testId}</div>
                        <div style={{ fontSize: '12px' }}>
                          {new Date(entry.timestamp).toLocaleString()}
                        </div>
                        <div>
                          <ComplianceStatus status="compliant">
                            <CheckCircle size={12} />
                            Success
                          </ComplianceStatus>
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {entry.details}
                        </div>
                      </TableRow>
                    ))}
                  </DataTable>
                </GovernanceCard>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <GovernanceGrid>
                  <GovernanceCard>
                    <CardHeader>
                      <h3>
                        <Lock />
                        Data Encryption
                      </h3>
                      <ComplianceStatus status={governanceData.security.encryption.status}>
                        <CheckCircle size={12} />
                        Compliant
                      </ComplianceStatus>
                    </CardHeader>
                    
                    <ComplianceCard>
                      <ComplianceDescription>
                        <strong>Data at Rest:</strong> {governanceData.security.encryption.dataAtRest}
                      </ComplianceDescription>
                      <br />
                      <ComplianceDescription>
                        <strong>Data in Transit:</strong> {governanceData.security.encryption.dataInTransit}
                      </ComplianceDescription>
                      <br />
                      <ComplianceDescription>
                        <strong>Key Management:</strong> {governanceData.security.encryption.keyManagement}
                      </ComplianceDescription>
                    </ComplianceCard>
                  </GovernanceCard>

                  <GovernanceCard>
                    <CardHeader>
                      <h3>
                        <Eye />
                        Data Anonymization
                      </h3>
                      <ComplianceStatus status={governanceData.security.anonymization.status}>
                        <CheckCircle size={12} />
                        Active
                      </ComplianceStatus>
                    </CardHeader>
                    
                    <ComplianceCard>
                      <ComplianceDescription>
                        <strong>Techniques:</strong> {governanceData.security.anonymization.techniques.join(', ')}
                      </ComplianceDescription>
                      <br />
                      <ComplianceDescription>
                        <strong>K-Value:</strong> {governanceData.security.anonymization.defaultKValue}
                      </ComplianceDescription>
                      <br />
                      <ComplianceDescription>
                        <strong>Privacy Budget:</strong> {governanceData.security.anonymization.privacyBudget}
                      </ComplianceDescription>
                    </ComplianceCard>
                  </GovernanceCard>
                </GovernanceGrid>

                <GovernanceCard>
                  <CardHeader>
                    <h3>
                      <AlertTriangle />
                      Security Vulnerabilities
                    </h3>
                  </CardHeader>
                  
                  <DataTable>
                    <TableHeader>
                      <div>Vulnerability</div>
                      <div>Severity</div>
                      <div>Status</div>
                      <div>Fixed Date</div>
                      <div>Actions</div>
                    </TableHeader>
                    
                    {governanceData.security.vulnerabilities.map(vuln => (
                      <TableRow key={vuln.id}>
                        <div>
                          <div style={{ fontWeight: '600', marginBottom: '4px' }}>{vuln.id}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {vuln.description}
                          </div>
                        </div>
                        <div>
                          <ComplianceStatus status="partial">
                            <AlertTriangle size={12} />
                            {vuln.severity}
                          </ComplianceStatus>
                        </div>
                        <div>
                          <ComplianceStatus status="compliant">
                            <CheckCircle size={12} />
                            {vuln.status}
                          </ComplianceStatus>
                        </div>
                        <div>{vuln.fixedDate}</div>
                        <div>
                          <ActionButton>
                            <ExternalLink size={14} />
                            Details
                          </ActionButton>
                        </div>
                      </TableRow>
                    ))}
                  </DataTable>
                </GovernanceCard>
              </motion.div>
            )}
          </AnimatePresence>
        </ContentArea>
      </TabContainer>
    </GovernanceContainer>
  );
};

export default ABTestDataGovernance;