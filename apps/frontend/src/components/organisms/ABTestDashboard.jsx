// A/B Test Dashboard Component for OMNIX AI
// Comprehensive A/B testing management dashboard
import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import MetricCard from '../molecules/MetricCard';
import FilterDropdown from '../molecules/FilterDropdown';
import DataTable from '../organisms/DataTable';
import LoadingAnimations from '../atoms/LoadingAnimations';
import ConfirmDialog from '../molecules/ConfirmDialog';
import { useABTesting } from '../../hooks/useABTesting';

const DashboardContainer = styled.div`
  background: ${props => props.theme.colors.background.card};
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing[6]};
  box-shadow: ${props => props.theme.shadows.lg};
  border: 1px solid ${props => props.theme.colors.border.subtle};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[6]};
  flex-wrap: wrap;
`;

const TitleSection = styled.div`
  flex: 1;
  min-width: 200px;
`;

const Title = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing[2]} 0;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
`;

const Actions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  flex-wrap: wrap;
`;

const MetricsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const FiltersSection = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[6]};
  flex-wrap: wrap;
  align-items: center;
`;

const SearchInput = styled(Input)`
  min-width: 250px;
  flex: 1;
`;

const TestsSection = styled.div`
  background: ${props => props.theme.colors.background.subtle};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing[4]};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing[8]};
  color: ${props => props.theme.colors.text.secondary};
`;

const StatusBadge = styled(Badge)`
  ${props => {
    switch (props.status) {
      case 'running':
        return `
          background: ${props.theme.colors.status.success}20;
          color: ${props.theme.colors.status.success};
          border: 1px solid ${props.theme.colors.status.success}40;
        `;
      case 'completed':
        return `
          background: ${props.theme.colors.primary.main}20;
          color: ${props.theme.colors.primary.main};
          border: 1px solid ${props.theme.colors.primary.main}40;
        `;
      case 'paused':
        return `
          background: ${props.theme.colors.status.warning}20;
          color: ${props.theme.colors.status.warning};
          border: 1px solid ${props.theme.colors.status.warning}40;
        `;
      case 'pending':
        return `
          background: ${props.theme.colors.text.secondary}20;
          color: ${props.theme.colors.text.secondary};
          border: 1px solid ${props.theme.colors.text.secondary}40;
        `;
      default:
        return '';
    }
  }}
