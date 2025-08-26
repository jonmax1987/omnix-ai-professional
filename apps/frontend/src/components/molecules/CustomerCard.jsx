// CustomerCard Molecule
// Implementation of MOL-010: CustomerCard with segment indicators
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import Typography from '../atoms/Typography';
import Badge from '../atoms/Badge';
import Avatar from '../atoms/Avatar';
import { useI18n } from '../../hooks/useI18n';

// Customer segment types
export const CustomerSegments = {
  CHAMPIONS: 'champions',
  LOYAL: 'loyal',
  POTENTIAL_LOYALISTS: 'potential',
  NEW_CUSTOMERS: 'new',
  AT_RISK: 'at-risk',
  PROMISING: 'promising',
  CANNOT_LOSE: 'cannot-lose',
  HIBERNATING: 'hibernating'
};

// Customer status types
export const CustomerStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  CHURNED: 'churned',
  NEW: 'new'
};

// Customer card variants
export const CustomerCardVariants = {
  COMPACT: 'compact',
  DEFAULT: 'default',
  DETAILED: 'detailed',
  LIST: 'list'
};

const CustomerContainer = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['variant', 'interactive', 'selected', 'segment'].includes(prop)
})`
  display: flex;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.spacing[2]};
  overflow: hidden;
  position: relative;
  transition: all 0.2s ease;
  
  ${props => props.interactive && css`
    cursor: pointer;
    
    &:hover {
      border-color: ${props.theme.colors.primary};
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  `}
  
  ${props => props.selected && css`
    border-color: ${props.theme.colors.primary};
    box-shadow: 0 0 0 2px ${props.theme.colors.primary}20;
  `}
  
  ${props => getCustomerCardVariantStyles(props.variant, props.theme)}
  ${props => getSegmentIndicatorStyles(props.segment, props.theme)}
`;

const CustomerAvatar = styled.div.withConfig({
  shouldForwardProp: (prop) => !['variant'].includes(prop)
})`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing[3]};
  
  ${props => props.variant === CustomerCardVariants.COMPACT && css`
    padding: ${props.theme.spacing[2]};
  `}
`;

const CustomerContent = styled.div.withConfig({
  shouldForwardProp: (prop) => !['variant'].includes(prop)
})`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: ${props => props.theme.spacing[3]};
  min-width: 0;
  
  ${props => props.variant === CustomerCardVariants.COMPACT && css`
    padding: ${props.theme.spacing[2]};
  `}
  
  ${props => props.variant === CustomerCardVariants.DETAILED && css`
    padding: ${props.theme.spacing[4]};
  `}
`;

const CustomerHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const CustomerInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const CustomerMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  flex-shrink: 0;
`;

const CustomerTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const CustomerDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[1]};
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const CustomerMetrics = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[3]};
  flex-wrap: wrap;
  
  ${props => props.theme.breakpoints.mobile} {
    gap: ${props => props.theme.spacing[2]};
  }
`;

const MetricItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  font-size: 12px;
  
  .metric-value {
    font-size: 16px;
    font-weight: 600;
    color: ${props => props.theme.colors.text.primary};
  }
  
  .metric-label {
    color: ${props => props.theme.colors.text.secondary};
    text-align: center;
  }
`;

const SegmentIndicator = styled.div.withConfig({
  shouldForwardProp: (prop) => !['segment'].includes(prop)
})`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  padding: 4px 8px;
  border-radius: ${props => props.theme.spacing[1]};
  font-size: 12px;
  font-weight: 600;
  margin-bottom: ${props => props.theme.spacing[2]};
  
  ${props => getSegmentStyles(props.segment, props.theme)}
`;

const StatusIndicator = styled.div.withConfig({
  shouldForwardProp: (prop) => !['status'].includes(prop)
})`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  font-size: 12px;
  
  ${props => getStatusStyles(props.status, props.theme)}
`;

const CustomerActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  margin-top: auto;
  flex-wrap: wrap;
`;

const GrowthIndicator = styled.div.withConfig({
  shouldForwardProp: (prop) => !['growth'].includes(prop)
})`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  
  ${props => props.growth >= 0 ? css`
    color: ${props.theme.colors.success};
  ` : css`
    color: ${props.theme.colors.danger};
  `}
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
`;

// Styling functions
function getCustomerCardVariantStyles(variant, theme) {
  const styles = {
    [CustomerCardVariants.COMPACT]: css`
      max-height: 120px;
      flex-direction: row;
    `,
    [CustomerCardVariants.DEFAULT]: css`
      flex-direction: row;
      min-height: 160px;
    `,
    [CustomerCardVariants.DETAILED]: css`
      flex-direction: column;
      min-height: 280px;
    `,
    [CustomerCardVariants.LIST]: css`
      flex-direction: row;
      width: 100%;
    `
  };

  return styles[variant] || styles[CustomerCardVariants.DEFAULT];
}

function getSegmentIndicatorStyles(segment, theme) {
  if (!segment) return '';
  
  const segmentColor = getSegmentColor(segment);
  return css`
    border-left: 4px solid ${segmentColor};
  `;
}

function getSegmentStyles(segment, theme) {
  const segmentColor = getSegmentColor(segment);
  return css`
    background: ${segmentColor}15;
    color: ${segmentColor};
    border: 1px solid ${segmentColor}40;
  `;
}

function getSegmentColor(segment) {
  const colors = {
    [CustomerSegments.CHAMPIONS]: '#667EEA',
    [CustomerSegments.LOYAL]: '#48BB78',
    [CustomerSegments.POTENTIAL_LOYALISTS]: '#4299E1',
    [CustomerSegments.NEW_CUSTOMERS]: '#9F7AEA',
    [CustomerSegments.AT_RISK]: '#F56565',
    [CustomerSegments.PROMISING]: '#38B2AC',
    [CustomerSegments.CANNOT_LOSE]: '#ED8936',
    [CustomerSegments.HIBERNATING]: '#A0AEC0'
  };

  return colors[segment] || '#667EEA';
}

function getStatusStyles(status, theme) {
  const styles = {
    [CustomerStatus.ACTIVE]: css`
      color: ${theme.colors.success};
    `,
    [CustomerStatus.INACTIVE]: css`
      color: ${theme.colors.warning};
    `,
    [CustomerStatus.CHURNED]: css`
      color: ${theme.colors.danger};
    `,
    [CustomerStatus.NEW]: css`
      color: ${theme.colors.primary};
    `
  };

  return styles[status] || styles[CustomerStatus.ACTIVE];
}

function getSegmentLabel(segment, t) {
  const labels = {
    [CustomerSegments.CHAMPIONS]: t('customer.segments.champions'),
    [CustomerSegments.LOYAL]: t('customer.segments.loyal'),
    [CustomerSegments.POTENTIAL_LOYALISTS]: t('customer.segments.potential'),
    [CustomerSegments.NEW_CUSTOMERS]: t('customer.segments.new'),
    [CustomerSegments.AT_RISK]: t('customer.segments.atRisk'),
    [CustomerSegments.PROMISING]: t('customer.segments.promising'),
    [CustomerSegments.CANNOT_LOSE]: t('customer.segments.cannotLose'),
    [CustomerSegments.HIBERNATING]: t('customer.segments.hibernating')
  };

  return labels[segment] || segment;
}

function getStatusLabel(status, t) {
  const labels = {
    [CustomerStatus.ACTIVE]: t('customer.status.active'),
    [CustomerStatus.INACTIVE]: t('customer.status.inactive'),
    [CustomerStatus.CHURNED]: t('customer.status.churned'),
    [CustomerStatus.NEW]: t('customer.status.new')
  };

  return labels[status] || status;
}

function getSegmentIcon(segment) {
  const icons = {
    [CustomerSegments.CHAMPIONS]: 'Award',
    [CustomerSegments.LOYAL]: 'Star',
    [CustomerSegments.POTENTIAL_LOYALISTS]: 'TrendingUp',
    [CustomerSegments.NEW_CUSTOMERS]: 'Users',
    [CustomerSegments.AT_RISK]: 'AlertTriangle',
    [CustomerSegments.PROMISING]: 'Target',
    [CustomerSegments.CANNOT_LOSE]: 'Shield',
    [CustomerSegments.HIBERNATING]: 'Moon'
  };

  return icons[segment] || 'User';
}

/**
 * CustomerCard Component
 * Advanced customer card with segment indicators and rich functionality
 */
const CustomerCard = ({
  id,
  name,
  email,
  phone,
  avatar,
  segment = CustomerSegments.NEW_CUSTOMERS,
  status = CustomerStatus.ACTIVE,
  totalOrders = 0,
  totalSpent = 0,
  averageOrderValue = 0,
  lastOrderDate = null,
  joinDate = null,
  loyaltyPoints = 0,
  growth = 0,
  churnRisk = 0,
  lifetimeValue = 0,
  variant = CustomerCardVariants.DEFAULT,
  interactive = true,
  selected = false,
  showMetrics = true,
  showActions = true,
  actions = [],
  onSelect = null,
  onContact = null,
  onViewProfile = null,
  onClick = null,
  className = '',
  ...props
}) => {
  const { t } = useI18n();
  const [isSelected, setIsSelected] = useState(selected);

  const handleClick = useCallback((e) => {
    if (!interactive) return;
    
    if (onSelect) {
      setIsSelected(!isSelected);
      onSelect(id, !isSelected, e);
    }
    
    if (onClick) {
      onClick(id, e);
    }
  }, [interactive, isSelected, onSelect, onClick, id]);

  const handleContact = useCallback((e) => {
    e.stopPropagation();
    
    if (onContact) {
      onContact(id, { email, phone });
    }
  }, [onContact, id, email, phone]);

  const handleViewProfile = useCallback((e) => {
    e.stopPropagation();
    
    if (onViewProfile) {
      onViewProfile(id);
    }
  }, [onViewProfile, id]);

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString()}`;
  };

  return (
    <CustomerContainer
      variant={variant}
      interactive={interactive}
      selected={isSelected}
      segment={segment}
      onClick={handleClick}
      className={`customer-card customer-card-${variant} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={interactive ? { y: -2 } : {}}
      {...props}
    >
      {/* Customer Avatar */}
      <CustomerAvatar variant={variant}>
        <Avatar
          src={avatar}
          alt={name}
          fallback={name?.charAt(0) || 'C'}
          size={variant === CustomerCardVariants.COMPACT ? 'sm' : 'md'}
        />
      </CustomerAvatar>

      {/* Customer Content */}
      <CustomerContent variant={variant}>
        <CustomerHeader>
          <CustomerInfo>
            <CustomerTitle>
              <Typography variant="subtitle2" weight="medium" truncate>
                {name}
              </Typography>
              {status === CustomerStatus.NEW && (
                <Badge variant="filled" color="primary" size="sm">
                  {t('customer.new')}
                </Badge>
              )}
            </CustomerTitle>
            
            {/* Segment Indicator */}
            <SegmentIndicator segment={segment}>
              <Icon name={getSegmentIcon(segment)} size={12} />
              {getSegmentLabel(segment, t)}
            </SegmentIndicator>
          </CustomerInfo>

          <CustomerMeta>
            {/* Growth Indicator */}
            {growth !== 0 && (
              <GrowthIndicator growth={growth}>
                <Icon 
                  name={growth >= 0 ? 'TrendingUp' : 'TrendingDown'} 
                  size={12} 
                />
                {Math.abs(growth).toFixed(1)}%
              </GrowthIndicator>
            )}
            
            {/* Churn Risk */}
            {churnRisk > 0.5 && (
              <Badge variant="outline" color="danger" size="sm">
                <Icon name="AlertTriangle" size={10} />
                {t('customer.highRisk')}
              </Badge>
            )}
          </CustomerMeta>
        </CustomerHeader>

        {/* Contact Details */}
        {variant !== CustomerCardVariants.COMPACT && (
          <CustomerDetails>
            {email && (
              <ContactInfo>
                <Icon name="Mail" size={12} style={{ display: 'inline', marginRight: '4px' }} />
                {email}
              </ContactInfo>
            )}
            {phone && (
              <ContactInfo>
                <Icon name="Phone" size={12} style={{ display: 'inline', marginRight: '4px' }} />
                {phone}
              </ContactInfo>
            )}
          </CustomerDetails>
        )}

        {/* Customer Metrics */}
        {showMetrics && variant !== CustomerCardVariants.COMPACT && (
          <CustomerMetrics>
            <MetricItem>
              <div className="metric-value">{totalOrders}</div>
              <div className="metric-label">{t('customer.totalOrders')}</div>
            </MetricItem>
            
            <MetricItem>
              <div className="metric-value">{formatCurrency(totalSpent)}</div>
              <div className="metric-label">{t('customer.totalSpent')}</div>
            </MetricItem>
            
            <MetricItem>
              <div className="metric-value">{formatCurrency(averageOrderValue)}</div>
              <div className="metric-label">{t('customer.avgOrderValue')}</div>
            </MetricItem>
            
            {loyaltyPoints > 0 && (
              <MetricItem>
                <div className="metric-value">{loyaltyPoints.toLocaleString()}</div>
                <div className="metric-label">{t('customer.loyaltyPoints')}</div>
              </MetricItem>
            )}
          </CustomerMetrics>
        )}

        {/* Additional Info for Detailed View */}
        {variant === CustomerCardVariants.DETAILED && (
          <CustomerDetails style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
              <span>{t('customer.lastOrder')}:</span>
              <span>{formatDate(lastOrderDate)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
              <span>{t('customer.joinDate')}:</span>
              <span>{formatDate(joinDate)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span>{t('customer.lifetimeValue')}:</span>
              <span>{formatCurrency(lifetimeValue)}</span>
            </div>
          </CustomerDetails>
        )}

        {/* Status */}
        <StatusIndicator status={status}>
          <Icon 
            name={status === CustomerStatus.ACTIVE ? 'CheckCircle' : 
                  status === CustomerStatus.NEW ? 'UserPlus' :
                  status === CustomerStatus.INACTIVE ? 'Clock' : 'XCircle'} 
            size={12} 
          />
          <span>{getStatusLabel(status, t)}</span>
        </StatusIndicator>

        {/* Actions */}
        {showActions && (
          <CustomerActions>
            {actions.map((action, index) => (
              <Button
                key={action.id || index}
                onClick={action.onClick}
                variant={action.variant || 'outline'}
                size="small"
                color={action.color}
                disabled={action.disabled}
              >
                {action.icon && <Icon name={action.icon} size={14} />}
                {action.label}
              </Button>
            ))}
            
            {/* Default actions */}
            <Button
              onClick={handleContact}
              variant="outline"
              size="small"
            >
              <Icon name="Mail" size={14} />
              {variant === CustomerCardVariants.COMPACT ? '' : t('customer.contact')}
            </Button>
            
            <Button
              onClick={handleViewProfile}
              variant="filled"
              color="primary"
              size="small"
            >
              <Icon name="User" size={14} />
              {variant === CustomerCardVariants.COMPACT ? '' : t('customer.viewProfile')}
            </Button>
          </CustomerActions>
        )}
      </CustomerContent>
    </CustomerContainer>
  );
};

export default CustomerCard;