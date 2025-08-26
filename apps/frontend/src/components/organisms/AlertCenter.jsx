import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useCallback } from 'react';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import Typography from '../atoms/Typography';
import Badge from '../atoms/Badge';
import SearchBar from '../molecules/SearchBar';
import AlertCard from '../molecules/AlertCard';
import { useI18n } from '../../hooks/useI18n';

const AlertCenterContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[3]};
  overflow: hidden;
  height: 100%;
  max-height: 800px;
`;

const AlertHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  background: ${props => props.theme.colors.background.secondary};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
    flex-direction: column;
    gap: ${props => props.theme.spacing[3]};
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  flex: 1;
  min-width: 0;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    width: 100%;
    justify-content: space-between;
  }
`;

const SearchContainer = styled.div`
  flex: 1;
  max-width: 300px;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    max-width: none;
  }
`;

const FilterBar = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[6]};
  background: ${props => props.theme.colors.background.primary};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  overflow-x: auto;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  }
`;

const FilterChip = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  background: ${props => props.active ? props.theme.colors.primary[100] : props.theme.colors.background.elevated};
  border: 1px solid ${props => props.active ? props.theme.colors.primary[300] : props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[4]};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.active ? props.theme.colors.primary[700] : props.theme.colors.text.secondary};
  cursor: pointer;
  white-space: nowrap;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    border-color: ${props => props.theme.colors.border.strong};
    background: ${props => props.active ? props.theme.colors.primary[100] : props.theme.colors.background.secondary};
  }
`;

const BulkActionsBar = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[6]};
  background: ${props => props.theme.colors.primary[50]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
    flex-direction: column;
    align-items: flex-start;
    gap: ${props => props.theme.spacing[2]};
  }
`;

const BulkActionsLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
`;

const BulkActionsRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  flex-wrap: wrap;
`;

const AlertsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${props => props.theme.spacing[2]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[2]};
  }
`;

