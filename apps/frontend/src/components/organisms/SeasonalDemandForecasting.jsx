import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import Icon from '../atoms/Icon';
import Typography from '../atoms/Typography';
import Badge from '../atoms/Badge';
import Button from '../atoms/Button';
import Progress from '../atoms/Progress';
import inventoryService from '../../services/inventoryService';
import { useI18n } from '../../hooks/useI18n';

const ForecastingContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4]};
  height: 100%;
  max-width: 1400px;
  margin: 0 auto;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]} 0;
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const TimeRangeSelector = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.background.secondary};
  padding: ${props => props.theme.spacing[1]};
  border-radius: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const TimeRangeButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'active'
})`
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[4]};
  border: none;
  background: ${props => props.active ? props.theme.colors.primary[500] : 'transparent'};
  color: ${props => props.active ? 'white' : props.theme.colors.text.secondary};
  border-radius: ${props => props.theme.spacing[1]};
  cursor: pointer;
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    background: ${props => props.active ? props.theme.colors.primary[600] : props.theme.colors.background.elevated};
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${props => props.theme.spacing[6]};
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const MainPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4]};
`;

const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4]};
`;

const ForecastChart = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
  min-height: 400px;
  position: relative;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const ChartContent = styled.div`
  position: relative;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.spacing[2]};
  border: 2px dashed ${props => props.theme.colors.border.subtle};
`;

const SeasonalPatternsPanel = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]};
  height: fit-content;
`;

const PatternsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[3]};
  margin-top: ${props => props.theme.spacing[4]};
`;

const PatternItem = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['season', 'trend'].includes(prop)
})`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.spacing[2]};
  border-left: 4px solid ${props => getSeasonColor(props.season, props.theme)};
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const PatternIcon = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'season'
})`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => getSeasonGradient(props.season, props.theme)};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
`;

const PatternContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const PatternTitle = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const PatternDescription = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const PatternMetrics = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[3]};
  align-items: center;
`;

const MetricItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.tertiary};
`;

const ForecastSummaryPanel = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]};
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${props => props.theme.spacing[3]};
  margin-top: ${props => props.theme.spacing[4]};
`;

const SummaryCard = styled.div`
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.spacing[2]};
  text-align: center;
`;

const SummaryValue = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'trend'
})`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => getTrendColor(props.trend, props.theme)};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const SummaryLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing[8]};
  text-align: center;
  color: ${props => props.theme.colors.text.secondary};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing[8]};
  text-align: center;
  color: ${props => props.theme.colors.text.secondary};
`;

const AIInsightBadge = styled(Badge)`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary[500]}, ${props => props.theme.colors.primary[600]});
  color: white;
  border: none;
  
  &::before {
    content: '🤖';
    margin-right: ${props => props.theme.spacing[1]};
  }
