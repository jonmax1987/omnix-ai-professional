/**
 * OMNIX AI - Real-Time Inventory Dashboard
 * AI-powered stock level monitoring with predictive analytics
 */

import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import realTimeInventoryService from '../../services/realTimeInventoryService';
import useCustomerBehaviorStore from '../../store/customerBehaviorStore';
import useWebSocketStore from '../../store/websocketStore';

const DashboardContainer = styled.div`
  padding: 24px;
  background: ${props => props.theme.colors.background};
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 100%;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const InventoryIcon = styled(motion.div)`
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const StatCard = styled(motion.div)`
  padding: 24px;
  background: ${props => props.theme.colors.card};
  border-radius: 12px;
  border-left: 4px solid ${props => 
    props.type === 'critical' ? '#ef4444' :
    props.type === 'low' ? '#f97316' :
    props.type === 'normal' ? '#10b981' :
    props.type === 'high' ? '#3b82f6' :
    '#6b7280'
  };
  position: relative;
  overflow: hidden;
`;

const StatValue = styled.div`
  font-size: 36px;
  font-weight: 800;
  color: ${props => 
    props.type === 'critical' ? '#ef4444' :
    props.type === 'low' ? '#f97316' :
    props.type === 'normal' ? '#10b981' :
    props.type === 'high' ? '#3b82f6' :
    props.theme.colors.text.primary
  };
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 500;
  margin-bottom: 8px;
`;

