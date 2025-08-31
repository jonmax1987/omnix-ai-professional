import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import Typography from '../atoms/Typography';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';
import { useWebSocketStore } from '../../store/websocketStore';

const IntegrationContainer = styled(motion.div)`
  background: ${props => props.theme?.colors?.background?.secondary || '#f8fafc'};
  border-radius: ${props => props.theme?.borderRadius?.xl || '12px'};
  padding: ${props => props.theme?.spacing?.[6] || '24px'};
  border: 1px solid ${props => props.theme?.colors?.border?.light || '#e2e8f0'};
  box-shadow: ${props => props.theme?.shadows?.sm || '0 1px 2px 0 rgba(0, 0, 0, 0.05)'};
`;

const IntegrationHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme?.spacing?.[6] || '24px'};
  
  @media (max-width: ${props => props.theme?.breakpoints?.md || '768px'}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${props => props.theme?.spacing?.[4] || '16px'};
  }
`;

const HeaderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme?.spacing?.[3] || '12px'};
`;

const SupplierIcon = styled(motion.div)`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme?.borderRadius?.lg || '8px'};
  background: linear-gradient(135deg, 
    ${props => props.theme?.colors?.blue?.[500] || '#3b82f6'}, 
    ${props => props.theme?.colors?.green?.[500] || '#10b981'});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: ${props => props.theme?.shadows?.md || '0 4px 6px -1px rgba(0, 0, 0, 0.1)'};
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${props => props.theme?.spacing?.[2] || '8px'};
  align-items: center;
`;

const MetricsOverview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: ${props => props.theme?.spacing?.[4] || '16px'};
  margin-bottom: ${props => props.theme?.spacing?.[6] || '24px'};
  padding: ${props => props.theme?.spacing?.[4] || '16px'};
  background: ${props => props.theme?.colors?.background?.primary || '#ffffff'};
  border-radius: ${props => props.theme?.borderRadius?.lg || '8px'};
  border: 1px solid ${props => props.theme?.colors?.border?.light || '#e2e8f0'};
`;

const MetricCard = styled(motion.div)`
  text-align: center;
  
  @media (max-width: ${props => props.theme?.breakpoints?.sm || '640px'}) {
    text-align: left;
  }
`;

const MetricValue = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'status'
})`
  font-size: ${props => props.theme?.typography?.fontSize?.['2xl'] || '24px'};
  font-weight: ${props => props.theme?.typography?.fontWeight?.bold || '700'};
  color: ${props => {
    const colors = props.theme?.colors || {};
    switch (props.status) {
      case 'excellent': return colors.green?.[600] || '#16a34a';
      case 'good': return colors.blue?.[600] || '#2563eb';
      case 'warning': return colors.yellow?.[600] || '#ca8a04';
      case 'critical': return colors.red?.[600] || '#dc2626';
      default: return colors.text?.primary || '#111827';
    }
  }};
  margin-bottom: ${props => props.theme?.spacing?.[1] || '4px'};
`;

const MetricLabel = styled.div`
  font-size: ${props => props.theme?.typography?.fontSize?.sm || '14px'};
  color: ${props => props.theme?.colors?.text?.secondary || '#6b7280'};
  font-weight: ${props => props.theme?.typography?.fontWeight?.medium || '500'};
`;

const TabNavigation = styled.div`
  display: flex;
  margin-bottom: ${props => props.theme?.spacing?.[6] || '24px'};
  border-bottom: 1px solid ${props => props.theme?.colors?.border?.light || '#e2e8f0'};
  overflow-x: auto;
`;

const TabButton = styled(motion.button).withConfig({
  shouldForwardProp: (prop) => prop !== 'active'
})`
  padding: ${props => props.theme?.spacing?.[3] || '12px'} ${props => props.theme?.spacing?.[4] || '16px'};
  border: none;
  background: transparent;
  color: ${props => props.active ? 
    (props.theme?.colors?.primary?.[600] || '#2563eb') : 
    (props.theme?.colors?.text?.secondary || '#6b7280')};
  font-weight: ${props => props.active ? 
    (props.theme?.typography?.fontWeight?.semibold || '600') : 
    (props.theme?.typography?.fontWeight?.medium || '500')};
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease-in-out;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: ${props => props.theme?.spacing?.[2] || '8px'};
  
  &:hover {
    color: ${props => props.theme?.colors?.primary?.[600] || '#2563eb'};
  }
  
  ${props => props.active && `
    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background: ${props.theme?.colors?.primary?.[600] || '#2563eb'};
    }
  `}
`;

const TabContent = styled(motion.div)`
  min-height: 400px;
`;

const SupplierGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: ${props => props.theme?.spacing?.[4] || '16px'};
`;