const AlertItem = styled(motion.div)`
  position: relative;
  margin-bottom: ${props => props.theme.spacing[3]};
  cursor: pointer;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SelectionCheckbox = styled.input.attrs({ type: 'checkbox' })`
  position: absolute;
  top: ${props => props.theme.spacing[3]};
  left: ${props => props.theme.spacing[3]};
  z-index: 10;
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing[4]};
  padding: ${props => props.theme.spacing[8]} ${props => props.theme.spacing[4]};
  text-align: center;
  color: ${props => props.theme.colors.text.tertiary};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${props => props.theme.spacing[4]};
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
  background: ${props => props.theme.colors.background.secondary};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => getStatColor(props.type, props.theme)};
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  margin-top: ${props => props.theme.spacing[1]};
`;

const getStatColor = (type, theme) => {
  const colors = {
    error: theme.colors.red[600],
    warning: theme.colors.yellow[600],
    info: theme.colors.primary[600],
    success: theme.colors.green[600],
    total: theme.colors.text.primary
  };
  return colors[type] || theme.colors.text.primary;
};

const getSeverityFilters = (t) => [
  { id: 'all', label: t('alerts.filters.allAlerts'), icon: 'bell' },
  { id: 'error', label: t('alerts.severity.critical'), icon: 'error', color: 'error' },
  { id: 'warning', label: t('alerts.severity.warning'), icon: 'warning', color: 'warning' },
  { id: 'info', label: t('alerts.severity.info'), icon: 'info', color: 'info' },
  { id: 'success', label: t('alerts.filters.resolved'), icon: 'checkCircle', color: 'success' }
];

const getStatusFilters = (t) => [
  { id: 'unread', label: t('alerts.filters.unread'), icon: 'bell' },
  { id: 'read', label: t('alerts.filters.read'), icon: 'checkCircle' },
  { id: 'archived', label: t('alerts.filters.archived'), icon: 'archive' }
];

const getBulkActions = (t) => [
  { id: 'markRead', label: t('alerts.actions.markAsRead'), icon: 'checkCircle', variant: 'secondary' },
  { id: 'markUnread', label: t('alerts.actions.markAsUnread'), icon: 'bell', variant: 'secondary' },
  { id: 'archive', label: t('alerts.actions.archive'), icon: 'archive', variant: 'secondary' },
  { id: 'delete', label: t('alerts.actions.delete'), icon: 'delete', variant: 'danger' }
];

const AlertCenter = ({
  alerts = [],
  loading = false,
  showStats = true,
  showSearch = true,
  showFilters = true,
  showBulkActions = true,
  onAlertClick,
  onAlertAction,
  onBulkAction,
  onRefresh,
  className,
  ...props
}) => {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('unread');
  const [selectedAlerts, setSelectedAlerts] = useState(new Set());
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const SEVERITY_FILTERS = getSeverityFilters(t);
  const STATUS_FILTERS = getStatusFilters(t);
  const BULK_ACTIONS = getBulkActions(t);

  // Filter and sort alerts
  const filteredAlerts = useMemo(() => {
    let result = [...alerts];

    // Apply search
    if (searchQuery) {
      result = result.filter(alert => 
        alert.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply severity filter
    if (selectedSeverity !== 'all') {
      result = result.filter(alert => alert.severity === selectedSeverity);
    }

    // Apply status filter
    switch (selectedStatus) {
      case 'unread':
        result = result.filter(alert => !alert.read);
        break;
      case 'read':
        result = result.filter(alert => alert.read);
        break;
      case 'archived':
        result = result.filter(alert => alert.archived);
        break;
    }

    // Sort alerts
    result.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'timestamp') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return result;
  }, [alerts, searchQuery, selectedSeverity, selectedStatus, sortBy, sortOrder]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: alerts.length,
      error: alerts.filter(a => a.severity === 'error' && !a.archived).length,
      warning: alerts.filter(a => a.severity === 'warning' && !a.archived).length,
      info: alerts.filter(a => a.severity === 'info' && !a.archived).length,
      unread: alerts.filter(a => !a.read && !a.archived).length
    };
  }, [alerts]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleAlertSelect = useCallback((alertId, selected) => {
    const newSelection = new Set(selectedAlerts);
    if (selected) {
      newSelection.add(alertId);
    } else {
      newSelection.delete(alertId);
    }
    setSelectedAlerts(newSelection);
  }, [selectedAlerts]);

  const handleSelectAll = useCallback((selected) => {
    if (selected) {
      setSelectedAlerts(new Set(filteredAlerts.map(alert => alert.id)));
    } else {
      setSelectedAlerts(new Set());
    }
  }, [filteredAlerts]);

  const handleBulkAction = useCallback((actionId) => {
    const selectedIds = Array.from(selectedAlerts);
    onBulkAction?.(actionId, selectedIds);
    setSelectedAlerts(new Set());
  }, [selectedAlerts, onBulkAction]);

  const handleAlertItemClick = useCallback((alert) => {
    if (!selectedAlerts.has(alert.id)) {
      onAlertClick?.(alert);
    }
  }, [selectedAlerts, onAlertClick]);

  const isAllSelected = filteredAlerts.length > 0 && 
    filteredAlerts.every(alert => selectedAlerts.has(alert.id));

  return (
    <AlertCenterContainer className={className} {...props}>
      <AlertHeader>
        <HeaderLeft>
          <HeaderTitle>
            <Icon name="bell" size={24} />
            <Typography variant="h5" weight="semibold">
              {t('alerts.alertCenter')}
            </Typography>
            {stats.unread > 0 && (
              <Badge variant="error" size="sm">
                {stats.unread}
              </Badge>
            )}
          </HeaderTitle>
        </HeaderLeft>

        <HeaderRight>
          {showSearch && (
            <SearchContainer>
              <SearchBar
                placeholder={t('alerts.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                maxWidth="100%"
              />
            </SearchContainer>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            <Icon name={sortOrder === 'asc' ? 'arrowUp' : 'arrowDown'} size={16} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            loading={loading}
          >
            <Icon name="refresh" size={16} />
          </Button>
        </HeaderRight>
      </AlertHeader>

      {showStats && (
        <StatsGrid>
          <StatItem>
            <StatValue type="total">{stats.total}</StatValue>
            <StatLabel>{t('alerts.total')}</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue type="error">{stats.error}</StatValue>
            <StatLabel>{t('alerts.critical')}</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue type="warning">{stats.warning}</StatValue>
            <StatLabel>{t('alerts.warnings')}</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue type="info">{stats.info}</StatValue>
            <StatLabel>{t('alerts.severity.info')}</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue type="unread">{stats.unread}</StatValue>
            <StatLabel>{t('alerts.unread')}</StatLabel>
          </StatItem>
        </StatsGrid>
      )}

      {showFilters && (
        <FilterBar
          initial={false}
          animate={{ height: 'auto', opacity: 1 }}
        >
          {SEVERITY_FILTERS.map(filter => (
            <FilterChip
              key={filter.id}
              active={selectedSeverity === filter.id}
              onClick={() => setSelectedSeverity(filter.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon name={filter.icon} size={14} />
              {filter.label}
              {filter.id !== 'all' && stats[filter.id] > 0 && (
                <Badge variant={filter.color} size="sm">
                  {stats[filter.id]}
                </Badge>
              )}
            </FilterChip>
          ))}
          
          <div style={{ width: '1px', height: '20px', background: '#e5e5e5', margin: '0 8px' }} />
          
          {STATUS_FILTERS.map(filter => (
            <FilterChip
              key={filter.id}
              active={selectedStatus === filter.id}
              onClick={() => setSelectedStatus(filter.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon name={filter.icon} size={14} />
              {filter.label}
            </FilterChip>
          ))}
        </FilterBar>
      )}

      <AnimatePresence>
        {selectedAlerts.size > 0 && showBulkActions && (
          <BulkActionsBar
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <BulkActionsLeft>
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
              <Typography variant="body2" weight="medium" color="primary">
                {selectedAlerts.size} alert{selectedAlerts.size === 1 ? '' : 's'} selected
              </Typography>
            </BulkActionsLeft>
            
            <BulkActionsRight>
              {BULK_ACTIONS.map(action => (
                <Button
                  key={action.id}
                  variant={action.variant}
                  size="sm"
                  onClick={() => handleBulkAction(action.id)}
                >
                  <Icon name={action.icon} size={16} />
                  {action.label}
                </Button>
              ))}
            </BulkActionsRight>
          </BulkActionsBar>
        )}
      </AnimatePresence>

      <AlertsList>
        {loading ? (
          <EmptyState>
            <Icon name="clock" size={48} />
            <Typography variant="body1" color="secondary">
              {t('alerts.states.loading')}
            </Typography>
          </EmptyState>
        ) : filteredAlerts.length === 0 ? (
          <EmptyState>
            <Icon name="bell" size={48} />
            <div>
              <Typography variant="h6" weight="medium">
                {t('alerts.states.noAlertsFound')}
              </Typography>
              <Typography variant="body2" color="secondary">
                {searchQuery || selectedSeverity !== 'all' || selectedStatus !== 'unread'
                  ? t('alerts.states.adjustFilters')
                  : t('alerts.states.allCaughtUp')}
              </Typography>
            </div>
          </EmptyState>
        ) : (
          filteredAlerts.map((alert, index) => (
            <AlertItem
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              onClick={() => handleAlertItemClick(alert)}
            >
              {showBulkActions && (
                <SelectionCheckbox
                  checked={selectedAlerts.has(alert.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleAlertSelect(alert.id, e.target.checked);
                  }}
                />
              )}
              
              <AlertCard
                severity={alert.severity}
                title={alert.title}
                description={alert.message}
                category={alert.category}
                timestamp={alert.timestamp}
                badge={alert.badge}
                dismissible={!alert.read}
                onDismiss={() => onAlertAction?.('markRead', alert)}
                actions={[
                  {
                    label: alert.read ? t('alerts.actions.markAsUnread') : t('alerts.actions.markAsRead'),
                    icon: alert.read ? 'bell' : 'checkCircle',
                    onClick: () => onAlertAction?.(alert.read ? 'markUnread' : 'markRead', alert)
                  },
                  {
                    label: t('alerts.actions.archive'),
                    icon: 'archive',
                    onClick: () => onAlertAction?.('archive', alert)
                  }
                ]}
                style={{
                  paddingLeft: showBulkActions ? '50px' : undefined,
                  opacity: alert.read ? 0.8 : 1
                }}
              />
            </AlertItem>
          ))
        )}
      </AlertsList>
    </AlertCenterContainer>
  );
};

export default AlertCenter;