`;

const ActionButton = styled(Button)`
  min-width: auto;
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
`;

const ABTestDashboard = ({ 
  onCreateTest,
  onViewTest,
  onEditTest,
  className 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTest, setSelectedTest] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const {
    tests,
    loading,
    error,
    totalTests,
    runningTests,
    completedTests,
    pendingTests,
    activateTest,
    deactivateTest,
    deleteTest,
    refresh,
    clearError
  } = useABTesting({
    autoRefresh: true,
    refreshInterval: 30000
  });

  // Filter options
  const statusOptions = [
    { value: 'all', label: 'All Tests' },
    { value: 'running', label: 'Running' },
    { value: 'completed', label: 'Completed' },
    { value: 'paused', label: 'Paused' },
    { value: 'pending', label: 'Pending' }
  ];

  // Filter tests based on search and status
  const filteredTests = tests.filter(test => {
    const matchesSearch = !searchQuery || 
      test.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.analysisType.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || test.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Handle test actions
  const handleActivateTest = useCallback(async (testId) => {
    try {
      await activateTest(testId);
    } catch (err) {
      console.error('Failed to activate test:', err);
    }
  }, [activateTest]);

  const handleDeactivateTest = useCallback(async (testId) => {
    try {
      await deactivateTest(testId);
    } catch (err) {
      console.error('Failed to deactivate test:', err);
    }
  }, [deactivateTest]);

  const handleDeleteTest = useCallback(async (testId) => {
    setConfirmAction({
      type: 'delete',
      testId,
      message: 'Are you sure you want to delete this A/B test? This action cannot be undone.'
    });
  }, []);

  const confirmActionHandler = useCallback(async () => {
    if (!confirmAction) return;

    try {
      switch (confirmAction.type) {
        case 'delete':
          await deleteTest(confirmAction.testId);
          break;
        default:
          console.warn('Unknown action type:', confirmAction.type);
      }
    } catch (err) {
      console.error('Failed to execute action:', err);
    } finally {
      setConfirmAction(null);
    }
  }, [confirmAction, deleteTest]);

  // Table columns configuration
  const columns = [
    {
      key: 'testName',
      title: 'Test Name',
      render: (value, row) => (
        <div>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>
            {value}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {row.analysisType}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => (
        <StatusBadge status={value}>
          {value}
        </StatusBadge>
      )
    },
    {
      key: 'models',
      title: 'Models',
      render: (_, row) => (
        <div style={{ fontSize: '0.875rem' }}>
          <div>A: {row.modelA || 'Haiku'}</div>
          <div>B: {row.modelB || 'Sonnet'}</div>
        </div>
      )
    },
    {
      key: 'trafficSplit',
      title: 'Traffic Split',
      render: (value) => `${value || 50}% / ${100 - (value || 50)}%`
    },
    {
      key: 'progress',
      title: 'Progress',
      render: (value, row) => {
        const progress = value || 0;
        const daysRemaining = row.daysRemaining || 0;
        return (
          <div style={{ fontSize: '0.875rem' }}>
            <div>{progress}% complete</div>
            {daysRemaining > 0 && (
              <div style={{ color: 'var(--text-secondary)' }}>
                {daysRemaining} days remaining
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <ActionButton
            size="sm"
            variant="outline"
            onClick={() => onViewTest?.(row.testId)}
          >
            <Icon name="eye" size={14} />
          </ActionButton>
          
          {row.status === 'pending' || row.status === 'paused' ? (
            <ActionButton
              size="sm"
              variant="success"
              onClick={() => handleActivateTest(row.testId)}
              title="Start Test"
            >
              <Icon name="play" size={14} />
            </ActionButton>
          ) : row.status === 'running' ? (
            <ActionButton
              size="sm"
              variant="warning"
              onClick={() => handleDeactivateTest(row.testId)}
              title="Pause Test"
            >
              <Icon name="pause" size={14} />
            </ActionButton>
          ) : null}
          
          <ActionButton
            size="sm"
            variant="outline"
            onClick={() => onEditTest?.(row.testId)}
            disabled={row.status === 'running'}
          >
            <Icon name="edit-2" size={14} />
          </ActionButton>
          
          <ActionButton
            size="sm"
            variant="error"
            onClick={() => handleDeleteTest(row.testId)}
            disabled={row.status === 'running'}
          >
            <Icon name="trash-2" size={14} />
          </ActionButton>
        </div>
      )
    }
  ];

  if (loading && tests.length === 0) {
    return (
      <DashboardContainer className={className}>
        <LoadingAnimations.Skeleton height="400px" />
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer className={className}>
      <Header>
        <TitleSection>
          <Title>A/B Testing Dashboard</Title>
          <Subtitle>
            Manage and monitor your AI model comparison tests
          </Subtitle>
        </TitleSection>
        
        <Actions>
          <Button
            variant="outline"
            onClick={refresh}
            disabled={loading}
          >
            <Icon name="refresh-cw" size={16} />
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={() => onCreateTest?.('quick')}
          >
            <Icon name="zap" size={16} />
            Quick Test
          </Button>
          <Button
            variant="primary"
            onClick={() => onCreateTest?.('custom')}
          >
            <Icon name="plus" size={16} />
            Create Test
          </Button>
        </Actions>
      </Header>

      {/* Metrics Section */}
      <MetricsSection>
        <MetricCard
          title="Total Tests"
          value={totalTests}
          icon="bar-chart-3"
          trend="neutral"
        />
        <MetricCard
          title="Running Tests"
          value={runningTests}
          icon="play-circle"
          trend="positive"
          color="success"
        />
        <MetricCard
          title="Completed Tests"
          value={completedTests}
          icon="check-circle"
          trend="positive"
          color="info"
        />
        <MetricCard
          title="Pending Tests"
          value={pendingTests}
          icon="clock"
          trend="neutral"
          color="warning"
        />
      </MetricsSection>

      {/* Filters Section */}
      <FiltersSection>
        <SearchInput
          placeholder="Search tests by name or analysis type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon="search"
        />
        <FilterDropdown
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="Filter by status"
        />
      </FiltersSection>

      {/* Tests Section */}
      <TestsSection>
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState>
                <Icon name="alert-circle" size={48} />
                <h3>Error Loading Tests</h3>
                <p>{error}</p>
                <Button onClick={() => { clearError(); refresh(); }}>
                  Try Again
                </Button>
              </EmptyState>
            </motion.div>
          ) : filteredTests.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState>
                <Icon name="beaker" size={48} />
                <h3>
                  {tests.length === 0 ? 'No A/B Tests Yet' : 'No Tests Match Your Filters'}
                </h3>
                <p>
                  {tests.length === 0 
                    ? 'Create your first A/B test to start comparing AI model performance.'
                    : 'Try adjusting your search or filter criteria.'
                  }
                </p>
                {tests.length === 0 && (
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <Button onClick={() => onCreateTest?.('quick')}>
                      Quick Test
                    </Button>
                    <Button variant="outline" onClick={() => onCreateTest?.('custom')}>
                      Custom Test
                    </Button>
                  </div>
                )}
              </EmptyState>
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DataTable
                data={filteredTests}
                columns={columns}
                loading={loading}
                onRowClick={(row) => onViewTest?.(row.testId)}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </TestsSection>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={!!confirmAction}
        title={`Confirm ${confirmAction?.type === 'delete' ? 'Deletion' : 'Action'}`}
        message={confirmAction?.message}
        confirmText={confirmAction?.type === 'delete' ? 'Delete' : 'Confirm'}
        cancelText="Cancel"
        variant={confirmAction?.type === 'delete' ? 'error' : 'primary'}
        onConfirm={confirmActionHandler}
        onCancel={() => setConfirmAction(null)}
      />
    </DashboardContainer>
  );
};

export default ABTestDashboard;