const SupplierCard = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['status', 'priority'].includes(prop)
})`
  background: ${props => props.theme?.colors?.background?.primary || '#ffffff'};
  border: 1px solid ${props => {
    const colors = props.theme?.colors || {};
    switch (props.status) {
      case 'excellent': return colors.green?.[200] || '#bbf7d0';
      case 'good': return colors.blue?.[200] || '#bfdbfe';
      case 'warning': return colors.yellow?.[200] || '#fef08a';
      case 'critical': return colors.red?.[200] || '#fecaca';
      default: return colors.border?.light || '#e2e8f0';
    }
  }};
  border-radius: ${props => props.theme?.borderRadius?.lg || '8px'};
  padding: ${props => props.theme?.spacing?.[5] || '20px'};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme?.shadows?.lg || '0 10px 15px -3px rgba(0, 0, 0, 0.1)'};
  }
`;

const SupplierHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme?.spacing?.[4] || '16px'};
`;

const SupplierInfo = styled.div`
  flex: 1;
`;

const SupplierName = styled(Typography)`
  font-weight: ${props => props.theme?.typography?.fontWeight?.semibold || '600'};
  color: ${props => props.theme?.colors?.text?.primary || '#111827'};
  margin-bottom: ${props => props.theme?.spacing?.[1] || '4px'};
`;

const SupplierCategory = styled(Typography)`
  color: ${props => props.theme?.colors?.text?.secondary || '#6b7280'};
  font-size: ${props => props.theme?.typography?.fontSize?.sm || '14px'};
`;

const SupplierStatus = styled(Badge).withConfig({
  shouldForwardProp: (prop) => prop !== 'status'
})`
  ${props => {
    const colors = props.theme?.colors || {};
    switch (props.status) {
      case 'excellent':
        return `background: ${colors.green?.[100] || '#dcfce7'}; color: ${colors.green?.[800] || '#166534'};`;
      case 'good':
        return `background: ${colors.blue?.[100] || '#dbeafe'}; color: ${colors.blue?.[800] || '#1e40af'};`;
      case 'warning':
        return `background: ${colors.yellow?.[100] || '#fef3c7'}; color: ${colors.yellow?.[800] || '#92400e'};`;
      case 'critical':
        return `background: ${colors.red?.[100] || '#fee2e2'}; color: ${colors.red?.[800] || '#991b1b'};`;
      default:
        return `background: ${colors.gray?.[100] || '#f3f4f6'}; color: ${colors.gray?.[800] || '#1f2937'};`;
    }
  }}
`;

const SupplierMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${props => props.theme?.spacing?.[3] || '12px'};
  margin-bottom: ${props => props.theme?.spacing?.[4] || '16px'};
`;

const MetricItem = styled.div`
  text-align: center;
  padding: ${props => props.theme?.spacing?.[3] || '12px'};
  background: ${props => props.theme?.colors?.background?.secondary || '#f8fafc'};
  border-radius: ${props => props.theme?.borderRadius?.md || '6px'};
`;

const MetricNumber = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'status'
})`
  font-size: ${props => props.theme?.typography?.fontSize?.lg || '18px'};
  font-weight: ${props => props.theme?.typography?.fontWeight?.bold || '700'};
  color: ${props => {
    const colors = props.theme?.colors || {};
    switch (props.status) {
      case 'excellent': return colors.green?.[600] || '#16a34a';
      case 'good': return colors.blue?.[600] || '#2563eb';
      case 'warning': return colors.yellow?.[600] || '#ca8a04';
      case 'critical': return colors.red?.[600] || '#dc2626';
      default: return colors.text?.primary || '#111827';
    }
  }};
`;

const MetricDescription = styled.div`
  font-size: ${props => props.theme?.typography?.fontSize?.xs || '12px'};
  color: ${props => props.theme?.colors?.text?.secondary || '#6b7280'};
  margin-top: ${props => props.theme?.spacing?.[1] || '4px'};
`;

const SupplierActions = styled.div`
  display: flex;
  gap: ${props => props.theme?.spacing?.[2] || '8px'};
  justify-content: flex-end;
`;

const ActionButton = styled(Button)`
  font-size: ${props => props.theme?.typography?.fontSize?.sm || '14px'};
  padding: ${props => props.theme?.spacing?.[2] || '8px'} ${props => props.theme?.spacing?.[3] || '12px'};
`;

const RealTimeIndicator = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.5rem;
  background: ${({ theme }) => theme?.colors?.background?.secondary || '#f8fafc'};
  border-radius: 6px;
  border: 1px solid ${({ $isActive, theme }) => 
    $isActive ? '#10b981' : (theme?.colors?.border?.light || '#e2e8f0')};
`;

const StatusDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ $isActive }) => $isActive ? '#10b981' : '#6b7280'};
  animation: ${({ $isActive }) => $isActive ? 'pulse 2s infinite' : 'none'};
  
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.2); }
  }
`;

const StatusText = styled.span`
  font-size: 0.75rem;
  color: ${({ theme, $isActive }) => 
    $isActive ? '#10b981' : (theme?.colors?.text?.secondary || '#6b7280')};
  font-weight: ${({ $isActive }) => $isActive ? '600' : '400'};
`;

const UpdateTimestamp = styled.div`
  font-size: 0.7rem;
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#6b7280'};
  margin-top: 0.25rem;
  font-style: italic;
`;