`;

// Utility functions
const getSeasonColor = (season, theme = {}) => {
  const colors = {
    spring: theme.colors?.green?.[500] || '#10B981',
    summer: theme.colors?.yellow?.[500] || '#F59E0B',
    autumn: theme.colors?.orange?.[500] || '#F97316',
    winter: theme.colors?.blue?.[500] || '#3B82F6',
    holiday: theme.colors?.red?.[500] || '#EF4444'
  };
  return colors[season] || theme.colors?.gray?.[400] || '#6B7280';
};

const getSeasonGradient = (season, theme = {}) => {
  const gradients = {
    spring: `linear-gradient(135deg, ${theme.colors?.green?.[500] || '#10B981'}, ${theme.colors?.green?.[600] || '#059669'})`,
    summer: `linear-gradient(135deg, ${theme.colors?.yellow?.[500] || '#F59E0B'}, ${theme.colors?.yellow?.[600] || '#D97706'})`,
    autumn: `linear-gradient(135deg, ${theme.colors?.orange?.[500] || '#F97316'}, ${theme.colors?.orange?.[600] || '#EA580C'})`,
    winter: `linear-gradient(135deg, ${theme.colors?.blue?.[500] || '#3B82F6'}, ${theme.colors?.blue?.[600] || '#2563EB'})`,
    holiday: `linear-gradient(135deg, ${theme.colors?.red?.[500] || '#EF4444'}, ${theme.colors?.red?.[600] || '#DC2626'})`
  };
  return gradients[season] || gradients.spring;
};

const getSeasonIcon = (season) => {
  const icons = {
    spring: 'flower',
    summer: 'sun',
    autumn: 'leaf',
    winter: 'snowflake',
    holiday: 'gift'
  };
  return icons[season] || 'calendar';
};

const getTrendColor = (trend, theme = {}) => {
  if (trend > 0) return theme.colors?.green?.[600] || '#16A34A';
  if (trend < 0) return theme.colors?.red?.[600] || '#DC2626';
  return theme.colors?.text?.primary || '#374151';
};

const SeasonalDemandForecasting = ({
  onSeasonalAdjust,
  onPatternUpdate,
  onExportForecast,
  autoRefresh = true,
  refreshInterval = 10 * 60 * 1000, // 10 minutes
  className,
  ...props
}) => {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('12m');
  const [forecastData, setForecastData] = useState(null);
  const [seasonalPatterns, setSeasonalPatterns] = useState([]);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Time range options
  const timeRangeOptions = [
    { key: '6m', label: '6 Months' },
    { key: '12m', label: '12 Months' },
    { key: '18m', label: '18 Months' },
    { key: '24m', label: '24 Months' }
  ];

  // Fetch seasonal forecasting data
  const fetchSeasonalData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock seasonal forecasting data
      const mockData = {
        forecast: {
          periods: generateForecastPeriods(timeRange),
          accuracy: 89,
          confidenceRange: '85-93%',
          lastTrained: '2025-08-18'
        },
        patterns: [
          {
            id: 'winter-surge',
            season: 'winter',
            category: 'Electronics',
            trend: 45,
            description: 'Winter holiday surge in electronics demand',
            peakMonths: ['November', 'December'],
            averageIncrease: '45%',
            confidence: 94,
            historicalData: '3 years',
            affectedProducts: ['Gaming Consoles', 'Smart TVs', 'Headphones']
          },
          {
            id: 'spring-clothing',
            season: 'spring',
            category: 'Clothing',
            trend: 32,
            description: 'Spring fashion and wardrobe refresh cycle',
            peakMonths: ['March', 'April', 'May'],
            averageIncrease: '32%',
            confidence: 87,
            historicalData: '5 years',
            affectedProducts: ['Spring Jackets', 'Casual Wear', 'Shoes']
          },
          {
            id: 'summer-outdoors',
            season: 'summer',
            category: 'Sports & Outdoors',
            trend: 78,
            description: 'Summer outdoor activities and sports equipment',
            peakMonths: ['June', 'July', 'August'],
            averageIncrease: '78%',
            confidence: 91,
            historicalData: '4 years',
            affectedProducts: ['Camping Gear', 'Sports Equipment', 'Pool Supplies']
          },
          {
            id: 'autumn-home',
            season: 'autumn',
            category: 'Home & Garden',
            trend: 28,
            description: 'Fall home preparation and gardening supplies',
            peakMonths: ['September', 'October'],
            averageIncrease: '28%',
            confidence: 82,
            historicalData: '3 years',
            affectedProducts: ['Home Decor', 'Gardening Tools', 'Heating Equipment']
          },
          {
            id: 'holiday-gifting',
            season: 'holiday',
            category: 'Gifts & Accessories',
            trend: 156,
            description: 'Holiday gifting season across all categories',
            peakMonths: ['November', 'December'],
            averageIncrease: '156%',
            confidence: 96,
            historicalData: '5 years',
            affectedProducts: ['Gift Cards', 'Jewelry', 'Toys', 'Books']
          }
        ],
        summary: {
          overallTrend: 18.5,
          seasonalImpact: 'High',
          forecastReliability: 89,
          nextPeakSeason: 'Winter Holiday',
          estimatedDemandIncrease: '45%'
        }
      };
      
      setForecastData(mockData.forecast);
      setSeasonalPatterns(mockData.patterns);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch seasonal forecasting data:', err);
      setError(err.message || 'Failed to load seasonal forecasting data');
    } finally {
      setLoading(false);
    }
  };

  // Generate forecast periods based on time range
  const generateForecastPeriods = (range) => {
    const periods = [];
    const months = range === '6m' ? 6 : range === '12m' ? 12 : range === '18m' ? 18 : 24;
    
    for (let i = 0; i < months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      
      // Generate seasonal demand pattern
      const month = date.getMonth();
      const baselineMultiplier = getSeasonalMultiplier(month);
      const baselineDemand = 1000;
      
      periods.push({
        month: date.toLocaleString('default', { month: 'long', year: 'numeric' }),
        forecasted: Math.round(baselineDemand * baselineMultiplier),
        confidence: Math.random() * 10 + 85, // 85-95% confidence
        seasonalFactor: baselineMultiplier,
        trend: (baselineMultiplier - 1) * 100
      });
    }
    
    return periods;
  };

  // Get seasonal multiplier for demand patterns
  const getSeasonalMultiplier = (month) => {
    const seasonalPatterns = {
      0: 0.9,   // January - post-holiday slowdown
      1: 0.95,  // February - gradual recovery
      2: 1.1,   // March - spring surge
      3: 1.15,  // April - spring peak
      4: 1.05,  // May - spring tail
      5: 1.3,   // June - summer start
      6: 1.35,  // July - summer peak
      7: 1.25,  // August - back to school
      8: 1.1,   // September - autumn start
      9: 1.05,  // October - autumn
      10: 1.4,  // November - holiday prep
      11: 1.8   // December - holiday peak
    };
    
    return seasonalPatterns[month] || 1.0;
  };

  // Auto refresh
  useEffect(() => {
    fetchSeasonalData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchSeasonalData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [timeRange, autoRefresh, refreshInterval]);

  // Handle seasonal adjustment
  const handleSeasonalAdjust = (pattern) => {
    console.log('Applying seasonal adjustment for:', pattern);
    onSeasonalAdjust?.(pattern);
  };

  // Handle pattern update
  const handlePatternUpdate = (pattern) => {
    console.log('Updating seasonal pattern:', pattern);
    onPatternUpdate?.(pattern);
  };

  // Loading state
  if (loading && !forecastData) {
    return (
      <ForecastingContainer className={className} {...props}>
        <LoadingState>
          <Icon name="loader" size={48} className="animate-spin" />
          <Typography variant="h6" style={{ marginTop: '1rem' }}>
            Analyzing seasonal patterns...
          </Typography>
          <Typography variant="body2" color="secondary">
            Processing historical data and trend analysis
          </Typography>
        </LoadingState>
      </ForecastingContainer>
    );
  }

  // Error state
  if (error && !forecastData) {
    return (
      <ForecastingContainer className={className} {...props}>
        <EmptyState>
          <Icon name="alert-triangle" size={48} color="error" />
          <Typography variant="h6" style={{ marginTop: '1rem' }}>
            Failed to load seasonal forecasting
          </Typography>
          <Typography variant="body2" color="secondary" style={{ marginBottom: '1rem' }}>
            {error}
          </Typography>
          <Button onClick={fetchSeasonalData}>
            <Icon name="refresh" size={16} />
            Try Again
          </Button>
        </EmptyState>
      </ForecastingContainer>
    );
  }

  return (
    <ForecastingContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
      {...props}
    >
      <HeaderSection>
        <HeaderContent>
          <Icon name="calendar" size={32} />
          <div>
            <Typography variant="h4" weight="bold">
              Seasonal Demand Forecasting
            </Typography>
            <Typography variant="body2" color="secondary">
              {lastUpdated && `Last updated: ${lastUpdated.toLocaleTimeString()}`}
            </Typography>
          </div>
        </HeaderContent>
        <HeaderActions>
          <AIInsightBadge size="lg">
            {forecastData?.accuracy || 89}% Accuracy
          </AIInsightBadge>
          <Button variant="outline" onClick={fetchSeasonalData} disabled={loading}>
            <Icon name={loading ? 'loader' : 'refresh'} size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
          <Button variant="primary" onClick={() => onExportForecast?.(forecastData)}>
            <Icon name="download" size={16} />
            Export
          </Button>
        </HeaderActions>
      </HeaderSection>

      <TimeRangeSelector>
        {timeRangeOptions.map(option => (
          <TimeRangeButton
            key={option.key}
            active={timeRange === option.key}
            onClick={() => setTimeRange(option.key)}
          >
            {option.label}
          </TimeRangeButton>
        ))}
      </TimeRangeSelector>

      <ContentGrid>
        <MainPanel>
          <ForecastChart
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <ChartHeader>
              <Typography variant="h6" weight="semibold">
                Demand Forecast - Next {timeRange === '6m' ? '6' : timeRange === '12m' ? '12' : timeRange === '18m' ? '18' : '24'} Months
              </Typography>
              <Badge variant="info" size="sm">
                {forecastData?.confidenceRange || '85-93%'} Confidence
              </Badge>
            </ChartHeader>
            <ChartContent>
              <div style={{ textAlign: 'center' }}>
                <Icon name="trending-up" size={64} color="primary" />
                <Typography variant="h6" color="secondary" style={{ marginTop: '1rem' }}>
                  Seasonal Demand Chart
                </Typography>
                <Typography variant="body2" color="tertiary" style={{ marginTop: '0.5rem' }}>
                  Interactive chart showing seasonal patterns and forecasts
                </Typography>
                <Typography variant="caption" color="tertiary" style={{ marginTop: '1rem', display: 'block' }}>
                  Chart visualization will be implemented with D3.js or Chart.js
                </Typography>
              </div>
            </ChartContent>
          </ForecastChart>
        </MainPanel>

        <SidePanel>
          <SeasonalPatternsPanel
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Typography variant="h6" weight="semibold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icon name="repeat" size={20} />
              Seasonal Patterns
            </Typography>
            
            <PatternsList>
              <AnimatePresence>
                {seasonalPatterns.map((pattern, index) => (
                  <PatternItem
                    key={pattern.id}
                    season={pattern.season}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <PatternIcon season={pattern.season}>
                      <Icon name={getSeasonIcon(pattern.season)} size={24} />
                    </PatternIcon>
                    <PatternContent>
                      <PatternTitle>
                        {pattern.category} - {pattern.season.charAt(0).toUpperCase() + pattern.season.slice(1)}
                      </PatternTitle>
                      <PatternDescription>
                        {pattern.description}
                      </PatternDescription>
                      <PatternMetrics>
                        <MetricItem>
                          <Icon name="trending-up" size={12} />
                          +{pattern.averageIncrease}
                        </MetricItem>
                        <MetricItem>
                          <Icon name="calendar" size={12} />
                          {pattern.peakMonths.length} months
                        </MetricItem>
                        <MetricItem>
                          <Icon name="check" size={12} />
                          {pattern.confidence}% confidence
                        </MetricItem>
                      </PatternMetrics>
                    </PatternContent>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleSeasonalAdjust(pattern)}
                    >
                      <Icon name="settings" size={16} />
                    </Button>
                  </PatternItem>
                ))}
              </AnimatePresence>
            </PatternsList>
          </SeasonalPatternsPanel>

          <ForecastSummaryPanel
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Typography variant="h6" weight="semibold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icon name="bar-chart" size={20} />
              Forecast Summary
            </Typography>
            
            <SummaryGrid>
              <SummaryCard>
                <SummaryValue trend={18.5}>+18.5%</SummaryValue>
                <SummaryLabel>Overall Trend</SummaryLabel>
              </SummaryCard>
              <SummaryCard>
                <SummaryValue trend={89}>{forecastData?.accuracy || 89}%</SummaryValue>
                <SummaryLabel>Accuracy</SummaryLabel>
              </SummaryCard>
              <SummaryCard>
                <SummaryValue trend={45}>+45%</SummaryValue>
                <SummaryLabel>Next Peak</SummaryLabel>
              </SummaryCard>
              <SummaryCard>
                <SummaryValue trend={0}>High</SummaryValue>
                <SummaryLabel>Impact Level</SummaryLabel>
              </SummaryCard>
            </SummaryGrid>
          </ForecastSummaryPanel>
        </SidePanel>
      </ContentGrid>
    </ForecastingContainer>
  );
};

export default SeasonalDemandForecasting;