const StatTrend = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${props => 
    props.trend === 'up' ? '#10b981' :
    props.trend === 'down' ? '#ef4444' :
    '#6b7280'
  };
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StockIndicator = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    ${props => 
      props.level >= 80 ? '#10b981' :
      props.level >= 50 ? '#fbbf24' :
      '#ef4444'
    } 0deg,
    ${props => 
      props.level >= 80 ? '#10b981' :
      props.level >= 50 ? '#fbbf24' :
      '#ef4444'
    } ${props => props.level * 3.6}deg,
    #e5e7eb ${props => props.level * 3.6}deg
  );
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: white;
  
  &::before {
    content: '';
    position: absolute;
    width: 36px;
    height: 36px;
    background: ${props => props.theme.colors.card};
    border-radius: 50%;
  }
  
  span {
    position: relative;
    z-index: 1;
    color: ${props => props.theme.colors.text.primary};
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SideSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Card = styled.div`
  background: ${props => props.theme.colors.card};
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const FilterTab = styled(motion.button)`
  padding: 8px 16px;
  border: 2px solid ${props => props.active ? '#8b5cf6' : props.theme.colors.border};
  background: ${props => props.active ? '#8b5cf6' : 'transparent'};
  color: ${props => props.active ? 'white' : props.theme.colors.text.primary};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;

  &:hover {
    border-color: #8b5cf6;
  }
`;

const InventoryList = styled.div`
  max-height: 500px;
  overflow-y: auto;
`;

const InventoryCard = styled(motion.div)`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  border-left: 4px solid ${props => 
    props.riskLevel === 'critical' ? '#ef4444' :
    props.riskLevel === 'high' ? '#f97316' :
    props.riskLevel === 'medium' ? '#fbbf24' :
    props.riskLevel === 'low' ? '#34d399' :
    '#10b981'
  };

  &:last-child {
    margin-bottom: 0;
  }
`;

const ItemInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const ItemName = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  font-size: 16px;
`;

const ItemId = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
`;

const StockInfo = styled.div`
  text-align: right;
`;

const CurrentStock = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${props => 
    props.stock <= props.critical ? '#ef4444' :
    props.stock <= props.low ? '#f97316' :
    '#10b981'
  };
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StockLevel = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: capitalize;
`;

const MetricsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
`;

const MetricItem = styled.div`
  text-align: center;
  padding: 8px;
  background: ${props => props.theme.colors.background};
  border-radius: 6px;
`;

const MetricValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const MetricLabel = styled.div`
  font-size: 10px;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
`;

const PredictionsList = styled.div`
  margin: 12px 0;
`;

const PredictionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  background: ${props => 
    props.probability > 0.7 ? '#fef2f2' :
    props.probability > 0.3 ? '#fffbeb' :
    '#f0fdf4'
  };
  border: 1px solid ${props => 
    props.probability > 0.7 ? '#fecaca' :
    props.probability > 0.3 ? '#fed7aa' :
    '#bbf7d0'
  };
  border-radius: 4px;
  margin-bottom: 4px;
  font-size: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const AlertsList = styled.div`
  margin: 12px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const AlertChip = styled.div`
  padding: 4px 8px;
  background: ${props => 
    props.priority === 'critical' ? '#ef4444' :
    props.priority === 'high' ? '#f97316' :
    props.priority === 'medium' ? '#fbbf24' :
    '#10b981'
  };
  color: white;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
`;

const RecommendationList = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
`;

const RecommendationButton = styled(motion.button)`
  padding: 6px 12px;
  background: #8b5cf6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  text-transform: capitalize;

  &:hover {
    background: #7c3aed;
  }
`;

const AlertList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const AlertCard = styled(motion.div)`
  background: ${props => 
    props.priority === 'critical' ? '#fef2f2' :
    props.priority === 'high' ? '#fffbeb' :
    props.priority === 'medium' ? '#fefce8' :
    '#f0fdf4'
  };
  border: 1px solid ${props => 
    props.priority === 'critical' ? '#fecaca' :
    props.priority === 'high' ? '#fed7aa' :
    props.priority === 'medium' ? '#fef3c7' :
    '#bbf7d0'
  };
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const AlertHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const AlertType = styled.div`
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: ${props => 
    props.priority === 'critical' ? '#ef4444' :
    props.priority === 'high' ? '#f59e0b' :
    props.priority === 'medium' ? '#d97706' :
    '#10b981'
  };
`;

const AlertTime = styled.div`
  font-size: 11px;
  color: ${props => props.theme.colors.text.secondary};
`;

const AlertMessage = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 12px;
  line-height: 1.4;
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
`;

const ActivityCard = styled(motion.div)`
  padding: 16px;
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  border-left: 4px solid ${props => 
    props.type === 'sale' ? '#ef4444' :
    props.type === 'delivery' ? '#10b981' :
    props.type === 'adjustment' ? '#3b82f6' :
    '#6b7280'
  };
`;

const ActivityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ActivityType = styled.div`
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: ${props => props.theme.colors.text.secondary};
`;

const ActivityChange = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${props => 
    props.change > 0 ? '#10b981' :
    props.change < 0 ? '#ef4444' :
    props.theme.colors.text.primary
  };
`;

const ActivityDetails = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.text.primary};
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: ${props => props.theme.colors.text.secondary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: ${props => props.theme.colors.text.secondary};
`;

const RealTimeInventoryDashboard = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [inventoryData, setInventoryData] = useState([]);
  const [dashboardData, setDashboardData] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { 
    inventoryUpdates = new Map(), 
    inventoryAlerts = [],
    stockMovements = [] 
  } = useCustomerBehaviorStore();
  
  const { isConnected } = useWebSocketStore();

  // Sample item IDs for demo
  const sampleItemIds = [
    'ITEM001', 'ITEM002', 'ITEM003', 'ITEM004', 'ITEM005',
    'ITEM006', 'ITEM007', 'ITEM008', 'ITEM009', 'ITEM010'
  ];

  useEffect(() => {
    const loadInventoryData = async () => {
      setLoading(true);
      try {
        // Initialize some sample data
        sampleItemIds.forEach(itemId => {
          realTimeInventoryService.updateInventoryItem(itemId, 0, { initialization: true });
        });

        // Get dashboard data
        const dashboard = realTimeInventoryService.getDashboardData();
        setDashboardData(dashboard);
        
        // Get detailed inventory data
        const batchResult = realTimeInventoryService.batchMonitorInventory(sampleItemIds);
        setInventoryData(batchResult.results.map(r => ({ ...r.item, alerts: r.alerts, recommendations: r.recommendations })));
      } catch (error) {
        console.error('Error loading inventory data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInventoryData();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!refreshing && isConnected) {
        setRefreshing(true);
        try {
          // Simulate some stock changes
          const randomItem = sampleItemIds[Math.floor(Math.random() * sampleItemIds.length)];
          const stockChange = Math.floor(Math.random() * 10) - 5; // -5 to +5
          
          realTimeInventoryService.updateInventoryItem(randomItem, stockChange, { 
            transactionType: stockChange > 0 ? 'delivery' : 'sale',
            realTimeUpdate: true 
          });

          // Refresh dashboard data
          const dashboard = realTimeInventoryService.getDashboardData();
          setDashboardData(dashboard);
          
          const batchResult = realTimeInventoryService.batchMonitorInventory(sampleItemIds);
          setInventoryData(batchResult.results.map(r => ({ ...r.item, alerts: r.alerts, recommendations: r.recommendations })));
        } catch (error) {
          console.error('Error refreshing inventory data:', error);
        } finally {
          setRefreshing(false);
        }
      }
    }, 15000); // Refresh every 15 seconds

    return () => clearInterval(interval);
  }, [refreshing, isConnected]);

  const filteredInventory = useMemo(() => {
    if (activeFilter === 'all') return inventoryData;
    if (activeFilter === 'critical') return inventoryData.filter(item => item.riskLevel === 'critical');
    if (activeFilter === 'low_stock') return inventoryData.filter(item => item.currentStock <= (item.lowThreshold || 20));
    if (activeFilter === 'fast_moving') return inventoryData.filter(item => realTimeInventoryService.calculateTurnoverRate(item) > 0.5);
    return inventoryData;
  }, [inventoryData, activeFilter]);

  const handleRecommendationClick = (itemId, recommendation) => {
    console.log(`Executing recommendation: ${recommendation.type} for item ${itemId}`);
  };

  if (loading) {
    return (
      <DashboardContainer>
        <LoadingState>Loading real-time inventory data...</LoadingState>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Title>
            <InventoryIcon
              animate={{ rotate: refreshing ? 360 : 0 }}
              transition={{ duration: 1, ease: "linear" }}
            >
              📦
            </InventoryIcon>
            Real-Time Inventory
          </Title>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          color: isConnected ? '#10b981' : '#ef4444'
        }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: isConnected ? '#10b981' : '#ef4444' 
          }} />
          {isConnected ? 'Live' : 'Offline'}
          {refreshing && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{ fontSize: '14px' }}
            >
              ⟳
            </motion.div>
          )}
        </div>
      </Header>

      <StatsGrid>
        <StatCard
          type="normal"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatValue type="normal">
            {dashboardData.overview?.totalItems || inventoryData.length}
          </StatValue>
          <StatLabel>Total Items</StatLabel>
          <StatTrend trend="stable">
            📊 Monitoring Active
          </StatTrend>
          <StockIndicator level={85}>
            <span>85%</span>
          </StockIndicator>
        </StatCard>

        <StatCard
          type="critical"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatValue type="critical">
            {dashboardData.overview?.criticalItems || inventoryData.filter(i => i.riskLevel === 'critical').length}
          </StatValue>
          <StatLabel>Critical Items</StatLabel>
          <StatTrend trend="down">
            ⚠ Need Immediate Action
          </StatTrend>
        </StatCard>

        <StatCard
          type="low"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatValue type="low">
            {dashboardData.overview?.lowStockItems || inventoryData.filter(i => i.currentStock <= 20).length}
          </StatValue>
          <StatLabel>Low Stock Items</StatLabel>
          <StatTrend trend="up">
            📈 Reorder Required
          </StatTrend>
        </StatCard>

        <StatCard
          type="high"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <StatValue type="high">
            {dashboardData.overview?.activeAlerts || inventoryAlerts.length}
          </StatValue>
          <StatLabel>Active Alerts</StatLabel>
          <StatTrend trend="stable">
            🔔 Real-time Monitoring
          </StatTrend>
        </StatCard>
      </StatsGrid>

      <ContentGrid>
        <MainSection>
          <Card>
            <CardHeader>
              <CardTitle>
                📋 Inventory Items
              </CardTitle>
            </CardHeader>
            
            <FilterTabs>
              {[
                { id: 'all', label: 'All Items' },
                { id: 'critical', label: 'Critical' },
                { id: 'low_stock', label: 'Low Stock' },
                { id: 'fast_moving', label: 'Fast Moving' }
              ].map(filter => (
                <FilterTab
                  key={filter.id}
                  active={activeFilter === filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {filter.label}
                </FilterTab>
              ))}
            </FilterTabs>

            <InventoryList>
              <AnimatePresence mode="popLayout">
                {filteredInventory.map((item, index) => (
                  <InventoryCard
                    key={item.id}
                    riskLevel={item.riskLevel}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.03 }}
                    layout
                  >
                    <ItemInfo>
                      <div>
                        <ItemName>{item.name}</ItemName>
                        <ItemId>ID: {item.id}</ItemId>
                      </div>
                      <StockInfo>
                        <CurrentStock 
                          stock={item.currentStock} 
                          critical={item.criticalThreshold}
                          low={item.lowThreshold}
                        >
                          {item.currentStock}
                          {item.riskLevel === 'critical' && ' ⚠️'}
                        </CurrentStock>
                        <StockLevel>{item.riskLevel || 'normal'} risk</StockLevel>
                      </StockInfo>
                    </ItemInfo>

                    <MetricsRow>
                      <MetricItem>
                        <MetricValue>{realTimeInventoryService.calculateDaysToStockout(item)}</MetricValue>
                        <MetricLabel>Days to Out</MetricLabel>
                      </MetricItem>
                      <MetricItem>
                        <MetricValue>{Math.round(realTimeInventoryService.calculateTurnoverRate(item) * 100)}%</MetricValue>
                        <MetricLabel>Turnover</MetricLabel>
                      </MetricItem>
                      <MetricItem>
                        <MetricValue>${(item.currentStock * item.unitCost).toFixed(0)}</MetricValue>
                        <MetricLabel>Value</MetricLabel>
                      </MetricItem>
                      <MetricItem>
                        <MetricValue>{Math.round((item.confidence || 0.8) * 100)}%</MetricValue>
                        <MetricLabel>Confidence</MetricLabel>
                      </MetricItem>
                    </MetricsRow>

                    {item.predictions && (
                      <PredictionsList>
                        {item.predictions.slice(0, 2).map((pred, idx) => (
                          <PredictionItem key={idx} probability={pred.stockoutProbability}>
                            <span>{pred.days} days: {pred.projectedStock} units</span>
                            <span>{Math.round(pred.stockoutProbability * 100)}% stockout risk</span>
                          </PredictionItem>
                        ))}
                      </PredictionsList>
                    )}

                    {item.alerts && item.alerts.length > 0 && (
                      <AlertsList>
                        {item.alerts.slice(0, 3).map(alert => (
                          <AlertChip key={alert.id} priority={alert.priority}>
                            {alert.ruleId.replace('_', ' ')}
                          </AlertChip>
                        ))}
                      </AlertsList>
                    )}

                    {item.recommendations && (
                      <RecommendationList>
                        {item.recommendations.slice(0, 3).map((rec, idx) => (
                          <RecommendationButton
                            key={idx}
                            onClick={() => handleRecommendationClick(item.id, rec)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {rec.type.replace('_', ' ')}
                          </RecommendationButton>
                        ))}
                      </RecommendationList>
                    )}
                  </InventoryCard>
                ))}
              </AnimatePresence>
            </InventoryList>

            {filteredInventory.length === 0 && (
              <EmptyState>
                No items match the selected filter.
              </EmptyState>
            )}
          </Card>
        </MainSection>

        <SideSection>
          <Card>
            <CardHeader>
              <CardTitle>
                🚨 Active Alerts
              </CardTitle>
            </CardHeader>
            
            <AlertList>
              <AnimatePresence>
                {(dashboardData.alerts || inventoryAlerts).slice(0, 8).map(alert => (
                  <AlertCard
                    key={alert.id}
                    priority={alert.priority}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <AlertHeader>
                      <AlertType priority={alert.priority}>
                        {alert.type?.replace('_', ' ') || 'Alert'}
                      </AlertType>
                      <AlertTime>
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </AlertTime>
                    </AlertHeader>
                    
                    <AlertMessage>{alert.message}</AlertMessage>
                  </AlertCard>
                ))}
              </AnimatePresence>
              
              {(dashboardData.alerts || inventoryAlerts).length === 0 && (
                <EmptyState style={{ padding: '20px' }}>
                  No active alerts
                </EmptyState>
              )}
            </AlertList>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                📈 Recent Activity
              </CardTitle>
            </CardHeader>
            
            <ActivityList>
              {stockMovements.slice(0, 6).map((movement, index) => (
                <ActivityCard
                  key={movement.id}
                  type={movement.movementType}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ActivityHeader>
                    <ActivityType>{movement.movementType}</ActivityType>
                    <ActivityChange change={movement.stockChange}>
                      {movement.stockChange > 0 ? '+' : ''}{movement.stockChange}
                    </ActivityChange>
                  </ActivityHeader>
                  
                  <ActivityDetails>
                    Item {movement.itemId} • {new Date(movement.timestamp).toLocaleTimeString()}
                  </ActivityDetails>
                </ActivityCard>
              ))}
              
              {stockMovements.length === 0 && (
                <EmptyState style={{ padding: '20px' }}>
                  No recent activity
                </EmptyState>
              )}
            </ActivityList>
          </Card>
        </SideSection>
      </ContentGrid>
    </DashboardContainer>
  );
};

export default RealTimeInventoryDashboard;