const AvailabilityBadge = styled(Badge)`
  ${({ $availability }) => {
    switch ($availability) {
      case 'available':
        return `background: #dcfce7; color: #166534; border: 1px solid #bbf7d0;`;
      case 'limited_stock':
        return `background: #fef3c7; color: #92400e; border: 1px solid #fed7aa;`;
      case 'out_of_stock':
        return `background: #fee2e2; color: #991b1b; border: 1px solid #fecaca;`;
      case 'delayed_delivery':
        return `background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe;`;
      default:
        return `background: #f3f4f6; color: #1f2937; border: 1px solid #d1d5db;`;
    }
  }}
`;

const AlertsPanel = styled(motion.div)`
  background: ${({ theme }) => theme?.colors?.background?.primary || '#ffffff'};
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme?.colors?.border?.light || '#e2e8f0'};
  margin-bottom: 1.5rem;
  max-height: 300px;
  overflow-y: auto;
`;

const AlertItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: ${({ theme }) => theme?.colors?.background?.secondary || '#f8fafc'};
  border-radius: 8px;
  margin-bottom: 0.5rem;
  border-left: 4px solid ${({ $severity }) => {
    switch ($severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      default: return '#3b82f6';
    }
  }};
`;

const ConnectionStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${({ $connected, theme }) => 
    $connected ? '#dcfce7' : '#fee2e2'};
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ $connected }) => $connected ? '#166534' : '#991b1b'};
  margin-bottom: 1rem;
`;

const LeadTimeTracker = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme?.spacing?.[4] || '16px'};
`;

const LeadTimeCard = styled(motion.div)`
  background: ${props => props.theme?.colors?.background?.primary || '#ffffff'};
  border: 1px solid ${props => props.theme?.colors?.border?.light || '#e2e8f0'};
  border-radius: ${props => props.theme?.borderRadius?.lg || '8px'};
  padding: ${props => props.theme?.spacing?.[5] || '20px'};
`;

const LeadTimeHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme?.spacing?.[4] || '16px'};
`;

const LeadTimeChart = styled.div`
  height: 200px;
  display: flex;
  align-items: end;
  gap: ${props => props.theme?.spacing?.[2] || '8px'};
  padding: ${props => props.theme?.spacing?.[4] || '16px'};
  background: ${props => props.theme?.colors?.background?.secondary || '#f8fafc'};
  border-radius: ${props => props.theme?.borderRadius?.md || '6px'};
`;

const LeadTimeBar = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => prop !== 'performance'
})`
  flex: 1;
  border-radius: ${props => props.theme?.borderRadius?.sm || '4px'};
  background: ${props => {
    const colors = props.theme?.colors || {};
    switch (props.performance) {
      case 'excellent': return colors.green?.[500] || '#10b981';
      case 'good': return colors.blue?.[500] || '#3b82f6';
      case 'warning': return colors.yellow?.[500] || '#f59e0b';
      case 'critical': return colors.red?.[500] || '#ef4444';
      default: return colors.gray?.[400] || '#9ca3af';
    }
  }};
  position: relative;
  cursor: pointer;
  
  &:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: ${props => props.theme?.colors?.text?.primary || '#111827'};
    color: white;
    padding: ${props => props.theme?.spacing?.[1] || '4px'} ${props => props.theme?.spacing?.[2] || '8px'};
    border-radius: ${props => props.theme?.borderRadius?.sm || '4px'};
    font-size: ${props => props.theme?.typography?.fontSize?.xs || '12px'};
    white-space: nowrap;
    z-index: 10;
  }
