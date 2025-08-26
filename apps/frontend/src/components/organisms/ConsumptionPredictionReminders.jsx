import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Bell, 
  TrendingUp, 
  Calendar, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Brain,
  Target,
  Zap,
  BarChart3,
  Timer,
  RefreshCw,
  Settings,
  Plus,
  X,
  Edit3,
  Lightbulb,
  ShoppingCart,
  Star
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';

const Container = styled(motion.div)`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const Title = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Controls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid ${({ primary, theme }) => primary ? theme.colors.primary : theme.colors.border};
  border-radius: 8px;
  background: ${({ primary, theme }) => primary ? theme.colors.primary : 'white'};
  color: ${({ primary, theme }) => primary ? 'white' : theme.colors.text.secondary};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ primary, theme }) => 
      primary ? theme.colors.primary : theme.colors.gray[50]};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  position: relative;
  overflow: hidden;
`;

const StatIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ color }) => color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  color: white;
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  flex: 1;
  min-height: 0;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PredictionsPanel = styled.div`
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const PanelTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PredictionsList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const PredictionItem = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: white;
  border-radius: 8px;
  margin-bottom: 8px;
  border-left: 4px solid ${({ urgency, theme }) => {
    switch (urgency) {
      case 'high': return theme.colors.error;
      case 'medium': return theme.colors.warning;
      case 'low': return theme.colors.success;
      default: return theme.colors.gray[300];
    }
  }};
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const PredictionInfo = styled.div`
  flex: 1;
`;

const ProductName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;
`;

const PredictionDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 4px;
`;

const ConfidenceBar = styled.div`
  width: 60px;
  height: 4px;
  background: ${({ theme }) => theme.colors.gray[200]};
  border-radius: 2px;
  overflow: hidden;
  margin-top: 4px;
`;

const ConfidenceFill = styled.div`
  height: 100%;
  background: ${({ confidence, theme }) => 
    confidence > 80 ? theme.colors.success : 
    confidence > 60 ? theme.colors.warning : theme.colors.error};
  width: ${({ confidence }) => confidence}%;
  transition: width 0.3s ease;
`;

const PredictionActions = styled.div`
  display: flex;
  gap: 8px;
`;

const MiniButton = styled.button`
  padding: 4px 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  background: white;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ChartSection = styled.div`
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const ChartToggle = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
`;

const ToggleButton = styled.button`
  padding: 4px 8px;
  border: none;
  background: ${({ active, theme }) => active ? theme.colors.primary : 'transparent'};
  color: ${({ active, theme }) => active ? 'white' : theme.colors.text.secondary};
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const ChartContainer = styled.div`
  flex: 1;
  min-height: 200px;
`;

const RemindersPanel = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  width: 300px;
  max-height: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 1000;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const RemindersHeader = styled.div`
  padding: 16px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RemindersTitle = styled.h4`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const RemindersList = styled.div`
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
`;

const ReminderItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 6px;
  margin-bottom: 8px;
  background: ${({ theme }) => theme.colors.gray[50]};
`;

const ReminderIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ type, theme }) => {
    switch (type) {
      case 'urgent': return theme.colors.error;
      case 'reminder': return theme.colors.warning;
      case 'suggestion': return theme.colors.success;
      default: return theme.colors.primary;
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
`;

const ReminderContent = styled.div`
  flex: 1;
`;

const ReminderText = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 2px;
`;

const ReminderTime = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ConsumptionPredictionReminders = () => {
  const [chartType, setChartType] = useState('consumption');
  const [showReminders, setShowReminders] = useState(false);

  const stats = [
    {
      id: 1,
      label: 'Active Predictions',
      value: '24',
      icon: Brain,
      color: '#4f46e5'
    },
    {
      id: 2,
      label: 'Accuracy Rate',
      value: '94%',
      icon: Target,
      color: '#10b981'
    },
    {
      id: 3,
      label: 'Avg Days Ahead',
      value: '3.2',
      icon: Clock,
      color: '#f59e0b'
    },
    {
      id: 4,
      label: 'Reminders Set',
      value: '8',
      icon: Bell,
      color: '#ef4444'
    }
  ];

  const predictions = [
    {
      id: 1,
      product: 'Milk',
      category: 'Dairy',
      prediction: 'Need in 2 days',
      confidence: 94,
      urgency: 'high',
      pattern: 'Every 7 days',
      lastBought: '5 days ago'
    },
    {
      id: 2,
      product: 'Bananas',
      category: 'Fruits',
      prediction: 'Need in 1 day',
      confidence: 88,
      urgency: 'high',
      pattern: 'Every 4 days',
      lastBought: '3 days ago'
    },
    {
      id: 3,
      product: 'Bread',
      category: 'Bakery',
      prediction: 'Need in 4 days',
      confidence: 91,
      urgency: 'medium',
      pattern: 'Every 6 days',
      lastBought: '2 days ago'
    },
    {
      id: 4,
      product: 'Yogurt',
      category: 'Dairy',
      prediction: 'Need in 3 days',
      confidence: 86,
      urgency: 'medium',
      pattern: 'Every 5 days',
      lastBought: '2 days ago'
    },
    {
      id: 5,
      product: 'Chicken',
      category: 'Meat',
      prediction: 'Need in 1 week',
      confidence: 78,
      urgency: 'low',
      pattern: 'Every 10 days',
      lastBought: '3 days ago'
    }
  ];

  const consumptionData = [
    { date: '2024-06-15', milk: 1, bread: 0, bananas: 2, yogurt: 1 },
    { date: '2024-06-16', milk: 0, bread: 1, bananas: 1, yogurt: 0 },
    { date: '2024-06-17', milk: 1, bread: 0, bananas: 2, yogurt: 1 },
    { date: '2024-06-18', milk: 1, bread: 0, bananas: 1, yogurt: 0 },
    { date: '2024-06-19', milk: 0, bread: 1, bananas: 3, yogurt: 1 },
    { date: '2024-06-20', milk: 1, bread: 0, bananas: 1, yogurt: 0 },
    { date: '2024-06-21', milk: 1, bread: 0, bananas: 2, yogurt: 1 }
  ];

  const accuracyData = [
    { product: 'Milk', predicted: 94, actual: 91 },
    { product: 'Bread', predicted: 88, actual: 85 },
    { product: 'Bananas', predicted: 92, actual: 89 },
    { product: 'Yogurt', predicted: 86, actual: 88 },
    { product: 'Chicken', predicted: 78, actual: 82 }
  ];

  const reminders = [
    {
      id: 1,
      type: 'urgent',
      text: 'Milk running low - buy tomorrow',
      time: '2 hours ago',
      icon: AlertTriangle
    },
    {
      id: 2,
      type: 'reminder',
      text: 'Bananas usually bought every 4 days',
      time: '4 hours ago',
      icon: Clock
    },
    {
      id: 3,
      type: 'suggestion',
      text: 'Greek yogurt on sale - stock up?',
      time: '6 hours ago',
      icon: Star
    },
    {
      id: 4,
      type: 'reminder',
      text: 'Bread purchase due in 2 days',
      time: '1 day ago',
      icon: Bell
    }
  ];

  const renderChart = () => {
    switch (chartType) {
      case 'consumption':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={consumptionData}>
              <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <Legend />
              <Line type="monotone" dataKey="milk" stroke="#4f46e5" strokeWidth={2} />
              <Line type="monotone" dataKey="bread" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="bananas" stroke="#f59e0b" strokeWidth={2} />
              <Line type="monotone" dataKey="yogurt" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'accuracy':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={accuracyData}>
              <XAxis dataKey="product" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="predicted" fill="#4f46e5" name="Predicted %" />
              <Bar dataKey="actual" fill="#10b981" name="Actual %" />
            </BarChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  const addToList = (productId) => {
    console.log('Add to shopping list:', productId);
  };

  const setReminder = (productId) => {
    console.log('Set reminder for:', productId);
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'high': return AlertTriangle;
      case 'medium': return Clock;
      case 'low': return CheckCircle;
      default: return Clock;
    }
  };

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header>
        <Title>
          <Brain size={20} />
          Consumption Predictions
        </Title>
        <Controls>
          <ActionButton onClick={() => setShowReminders(!showReminders)}>
            <Bell size={16} />
            Reminders ({reminders.length})
          </ActionButton>
          <ActionButton>
            <Settings size={16} />
            Settings
          </ActionButton>
          <ActionButton>
            <RefreshCw size={16} />
            Refresh
          </ActionButton>
        </Controls>
      </Header>

      <StatsGrid>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <StatCard
              key={stat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: stat.id * 0.1 }}
            >
              <StatIcon color={stat.color}>
                <Icon size={18} />
              </StatIcon>
              <StatValue>{stat.value}</StatValue>
              <StatLabel>{stat.label}</StatLabel>
            </StatCard>
          );
        })}
      </StatsGrid>

      <ContentGrid>
        <PredictionsPanel>
          <PanelHeader>
            <PanelTitle>
              <Lightbulb size={16} />
              Smart Predictions
            </PanelTitle>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              {predictions.length} active
            </span>
          </PanelHeader>
          
          <PredictionsList>
            {predictions.map((prediction, index) => {
              const UrgencyIcon = getUrgencyIcon(prediction.urgency);
              return (
                <PredictionItem
                  key={prediction.id}
                  urgency={prediction.urgency}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UrgencyIcon size={16} color={
                      prediction.urgency === 'high' ? '#ef4444' :
                      prediction.urgency === 'medium' ? '#f59e0b' : '#10b981'
                    } />
                    <PredictionInfo>
                      <ProductName>{prediction.product}</ProductName>
                      <PredictionDetails>
                        <span>{prediction.prediction}</span>
                        <span>•</span>
                        <span>{prediction.pattern}</span>
                        <span>•</span>
                        <span>{prediction.lastBought}</span>
                      </PredictionDetails>
                      <ConfidenceBar>
                        <ConfidenceFill confidence={prediction.confidence} />
                      </ConfidenceBar>
                    </PredictionInfo>
                  </div>
                  
                  <PredictionActions>
                    <MiniButton onClick={() => addToList(prediction.id)}>
                      <ShoppingCart size={10} />
                    </MiniButton>
                    <MiniButton onClick={() => setReminder(prediction.id)}>
                      <Bell size={10} />
                    </MiniButton>
                  </PredictionActions>
                </PredictionItem>
              );
            })}
          </PredictionsList>
        </PredictionsPanel>

        <ChartSection>
          <PanelHeader>
            <PanelTitle>
              <BarChart3 size={16} />
              Analytics
            </PanelTitle>
            <ChartToggle>
              <ToggleButton 
                active={chartType === 'consumption'}
                onClick={() => setChartType('consumption')}
              >
                Consumption
              </ToggleButton>
              <ToggleButton 
                active={chartType === 'accuracy'}
                onClick={() => setChartType('accuracy')}
              >
                Accuracy
              </ToggleButton>
            </ChartToggle>
          </PanelHeader>
          
          <ChartContainer>
            {renderChart()}
          </ChartContainer>
        </ChartSection>
      </ContentGrid>

      <AnimatePresence>
        {showReminders && (
          <RemindersPanel
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
          >
            <RemindersHeader>
              <RemindersTitle>Smart Reminders</RemindersTitle>
              <CloseButton onClick={() => setShowReminders(false)}>
                <X size={16} />
              </CloseButton>
            </RemindersHeader>
            
            <RemindersList>
              {reminders.map((reminder, index) => {
                const Icon = reminder.icon;
                return (
                  <ReminderItem
                    key={reminder.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <ReminderIcon type={reminder.type}>
                      <Icon size={12} />
                    </ReminderIcon>
                    <ReminderContent>
                      <ReminderText>{reminder.text}</ReminderText>
                      <ReminderTime>{reminder.time}</ReminderTime>
                    </ReminderContent>
                  </ReminderItem>
                );
              })}
            </RemindersList>
          </RemindersPanel>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default ConsumptionPredictionReminders;