`;

const SupplierIntegrationHub = ({ 
  suppliers = [], 
  onSupplierSelect = () => {},
  onContactSupplier = () => {},
  onCreateOrder = () => {},
  refreshInterval = 300000,
  className = '' 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [realTimeSuppliers, setRealTimeSuppliers] = useState([]);
  const [supplierAlerts, setSupplierAlerts] = useState([]);
  const [availabilityUpdates, setAvailabilityUpdates] = useState({});

  // WebSocket integration for real-time supplier updates
  const { 
    inventoryUpdates,
    reorderCalculations,
    realtimeData,
    connectionState,
    isConnected 
  } = useWebSocketStore();

  // Mock supplier data if none provided
  const mockSuppliers = useMemo(() => [
    {
      id: 'supplier-1',
      name: 'Coffee Masters Inc.',
      category: 'Beverages',
      status: 'excellent',
      reliabilityScore: 96,
      averageLeadTime: 2.3,
      onTimeDelivery: 94,
      qualityRating: 4.8,
      totalOrders: 156,
      monthlyVolume: 45600,
      preferredSupplier: true,
      contact: {
        name: 'Sarah Johnson',
        email: 'sarah@coffeemasters.com',
        phone: '+1-555-0123'
      },
      leadTimeHistory: [
        { month: 'Jan', actual: 2.1, promised: 2.5, performance: 'excellent' },
        { month: 'Feb', actual: 2.4, promised: 2.5, performance: 'excellent' },
        { month: 'Mar', actual: 2.8, promised: 2.5, performance: 'good' },
        { month: 'Apr', actual: 2.2, promised: 2.5, performance: 'excellent' },
        { month: 'May', actual: 2.6, promised: 2.5, performance: 'good' },
        { month: 'Jun', actual: 2.1, promised: 2.5, performance: 'excellent' }
      ]
    },
    {
      id: 'supplier-2', 
      name: 'Fresh Dairy Co.',
      category: 'Dairy Products',
      status: 'good',
      reliabilityScore: 89,
      averageLeadTime: 1.2,
      onTimeDelivery: 87,
      qualityRating: 4.6,
      totalOrders: 289,
      monthlyVolume: 78900,
      preferredSupplier: true,
      contact: {
        name: 'Mike Thompson',
        email: 'mike@freshdairy.com', 
        phone: '+1-555-0234'
      },
      leadTimeHistory: [
        { month: 'Jan', actual: 1.1, promised: 1.0, performance: 'good' },
        { month: 'Feb', actual: 1.3, promised: 1.0, performance: 'warning' },
        { month: 'Mar', actual: 0.9, promised: 1.0, performance: 'excellent' },
        { month: 'Apr', actual: 1.4, promised: 1.0, performance: 'warning' },
        { month: 'May', actual: 1.0, promised: 1.0, performance: 'excellent' },
        { month: 'Jun', actual: 1.2, promised: 1.0, performance: 'good' }
      ]
    },
    {
      id: 'supplier-3',
      name: 'Tech Supplies Ltd.',
      category: 'Electronics',
      status: 'warning',
      reliabilityScore: 76,
      averageLeadTime: 5.8,
      onTimeDelivery: 71,
      qualityRating: 4.2,
      totalOrders: 89,
      monthlyVolume: 123400,
      preferredSupplier: false,
      contact: {
        name: 'Alex Chen',
        email: 'alex@techsupplies.com',
        phone: '+1-555-0345'
      },
      leadTimeHistory: [
        { month: 'Jan', actual: 7.2, promised: 5.0, performance: 'critical' },
        { month: 'Feb', actual: 5.8, promised: 5.0, performance: 'warning' },
        { month: 'Mar', actual: 4.9, promised: 5.0, performance: 'good' },
        { month: 'Apr', actual: 6.3, promised: 5.0, performance: 'warning' },
        { month: 'May', actual: 5.1, promised: 5.0, performance: 'good' },
        { month: 'Jun', actual: 4.8, promised: 5.0, performance: 'excellent' }
      ]
    },
    {
      id: 'supplier-4',
      name: 'Local Bakery',
      category: 'Bakery Products',
      status: 'excellent',
      reliabilityScore: 98,
      averageLeadTime: 0.5,
      onTimeDelivery: 97,
      qualityRating: 4.9,
      totalOrders: 412,
      monthlyVolume: 23100,
      preferredSupplier: true,
      contact: {
        name: 'Maria Rodriguez',
        email: 'maria@localbakery.com',
        phone: '+1-555-0456'
      },
      leadTimeHistory: [
        { month: 'Jan', actual: 0.4, promised: 0.5, performance: 'excellent' },
        { month: 'Feb', actual: 0.6, promised: 0.5, performance: 'good' },
        { month: 'Mar', actual: 0.3, promised: 0.5, performance: 'excellent' },
        { month: 'Apr', actual: 0.5, promised: 0.5, performance: 'excellent' },
        { month: 'May', actual: 0.7, promised: 0.5, performance: 'warning' },
        { month: 'Jun', actual: 0.4, promised: 0.5, performance: 'excellent' }
      ]
    },
    {
      id: 'supplier-5',
      name: 'Nutrition Plus',
      category: 'Health Food',
      status: 'critical',
      reliabilityScore: 64,
      averageLeadTime: 8.9,
      onTimeDelivery: 58,
      qualityRating: 3.9,
      totalOrders: 67,
      monthlyVolume: 34500,
      preferredSupplier: false,
      contact: {
        name: 'David Wilson',
        email: 'david@nutritionplus.com',
        phone: '+1-555-0567'
      },
      leadTimeHistory: [
        { month: 'Jan', actual: 12.1, promised: 7.0, performance: 'critical' },
        { month: 'Feb', actual: 8.9, promised: 7.0, performance: 'warning' },
        { month: 'Mar', actual: 7.8, promised: 7.0, performance: 'warning' },
        { month: 'Apr', actual: 9.2, promised: 7.0, performance: 'critical' },
        { month: 'May', actual: 6.8, promised: 7.0, performance: 'good' },
        { month: 'Jun', actual: 8.1, promised: 7.0, performance: 'warning' }
      ]
    }
  ], []);

  // Real-time supplier availability updates
  useEffect(() => {
    // Initialize real-time suppliers with mock data
    setRealTimeSuppliers(suppliers.length > 0 ? suppliers : mockSuppliers);
  }, [suppliers, mockSuppliers]);

  // Real-time inventory updates affecting supplier availability
  useEffect(() => {
    if (inventoryUpdates && Object.keys(inventoryUpdates).length > 0) {
      setRealTimeSuppliers(prev => {
        const updated = [...prev];
        Object.entries(inventoryUpdates).forEach(([itemId, inventoryData]) => {
          // Find suppliers that provide this item and update their availability
          updated.forEach((supplier, index) => {
            if (supplier.products && supplier.products.includes(itemId)) {
              const stockLevel = inventoryData.currentStock || inventoryData.stockLevel;
              const isLowStock = stockLevel < 10;
              const isOutOfStock = stockLevel === 0;
              
              // Update supplier availability based on inventory levels
              updated[index] = {
                ...supplier,
                availabilityStatus: isOutOfStock ? 'out_of_stock' : isLowStock ? 'low_stock' : 'available',
                lastInventoryUpdate: new Date().toISOString(),
                inventoryAdjusted: true,
                affectedItems: supplier.affectedItems ? [...supplier.affectedItems, itemId] : [itemId],
                stockLevels: {
                  ...supplier.stockLevels,
                  [itemId]: stockLevel
                }
              };
            }
          });
        });
        setLastUpdated(new Date());
        return updated;
      });

      // Generate availability alerts
      Object.entries(inventoryUpdates).forEach(([itemId, inventoryData]) => {
        const stockLevel = inventoryData.currentStock || inventoryData.stockLevel;
        if (stockLevel < 5) {
          setSupplierAlerts(prev => [...prev, {
            id: `stock-alert-${itemId}-${Date.now()}`,
            type: 'low_stock',
            message: `Critical: Item ${itemId} has only ${stockLevel} units remaining`,
            itemId,
            stockLevel,
            severity: stockLevel === 0 ? 'critical' : 'high',
            timestamp: new Date().toISOString(),
            requiresSupplierAction: true
          }].slice(-20)); // Keep last 20 alerts
        }
      });
    }
  }, [inventoryUpdates]);

  // Real-time reorder calculations affecting supplier priorities
  useEffect(() => {
    if (reorderCalculations && reorderCalculations.length > 0) {
      setRealTimeSuppliers(prev => {
        const updated = [...prev];
        reorderCalculations.forEach(calc => {
          // Update supplier priorities based on reorder calculations
          updated.forEach((supplier, index) => {
            if (supplier.products && supplier.products.includes(calc.itemId)) {
              const urgency = calc.urgency || 'medium';
              const orderQuantity = calc.optimalOrderQuantity || 0;
              
              updated[index] = {
                ...supplier,
                reorderCalculations: {
                  ...supplier.reorderCalculations,
                  [calc.itemId]: calc
                },
                priorityLevel: urgency === 'critical' ? 'urgent' : 
                             urgency === 'high' ? 'high' : 'normal',
                lastReorderUpdate: new Date().toISOString(),
                reorderAdjusted: true,
                pendingOrderValue: (supplier.pendingOrderValue || 0) + (orderQuantity * (calc.unitCost || 0))
              };
            }
          });
        });
        setLastUpdated(new Date());
        return updated;
      });

      // Generate reorder alerts for suppliers
      reorderCalculations.forEach(calc => {
        if (calc.urgency === 'critical' || calc.urgency === 'high') {
          setSupplierAlerts(prev => [...prev, {
            id: `reorder-alert-${calc.itemId}-${Date.now()}`,
            type: 'reorder_required',
            message: `${calc.urgency.toUpperCase()}: Reorder ${calc.optimalOrderQuantity} units of ${calc.itemId}`,
            itemId: calc.itemId,
            urgency: calc.urgency,
            orderQuantity: calc.optimalOrderQuantity,
            estimatedCost: calc.optimalOrderQuantity * (calc.unitCost || 0),
            severity: calc.urgency,
            timestamp: new Date().toISOString(),
            requiresSupplierAction: true
          }].slice(-20));
        }
      });
    }
  }, [reorderCalculations]);

  // Real-time supplier performance monitoring
  useEffect(() => {
    const performanceMonitor = setInterval(() => {
      setRealTimeSuppliers(prev => {
        return prev.map(supplier => {
          // Simulate real-time performance updates
          const performanceVariation = (Math.random() - 0.5) * 5; // ±2.5% variation
          const leadTimeVariation = (Math.random() - 0.5) * 0.5; // ±0.25 day variation
          const reliabilityVariation = (Math.random() - 0.5) * 2; // ±1% variation

          const newReliabilityScore = Math.max(0, Math.min(100, 
            supplier.reliabilityScore + reliabilityVariation));
          const newAverageLeadTime = Math.max(0.1, 
            supplier.averageLeadTime + leadTimeVariation);
          const newOnTimeDelivery = Math.max(0, Math.min(100, 
            supplier.onTimeDelivery + performanceVariation));

          // Update status based on performance metrics
          let newStatus = supplier.status;
          if (newReliabilityScore >= 95 && newOnTimeDelivery >= 90) {
            newStatus = 'excellent';
          } else if (newReliabilityScore >= 85 && newOnTimeDelivery >= 80) {
            newStatus = 'good';
          } else if (newReliabilityScore >= 70 && newOnTimeDelivery >= 65) {
            newStatus = 'warning';
          } else {
            newStatus = 'critical';
          }

          return {
            ...supplier,
            reliabilityScore: Math.round(newReliabilityScore),
            averageLeadTime: Math.round(newAverageLeadTime * 10) / 10,
            onTimeDelivery: Math.round(newOnTimeDelivery),
            status: newStatus,
            lastPerformanceUpdate: new Date().toISOString(),
            performanceAdjusted: true
          };
        });
      });
      setLastUpdated(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(performanceMonitor);
  }, []);

  // Real-time availability updates simulation
  useEffect(() => {
    const availabilityMonitor = setInterval(() => {
      setAvailabilityUpdates(prev => {
        const updates = {};
        realTimeSuppliers.forEach(supplier => {
          // Simulate availability changes
          const availabilityChange = Math.random();
          let availability = 'available';
          
          if (availabilityChange < 0.05) { // 5% chance of being out of stock
            availability = 'out_of_stock';
          } else if (availabilityChange < 0.15) { // 10% chance of limited stock
            availability = 'limited_stock';
          } else if (availabilityChange < 0.25) { // 10% chance of delayed delivery
            availability = 'delayed_delivery';
          }

          updates[supplier.id] = {
            availability,
            timestamp: new Date().toISOString(),
            estimatedRestockTime: availability === 'out_of_stock' ? 
              Math.floor(Math.random() * 14) + 1 : null, // 1-14 days
            stockPercentage: availability === 'limited_stock' ? 
              Math.floor(Math.random() * 30) + 20 : 100 // 20-50% for limited stock
          };
        });
        return updates;
      });
    }, 60000); // Update every minute

    return () => clearInterval(availabilityMonitor);
  }, [realTimeSuppliers]);

  const processedSuppliers = realTimeSuppliers;

  // Calculate overview metrics
  const overviewMetrics = useMemo(() => {
    const total = processedSuppliers.length;
    const excellent = processedSuppliers.filter(s => s.status === 'excellent').length;
    const avgReliability = processedSuppliers.reduce((sum, s) => sum + s.reliabilityScore, 0) / total;
    const avgLeadTime = processedSuppliers.reduce((sum, s) => sum + s.averageLeadTime, 0) / total;
    const preferred = processedSuppliers.filter(s => s.preferredSupplier).length;
    
    return {
      totalSuppliers: total,
      excellentSuppliers: excellent,
      avgReliability: Math.round(avgReliability),
      avgLeadTime: avgLeadTime.toFixed(1),
      preferredSuppliers: preferred
    };
  }, [processedSuppliers]);

  // Filter suppliers by status for different tabs
  const suppliersByStatus = useMemo(() => {
    return {
      all: processedSuppliers,
      excellent: processedSuppliers.filter(s => s.status === 'excellent'),
      warning: processedSuppliers.filter(s => s.status === 'warning' || s.status === 'critical'),
      preferred: processedSuppliers.filter(s => s.preferredSupplier)
    };
  }, [processedSuppliers]);

  const handleSupplierClick = (supplier) => {
    setSelectedSupplier(supplier);
    onSupplierSelect(supplier);
  };

  const handleContactSupplier = (supplier) => {
    onContactSupplier(supplier);
  };

  const handleCreateOrder = (supplier) => {
    onCreateOrder(supplier);
  };

  const getStatusLabel = (status) => {
    const labels = {
      excellent: 'Excellent',
      good: 'Good', 
      warning: 'Needs Attention',
      critical: 'Critical Issues'
    };
    return labels[status] || 'Unknown';
  };

  const tabs = [
    { id: 'overview', label: 'All Suppliers', icon: 'grid', count: suppliersByStatus.all.length },
    { id: 'preferred', label: 'Preferred', icon: 'star', count: suppliersByStatus.preferred.length },
    { id: 'excellent', label: 'Top Performers', icon: 'trending-up', count: suppliersByStatus.excellent.length },
    { id: 'issues', label: 'Need Attention', icon: 'alert-triangle', count: suppliersByStatus.warning.length },
    { id: 'leadtime', label: 'Lead Time Analysis', icon: 'clock', count: 0 }
  ];

  // Auto refresh
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const renderSupplierGrid = (suppliersToShow) => (
    <SupplierGrid>
      {suppliersToShow.map((supplier, index) => (
        <SupplierCard
          key={supplier.id}
          status={supplier.status}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => handleSupplierClick(supplier)}
        >
          <SupplierHeader>
            <SupplierInfo>
              <SupplierName variant="h6">
                {supplier.name}
                {supplier.preferredSupplier && (
                  <Icon name="star" size={16} style={{ marginLeft: '8px', color: '#f59e0b' }} />
                )}
              </SupplierName>
              <SupplierCategory variant="body2">
                {supplier.category}
              </SupplierCategory>
            </SupplierInfo>
            <SupplierStatus status={supplier.status} size="sm">
              {getStatusLabel(supplier.status)}
            </SupplierStatus>
          </SupplierHeader>

          <SupplierMetrics>
            <MetricItem>
              <MetricNumber status={supplier.reliabilityScore > 90 ? 'excellent' : supplier.reliabilityScore > 80 ? 'good' : 'warning'}>
                {supplier.reliabilityScore}%
              </MetricNumber>
              <MetricDescription>Reliability</MetricDescription>
            </MetricItem>
            
            <MetricItem>
              <MetricNumber status={supplier.averageLeadTime < 2 ? 'excellent' : supplier.averageLeadTime < 5 ? 'good' : 'warning'}>
                {supplier.averageLeadTime}d
              </MetricNumber>
              <MetricDescription>Avg Lead Time</MetricDescription>
            </MetricItem>
            
            <MetricItem>
              <MetricNumber status={supplier.onTimeDelivery > 90 ? 'excellent' : supplier.onTimeDelivery > 80 ? 'good' : 'warning'}>
                {supplier.onTimeDelivery}%
              </MetricNumber>
              <MetricDescription>On-Time</MetricDescription>
            </MetricItem>
            
            <MetricItem>
              <MetricNumber status={supplier.qualityRating > 4.5 ? 'excellent' : supplier.qualityRating > 4 ? 'good' : 'warning'}>
                {supplier.qualityRating}/5
              </MetricNumber>
              <MetricDescription>Quality</MetricDescription>
            </MetricItem>
          </SupplierMetrics>

          {/* Real-time availability indicator */}
          {availabilityUpdates[supplier.id] && (
            <RealTimeIndicator $isActive={true}>
              <StatusDot $isActive={true} />
              <div>
                <StatusText $isActive={true}>
                  <AvailabilityBadge $availability={availabilityUpdates[supplier.id].availability}>
                    {availabilityUpdates[supplier.id].availability.replace('_', ' ').toUpperCase()}
                  </AvailabilityBadge>
                </StatusText>
                {availabilityUpdates[supplier.id].stockPercentage < 100 && (
                  <UpdateTimestamp>
                    Stock: {availabilityUpdates[supplier.id].stockPercentage}% available
                  </UpdateTimestamp>
                )}
                {availabilityUpdates[supplier.id].estimatedRestockTime && (
                  <UpdateTimestamp>
                    Restock in: {availabilityUpdates[supplier.id].estimatedRestockTime} days
                  </UpdateTimestamp>
                )}
              </div>
            </RealTimeIndicator>
          )}

          {/* Real-time performance updates indicator */}
          {(supplier.performanceAdjusted || supplier.inventoryAdjusted || supplier.reorderAdjusted) && (
            <RealTimeIndicator $isActive={true}>
              <StatusDot $isActive={true} />
              <div>
                <StatusText $isActive={true}>
                  Live Updates Active
                </StatusText>
                <UpdateTimestamp>
                  Last updated: {new Date(
                    supplier.lastPerformanceUpdate ||
                    supplier.lastInventoryUpdate ||
                    supplier.lastReorderUpdate ||
                    new Date()
                  ).toLocaleTimeString()}
                </UpdateTimestamp>
              </div>
            </RealTimeIndicator>
          )}

          {/* Priority level indicator for urgent reorders */}
          {supplier.priorityLevel === 'urgent' && (
            <RealTimeIndicator $isActive={true}>
              <StatusDot $isActive={true} />
              <div>
                <StatusText $isActive={true}>
                  🚨 URGENT: Critical reorder required
                </StatusText>
                {supplier.pendingOrderValue && (
                  <UpdateTimestamp>
                    Pending order value: ${supplier.pendingOrderValue.toLocaleString()}
                  </UpdateTimestamp>
                )}
              </div>
            </RealTimeIndicator>
          )}

          <SupplierActions>
            <ActionButton 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleContactSupplier(supplier);
              }}
            >
              <Icon name="message-circle" size={14} />
              Contact
            </ActionButton>
            <ActionButton 
              variant={supplier.priorityLevel === 'urgent' ? 'danger' : 'primary'}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleCreateOrder(supplier);
              }}
            >
              <Icon name="plus" size={14} />
              {supplier.priorityLevel === 'urgent' ? 'URGENT Order' : 'Order'}
            </ActionButton>
          </SupplierActions>
        </SupplierCard>
      ))}
    </SupplierGrid>
  );

  const renderLeadTimeAnalysis = () => (
    <LeadTimeTracker>
      {processedSuppliers.map((supplier) => (
        <LeadTimeCard
          key={supplier.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <LeadTimeHeader>
            <div>
              <Typography variant="h6" weight="semibold">
                {supplier.name}
              </Typography>
              <Typography variant="body2" color="secondary">
                {supplier.category} • Avg: {supplier.averageLeadTime} days
              </Typography>
            </div>
            <SupplierStatus status={supplier.status} size="sm">
              {getStatusLabel(supplier.status)}
            </SupplierStatus>
          </LeadTimeHeader>
          
          <LeadTimeChart>
            {supplier.leadTimeHistory.map((entry, index) => (
              <LeadTimeBar
                key={entry.month}
                performance={entry.performance}
                initial={{ height: 0 }}
                animate={{ height: `${(entry.actual / 15) * 100}%` }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                data-tooltip={`${entry.month}: ${entry.actual}d (promised: ${entry.promised}d)`}
              />
            ))}
          </LeadTimeChart>
        </LeadTimeCard>
      ))}
    </LeadTimeTracker>
  );

  return (
    <IntegrationContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <IntegrationHeader>
        <HeaderInfo>
          <SupplierIcon
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <Icon name="truck" size={20} />
          </SupplierIcon>
          <div>
            <Typography variant="h3" weight="bold">
              Supplier Integration Hub
            </Typography>
            <Typography variant="body2" color="secondary" style={{ marginTop: '4px' }}>
              Manage suppliers, track lead times, and optimize procurement
            </Typography>
          </div>
        </HeaderInfo>
        
        <HeaderActions>
          <Typography variant="caption" color="tertiary">
            Updated: {lastUpdated.toLocaleTimeString()}
          </Typography>
          
          <Button variant="secondary" size="sm">
            <Icon name="plus" size={16} />
            Add Supplier
          </Button>
        </HeaderActions>
      </IntegrationHeader>

      {/* Real-time connection status */}
      <ConnectionStatus $connected={isConnected}>
        <StatusDot $isActive={isConnected} />
        {isConnected ? 'Real-time updates active' : 'Real-time updates disconnected'}
      </ConnectionStatus>

      {/* Supplier alerts panel */}
      {supplierAlerts.length > 0 && (
        <AlertsPanel
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Typography variant="h6" weight="semibold" style={{ marginBottom: '1rem' }}>
            <Icon name="alert-circle" size={18} style={{ marginRight: '0.5rem' }} />
            Supplier Alerts ({supplierAlerts.length})
          </Typography>
          
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            <AnimatePresence>
              {supplierAlerts.slice(0, 10).map((alert) => (
                <AlertItem
                  key={alert.id}
                  $severity={alert.severity}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Icon 
                    name={alert.type === 'low_stock' ? 'package' : 'shopping-cart'} 
                    size={16}
                    style={{ 
                      color: alert.severity === 'critical' ? '#ef4444' : 
                             alert.severity === 'high' ? '#f59e0b' : '#3b82f6' 
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <Typography variant="body2" weight="medium">
                      {alert.message}
                    </Typography>
                    <Typography variant="caption" color="secondary">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </Typography>
                  </div>
                  {alert.estimatedCost && (
                    <Typography variant="body2" weight="semibold" color="primary">
                      ${alert.estimatedCost.toLocaleString()}
                    </Typography>
                  )}
                </AlertItem>
              ))}
            </AnimatePresence>
          </div>
        </AlertsPanel>
      )}

      <MetricsOverview>
        <MetricCard
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <MetricValue>{overviewMetrics.totalSuppliers}</MetricValue>
          <MetricLabel>Total Suppliers</MetricLabel>
        </MetricCard>
        
        <MetricCard
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <MetricValue status="excellent">{overviewMetrics.excellentSuppliers}</MetricValue>
          <MetricLabel>Top Performers</MetricLabel>
        </MetricCard>
        
        <MetricCard
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <MetricValue status="good">{overviewMetrics.avgReliability}%</MetricValue>
          <MetricLabel>Avg Reliability</MetricLabel>
        </MetricCard>
        
        <MetricCard
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <MetricValue status="good">{overviewMetrics.avgLeadTime}d</MetricValue>
          <MetricLabel>Avg Lead Time</MetricLabel>
        </MetricCard>
        
        <MetricCard
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <MetricValue status="excellent">{overviewMetrics.preferredSuppliers}</MetricValue>
          <MetricLabel>Preferred Partners</MetricLabel>
        </MetricCard>
      </MetricsOverview>

      <TabNavigation>
        {tabs.map(tab => (
          <TabButton
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            whileTap={{ scale: 0.98 }}
          >
            <Icon name={tab.icon} size={16} />
            {tab.label}
            {tab.count > 0 && (
              <Badge variant="secondary" size="sm">
                {tab.count}
              </Badge>
            )}
          </TabButton>
        ))}
      </TabNavigation>

      <TabContent>
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {renderSupplierGrid(suppliersByStatus.all)}
            </motion.div>
          )}
          
          {activeTab === 'preferred' && (
            <motion.div
              key="preferred"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {renderSupplierGrid(suppliersByStatus.preferred)}
            </motion.div>
          )}
          
          {activeTab === 'excellent' && (
            <motion.div
              key="excellent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {renderSupplierGrid(suppliersByStatus.excellent)}
            </motion.div>
          )}
          
          {activeTab === 'issues' && (
            <motion.div
              key="issues"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {renderSupplierGrid(suppliersByStatus.warning)}
            </motion.div>
          )}
          
          {activeTab === 'leadtime' && (
            <motion.div
              key="leadtime"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {renderLeadTimeAnalysis()}
            </motion.div>
          )}
        </AnimatePresence>
      </TabContent>
    </IntegrationContainer>
  );
};

export default SupplierIntegrationHub;